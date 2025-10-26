const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Google AI
const genAI = new GoogleGenerativeAI('AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4');

// In-memory storage for testing (replace with MongoDB in production)
let users = [];
let activities = [
  {
    _id: '1',
    title: "5-Minute Box Breathing",
    description: "A simple technique to calm your nervous system.",
    category: "breathing",
    duration: 5,
    instructions: "Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat.",
    benefits: ["Reduces stress", "Improves focus", "Calms nervous system"],
    tags: ["beginner", "quick", "stress-relief"]
  },
  {
    _id: '2',
    title: "Mindful Body Scan",
    description: "Tune into your body's sensations without judgment.",
    category: "mindfulness",
    duration: 10,
    instructions: "Lie down comfortably and slowly scan your body from head to toe, noticing sensations.",
    benefits: ["Body awareness", "Stress reduction", "Better sleep"],
    tags: ["relaxation", "body-awareness", "sleep"]
  },
  {
    _id: '3',
    title: "Three Good Things",
    description: "Reflect on three positive moments from your day.",
    category: "gratitude",
    duration: 5,
    instructions: "Write down three things that went well today, no matter how small.",
    benefits: ["Positive mindset", "Gratitude practice", "Mood improvement"],
    tags: ["gratitude", "journaling", "positivity"]
  },
  {
    _id: '4',
    title: "Mindful Walking",
    description: "Connect with your surroundings and your breath.",
    category: "movement",
    duration: 15,
    instructions: "Walk slowly and mindfully, paying attention to each step and your surroundings.",
    benefits: ["Physical activity", "Mindfulness", "Nature connection"],
    tags: ["movement", "mindfulness", "outdoor"]
  }
];

let progress = [];
let goals = [];
let achievements = [];
let communityPosts = [];
let chatSessions = [];

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, 'your-super-secret-jwt-key-for-anchorpoint');
    const user = users.find(u => u.id === decoded.userId);
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

// Basic route
app.get('/', (req, res) => {
  res.send('AnchorPoint Mental Health Coach Backend is running!');
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      personalityType: 'balanced',
      preferences: {
        notifications: true,
        darkMode: false,
        reminderTimes: {
          dailyCheckin: '09:00',
          mindfulness: '13:00',
          activityPrompts: '18:00'
        }
      },
      createdAt: new Date()
    };
    
    users.push(user);

    const token = jwt.sign({ userId: user.id }, 'your-super-secret-jwt-key-for-anchorpoint');
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'your-super-secret-jwt-key-for-anchorpoint');
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = { ...req.user };
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Activities Routes
app.get('/api/activities', async (req, res) => {
  try {
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/activities/recommended', authenticateToken, async (req, res) => {
  try {
    res.json(activities.slice(0, 6));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Progress Routes
app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { activityId, moodBefore, moodAfter, notes, duration } = req.body;
    
    const progressEntry = {
      id: Date.now().toString(),
      userId: req.user.id,
      activityId,
      moodBefore,
      moodAfter,
      notes,
      duration,
      completedAt: new Date()
    };
    
    progress.push(progressEntry);
    res.json({ message: 'Progress saved successfully', progress: progressEntry });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const userProgress = progress.filter(p => p.userId === req.user.id);
    res.json(userProgress);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Goals Routes
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const userGoals = goals.filter(g => g.userId === req.user.id);
    res.json(userGoals);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, targetValue, unit, deadline } = req.body;
    
    const goal = {
      id: Date.now().toString(),
      userId: req.user.id,
      title,
      description,
      category,
      targetValue,
      currentValue: 0,
      unit,
      deadline: deadline ? new Date(deadline) : null,
      isCompleted: false,
      createdAt: new Date()
    };
    
    goals.push(goal);
    res.json({ message: 'Goal created successfully', goal });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Achievements Routes
app.get('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const userAchievements = achievements.filter(a => a.userId === req.user.id);
    res.json(userAchievements);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Community Routes
app.get('/api/community/posts', async (req, res) => {
  try {
    res.json(communityPosts.slice(0, 20));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/community/posts', authenticateToken, async (req, res) => {
  try {
    const { content, isAnonymous, tags } = req.body;
    
    const post = {
      id: Date.now().toString(),
      userId: req.user.id,
      userName: req.user.name,
      content,
      isAnonymous,
      tags,
      likes: [],
      comments: [],
      createdAt: new Date()
    };
    
    communityPosts.unshift(post);
    res.json({ message: 'Post created successfully', post });
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
    
    // Get user context
    const userProgress = progress.filter(p => p.userId === req.user.id).slice(0, 5);
    const userGoals = goals.filter(g => g.userId === req.user.id).slice(0, 3);
    
    const userContext = {
      name: req.user.name,
      personalityType: req.user.personalityType,
      recentProgress: userProgress,
      currentGoals: userGoals
    };
    
    // Generate AI response
    const aiResponse = await generateAIResponse(message, userContext);
    
    res.json({ 
      message: aiResponse,
      sessionId: 'session-' + Date.now()
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/chat/history', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Quiz Routes
app.post('/api/quiz/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    
    // Calculate personality type
    const personalityType = 'balanced'; // Simplified for now
    
    // Update user's personality type
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex !== -1) {
      users[userIndex].personalityType = personalityType;
    }
    
    res.json({ personalityType });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AnchorPoint server running on port ${PORT}`);
  console.log(`📱 Frontend available at: http://localhost:${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
});

module.exports = app;
