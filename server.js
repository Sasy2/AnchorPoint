const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Google AI
const genAI = new GoogleGenerativeAI(config.GOOGLE_AI_API_KEY);

// MongoDB connection
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Database Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  personalityType: { type: String, default: 'balanced' },
  preferences: {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    reminderTimes: {
      dailyCheckin: { type: String, default: '09:00' },
      mindfulness: { type: String, default: '13:00' },
      activityPrompts: { type: String, default: '18:00' }
    }
  },
  createdAt: { type: Date, default: Date.now }
});

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, default: 5 }, // in minutes
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  imageUrl: { type: String },
  instructions: { type: String },
  benefits: [String],
  tags: [String],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const ProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
  moodBefore: { type: Number, required: true, min: 1, max: 10 },
  moodAfter: { type: Number, required: true, min: 1, max: 10 },
  notes: { type: String },
  duration: { type: Number }, // actual duration in minutes
  completedAt: { type: Date, default: Date.now }
});

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, required: true },
  deadline: { type: Date },
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  iconUrl: { type: String },
  category: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now }
});

const CommunityPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  tags: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const ChatSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Activity = mongoose.model('Activity', ActivitySchema);
const Progress = mongoose.model('Progress', ProgressSchema);
const Goal = mongoose.model('Goal', GoalSchema);
const Achievement = mongoose.model('Achievement', AchievementSchema);
const CommunityPost = mongoose.model('CommunityPost', CommunityPostSchema);
const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// AI Chatbot functionality
const generateAIResponse = async (message, userContext = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
You are a compassionate mental health coach AI assistant. Your role is to provide supportive, empathetic, and helpful responses to users seeking mental health guidance.

User Context: ${JSON.stringify(userContext)}
User Message: ${message}

Guidelines:
- Be empathetic and non-judgmental
- Provide practical, evidence-based suggestions
- Encourage professional help when appropriate
- Use a warm, supportive tone
- Keep responses concise but helpful
- Never provide medical diagnoses
- Always remind users that you're an AI assistant, not a replacement for professional therapy

Respond as a caring mental health coach:
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('AI API Error:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later, and remember that I'm here to support you.";
  }
};

// Routes

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'AnchorPoint Mental Health Coach API is running!',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'API is healthy',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, config.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;
    await User.findByIdAndUpdate(req.user._id, { preferences });
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Activities Routes
app.get('/api/activities', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const activities = await Activity.find(query).sort({ createdAt: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/activities/recommended', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userProgress = await Progress.find({ userId: user._id }).sort({ completedAt: -1 }).limit(10);
    
    // Simple recommendation logic based on user's personality and recent activities
    let recommendedActivities = await Activity.find({ isActive: true });
    
    // Filter based on user's personality type
    if (user.personalityType === 'calm-seeker') {
      recommendedActivities = recommendedActivities.filter(a => 
        ['breathing', 'mindfulness'].includes(a.category)
      );
    } else if (user.personalityType === 'active-energizer') {
      recommendedActivities = recommendedActivities.filter(a => 
        ['movement', 'breathing'].includes(a.category)
      );
    }
    
    res.json(recommendedActivities.slice(0, 6));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Progress Routes
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { activityId, moodBefore, moodAfter, notes, duration } = req.body;
    
    const progress = new Progress({
      userId: req.user._id,
      activityId,
      moodBefore,
      moodAfter,
      notes,
      duration
    });
    
    await progress.save();
    
    // Check for achievements
    await checkAchievements(req.user._id);
    
    res.json({ message: 'Progress saved successfully', progress });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.user._id })
      .populate('activityId')
      .sort({ completedAt: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Goals Routes
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, targetValue, unit, deadline } = req.body;
    
    const goal = new Goal({
      userId: req.user._id,
      title,
      description,
      category,
      targetValue,
      unit,
      deadline: deadline ? new Date(deadline) : null
    });
    
    await goal.save();
    res.json({ message: 'Goal created successfully', goal });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
  try {
    const { currentValue, isCompleted } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { currentValue, isCompleted },
      { new: true }
    );
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ message: 'Goal updated successfully', goal });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Achievements Routes
app.get('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user._id }).sort({ earnedAt: -1 });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Community Routes
app.get('/api/community/posts', async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const { content, isAnonymous, tags } = req.body;
    
    const post = new CommunityPost({
      userId: req.user._id,
      content,
      isAnonymous,
      tags
    });
    
    await post.save();
    await post.populate('userId', 'name');
    
    res.json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/community/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const hasLiked = post.likes.includes(req.user._id);
    if (hasLiked) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.json({ message: 'Like updated', likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// AI Chatbot Routes
app.post('/api/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create chat session
    let chatSession = await ChatSession.findOne({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    
    if (!chatSession) {
      chatSession = new ChatSession({ userId: req.user._id });
    }
    
    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message
    });
    
    // Get user context for AI
    const userProgress = await Progress.find({ userId: req.user._id }).limit(5);
    const userGoals = await Goal.find({ userId: req.user._id }).limit(3);
    
    const userContext = {
      name: req.user.name,
      personalityType: req.user.personalityType,
      recentProgress: userProgress,
      currentGoals: userGoals
    };
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, userContext);
    
    // Add AI response
    chatSession.messages.push({
      role: 'assistant',
      content: aiResponse
    });
    
    chatSession.updatedAt = new Date();
    await chatSession.save();
    
    res.json({ 
      message: aiResponse,
      sessionId: chatSession._id
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    const chatSession = await ChatSession.findOne({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    
    res.json(chatSession ? chatSession.messages : []);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Quiz Routes
app.post('/api/quiz/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Calculate personality type
    const personalityType = calculatePersonalityType(answers);
    
    // Update user's personality type
    await User.findByIdAndUpdate(req.user._id, { personalityType });
    
    res.json({ personalityType });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper Functions
const calculatePersonalityType = (answers) => {
  const types = {
    'calm-seeker': 0,
    'social-connector': 0,
    'creative-explorer': 0,
    'active-energizer': 0
  };
  
  Object.values(answers).forEach(answer => {
    switch(answer) {
      case 0: types['calm-seeker']++; break;
      case 1: types['social-connector']++; break;
      case 2: types['creative-explorer']++; break;
      case 3: types['active-energizer']++; break;
    }
  });
  
  return Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
};

const checkAchievements = async (userId) => {
  try {
    const progress = await Progress.find({ userId });
    const achievements = await Achievement.find({ userId });
    
    // First activity achievement
    if (progress.length === 1 && !achievements.some(a => a.title === 'First Step')) {
      await Achievement.create({
        userId,
        title: 'First Step',
        description: 'Completed your first activity!',
        category: 'milestone',
        iconUrl: 'https://example.com/first-step.png'
      });
    }
    
    // 7-day streak achievement
    if (progress.length >= 7 && !achievements.some(a => a.title === '7-Day Streak')) {
      await Achievement.create({
        userId,
        title: '7-Day Streak',
        description: 'Completed activities for 7 consecutive days!',
        category: 'consistency',
        iconUrl: 'https://example.com/streak.png'
      });
    }
    
    // Mood improvement achievement
    const improvedMoods = progress.filter(p => p.moodAfter > p.moodBefore);
    if (improvedMoods.length >= 5 && !achievements.some(a => a.title === 'Mood Booster')) {
      await Achievement.create({
        userId,
        title: 'Mood Booster',
        description: 'Improved your mood 5 times through activities!',
        category: 'wellness',
        iconUrl: 'https://example.com/mood-boost.png'
      });
    }
  } catch (error) {
    console.error('Achievement check error:', error);
  }
};

// Initialize sample data
const initializeSampleData = async () => {
  try {
    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      const sampleActivities = [
        {
          title: "5-Minute Box Breathing",
          description: "A simple technique to calm your nervous system.",
          category: "breathing",
          duration: 5,
          instructions: "Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat.",
          benefits: ["Reduces stress", "Improves focus", "Calms nervous system"],
          tags: ["beginner", "quick", "stress-relief"]
        },
        {
          title: "Mindful Body Scan",
          description: "Tune into your body's sensations without judgment.",
          category: "mindfulness",
          duration: 10,
          instructions: "Lie down comfortably and slowly scan your body from head to toe, noticing sensations.",
          benefits: ["Body awareness", "Stress reduction", "Better sleep"],
          tags: ["relaxation", "body-awareness", "sleep"]
        },
        {
          title: "Three Good Things",
          description: "Reflect on three positive moments from your day.",
          category: "gratitude",
          duration: 5,
          instructions: "Write down three things that went well today, no matter how small.",
          benefits: ["Positive mindset", "Gratitude practice", "Mood improvement"],
          tags: ["gratitude", "journaling", "positivity"]
        },
        {
          title: "Mindful Walking",
          description: "Connect with your surroundings and your breath.",
          category: "movement",
          duration: 15,
          instructions: "Walk slowly and mindfully, paying attention to each step and your surroundings.",
          benefits: ["Physical activity", "Mindfulness", "Nature connection"],
          tags: ["movement", "mindfulness", "outdoor"]
        }
      ];
      
      await Activity.insertMany(sampleActivities);
      console.log('Sample activities created');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// For Vercel serverless deployment
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  // For Vercel, don't use app.listen()
  module.exports = app;
} else {
  // For local development, start the server normally
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeSampleData();
  });
}
