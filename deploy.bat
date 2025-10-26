@echo off
echo 🚀 Deploying Mental Health Coach App...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Vercel...
    vercel login
)

REM Set environment variables
echo 🔧 Setting up environment variables...
echo Please set the following environment variables in Vercel dashboard:
echo - JWT_SECRET: your-super-secret-jwt-key
echo - GOOGLE_AI_API_KEY: AIzaSyD2zftsPT3y4To2altLClRrll64HMep-m4
echo - MONGODB_URI: your-mongodb-connection-string

REM Deploy the application
echo 📦 Deploying to Vercel...
vercel --prod

echo ✅ Deployment complete!
echo 🌐 Your app is now live at: https://mental-health-coach-app.vercel.app
echo.
echo 📱 The app is fully responsive and works on both PC and mobile devices.
echo 🤖 AI Chatbot is powered by Google's Gemini AI API.
echo 🔒 All data is securely stored and encrypted.

pause
