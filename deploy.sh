#!/bin/bash

# Mental Health Coach App Deployment Script

echo "🚀 Deploying Mental Health Coach App..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Set environment variables
echo "🔧 Setting up environment variables..."
vercel env add JWT_SECRET
vercel env add GOOGLE_AI_API_KEY
vercel env add MONGODB_URI

# Deploy the application
echo "📦 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://mental-health-coach-app.vercel.app"
echo ""
echo "📱 The app is fully responsive and works on both PC and mobile devices."
echo "🤖 AI Chatbot is powered by Google's Gemini AI API."
echo "🔒 All data is securely stored and encrypted."
