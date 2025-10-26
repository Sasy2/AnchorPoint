# Mental Health Coach App - Full Stack Application

A comprehensive mental health support application with backend API, AI chatbot integration, and mobile-responsive design.

## 🚀 Live Demo

**Website URL**: [https://mental-health-coach-app.vercel.app](https://mental-health-coach-app.vercel.app)

The application is fully functional and can be used on both PC and mobile devices.

## 🌟 Features

### Backend Functionality
- **RESTful API** with Express.js and MongoDB
- **User Authentication** with JWT tokens
- **AI Chatbot** powered by Google's Gemini AI
- **Real-time Data** persistence and retrieval
- **Achievement System** with automatic badge unlocking
- **Community Features** with posts and interactions

### Frontend Features
- **Responsive Design** - Works perfectly on PC and mobile
- **Authentication System** - Login/Register with secure sessions
- **Interactive Activities** - Breathing exercises, mood tracking, journaling
- **AI Chatbot** - 24/7 mental health support
- **Progress Tracking** - Visual mood sliders and progress history
- **Community Space** - Safe sharing with guidelines
- **Goals & Achievements** - Personal goal setting and tracking
- **Dark Mode** - Toggle between light and dark themes

### AI Integration
- **Google AI API** (Gemini Pro) for intelligent responses
- **Contextual Conversations** based on user's mental health journey
- **Personalized Recommendations** based on user data
- **Safe AI Guidelines** - No medical advice, supportive responses only

## 🛠️ Technical Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Generative AI** (Gemini Pro)
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **HTML5** with semantic markup
- **CSS3** with Tailwind CSS
- **JavaScript** (ES6+) with modern APIs
- **Material Design Icons**
- **Progressive Web App** features

### Database Models
- **Users** - Authentication and preferences
- **Activities** - Mental health exercises
- **Progress** - Mood tracking and activity completion
- **Goals** - Personal wellness objectives
- **Achievements** - Badge system
- **Community Posts** - Social sharing
- **Chat Sessions** - AI conversation history

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Mobile Phones** (320px - 768px)
- **Tablets** (768px - 1024px)
- **Desktop** (1024px+)
- **Large Screens** (1280px+)

### Mobile Features
- Touch-friendly interface
- Swipe gestures for navigation
- Optimized form inputs
- Responsive images and layouts
- Mobile-specific UI components

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google AI API key

### Backend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if running locally)
mongod

# Start the server
npm start
# or for development
npm run dev
```

### Frontend Setup
```bash
# The frontend is static HTML/CSS/JS
# Simply open index.html in a browser
# or serve with any static file server

# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using Live Server (VS Code extension)
# Right-click index.html -> "Open with Live Server"
```

## 🌐 Deployment

### Backend Deployment (Heroku/Railway/Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
vercel --prod

# Set environment variables in your hosting platform
```

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**
- **Firebase Hosting**

## 🔑 Environment Variables

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mentalhealthcoach
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_AI_API_KEY=AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/preferences` - Update user preferences

### Activities
- `GET /api/activities` - Get all activities
- `GET /api/activities/recommended` - Get personalized recommendations

### Progress Tracking
- `POST /api/progress` - Save activity progress
- `GET /api/progress` - Get user's progress history

### Goals & Achievements
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `GET /api/achievements` - Get user achievements

### Community
- `GET /api/community/posts` - Get community posts
- `POST /api/community/posts` - Create new post
- `POST /api/community/posts/:id/like` - Like/unlike post

### AI Chatbot
- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get chat history

### Quiz
- `POST /api/quiz/submit` - Submit personality quiz

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** with bcryptjs
- **CORS Protection** for cross-origin requests
- **Input Validation** and sanitization
- **Rate Limiting** (configurable)
- **No Medical Advice** policy in AI responses
- **Anonymous Posting** option in community
- **Data Privacy** - all data stored securely

## 🎯 Usage Guide

### For Users
1. **Register/Login** - Create account or sign in
2. **Mood Check-in** - Select current mood
3. **Choose Activities** - Get personalized recommendations
4. **Complete Exercises** - Follow guided activities
5. **Track Progress** - Record mood changes
6. **Set Goals** - Create personal wellness objectives
7. **Chat with AI** - Get 24/7 mental health support
8. **Join Community** - Share experiences safely

### For Developers
1. **Clone Repository** - Get the source code
2. **Set Up Backend** - Configure database and API keys
3. **Install Dependencies** - Run npm install
4. **Start Development** - Use npm run dev
5. **Test Features** - Verify all functionality
6. **Deploy** - Push to production

## 🆘 Emergency Resources

The app includes quick access to crisis support:
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HOME to 741741
- **Emergency Services**: 911

## 📄 License

This project is for educational and demonstration purposes. Please ensure any production use includes proper medical disclaimers and professional oversight.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows the existing style
- All features are tested
- Documentation is updated
- Security best practices are followed

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Remember**: This app is not a substitute for professional mental health care. Always consult with qualified healthcare providers for medical advice.

**Live Demo**: [https://mental-health-coach-app.vercel.app](https://mental-health-coach-app.vercel.app)