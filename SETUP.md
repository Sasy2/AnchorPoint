# Mental Health Coach App - Setup & Deployment Guide

## 🚀 Quick Start

### Option 1: Use the Live Demo
**Website URL**: [https://mental-health-coach-app.vercel.app](https://mental-health-coach-app.vercel.app)

The application is already deployed and fully functional. You can use it immediately on both PC and mobile devices.

### Option 2: Deploy Your Own Instance

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB account (free tier available)
- Google AI API key (provided: `AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4`)
- Git (for version control)

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mental-health-coach-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mentalhealthcoach
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GOOGLE_AI_API_KEY=AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4
```

### 4. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) - recommended
# Get connection string from https://cloud.mongodb.com
```

### 5. Start the Application
```bash
# Start backend server
npm start

# In another terminal, serve frontend
cd public
python -m http.server 8000
# or
npx serve .
```

### 6. Access the Application
- Frontend: http://localhost:8000
- Backend API: http://localhost:3000/api

## 🌐 Production Deployment

### Deploy to Vercel (Recommended)

#### Method 1: Using Deployment Scripts
```bash
# For Linux/Mac
chmod +x deploy.sh
./deploy.sh

# For Windows
deploy.bat
```

#### Method 2: Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Method 3: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables:
   - `JWT_SECRET`: your-super-secret-jwt-key
   - `GOOGLE_AI_API_KEY`: AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4
   - `MONGODB_URI`: your-mongodb-connection-string
4. Deploy

### Deploy to Other Platforms

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set GOOGLE_AI_API_KEY=AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

## 🔧 Configuration

### MongoDB Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Get connection string
4. Add to environment variables

### Google AI API
The API key `AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4` is already configured and ready to use.

### Custom Domain (Optional)
1. Add your domain in Vercel dashboard
2. Update DNS records
3. SSL certificate is automatically provided

## 📱 Mobile Optimization

The app is fully responsive and includes:
- Touch-friendly interface
- Mobile-optimized forms
- Responsive images
- Swipe gestures
- Mobile-specific UI components

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Rate limiting
- Secure environment variables

## 🧪 Testing

### Manual Testing
1. Register a new account
2. Complete the personality quiz
3. Try different activities
4. Track your progress
5. Chat with the AI
6. Post in the community

### API Testing
```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Test AI chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Hello, I need help with anxiety"}'
```

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
mongod --version

# Check connection string format
mongodb+srv://username:password@cluster.mongodb.net/database
```

#### 2. API Key Issues
- Verify the Google AI API key is correct
- Check if the API key has proper permissions
- Ensure the key is set in environment variables

#### 3. CORS Errors
- Check if the frontend URL is allowed in CORS settings
- Verify the API base URL in `public/js/api.js`

#### 4. Authentication Issues
- Clear browser localStorage
- Check JWT token expiration
- Verify user registration/login flow

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start
```

## 📊 Monitoring

### Vercel Analytics
- Built-in analytics in Vercel dashboard
- Performance monitoring
- Error tracking

### MongoDB Monitoring
- Atlas provides built-in monitoring
- Query performance insights
- Database metrics

## 🔄 Updates & Maintenance

### Regular Updates
1. Update dependencies: `npm update`
2. Test all functionality
3. Deploy to staging first
4. Deploy to production

### Database Maintenance
- Regular backups
- Monitor performance
- Clean up old data

## 📞 Support

### Technical Support
- Check the documentation
- Review error logs
- Test with different browsers/devices

### User Support
- Provide clear instructions
- Include troubleshooting steps
- Offer alternative solutions

## 🎯 Performance Optimization

### Frontend
- Minify CSS/JS
- Optimize images
- Use CDN for static assets
- Enable browser caching

### Backend
- Database indexing
- Query optimization
- Caching strategies
- Load balancing

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Input validation implemented
- [ ] Authentication working
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Error handling implemented
- [ ] Logging configured

---

## 🎉 Success!

Your Mental Health Coach App is now deployed and ready to help users on their mental health journey!

**Live Demo**: [https://mental-health-coach-app.vercel.app](https://mental-health-coach-app.vercel.app)

The application includes:
- ✅ Full backend functionality
- ✅ AI chatbot integration
- ✅ Mobile-responsive design
- ✅ User authentication
- ✅ Progress tracking
- ✅ Community features
- ✅ Goals and achievements
- ✅ Real-time data persistence
