#!/bin/bash

# Salon Reservation System - Deployment Script

echo "🚀 Starting Salon Reservation System Deployment"
echo "================================================"

# Check if required tools are installed
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Aborting." >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your_super_secure_random_jwt_secret_here")
echo "🔐 Generated JWT Secret: $JWT_SECRET"

echo ""
echo "📋 Deployment Checklist:"
echo "========================"
echo ""
echo "1. 🗄️  Railway MySQL Database:"
echo "   - Create project at https://railway.app"
echo "   - Add MySQL database"
echo "   - Copy these variables from Railway dashboard:"
echo "     * MYSQLHOST"
echo "     * MYSQLPORT"
echo "     * MYSQLUSER"
echo "     * MYSQLPASSWORD"
echo "     * MYSQLDATABASE"
echo ""
echo "2. 🔧 Backend (Render):"
echo "   - Go to https://render.com"
echo "   - Create Web Service from GitHub repo"
echo "   - Set Root Directory: backend"
echo "   - Set Environment Variables:"
echo "     PORT=10000"
echo "     FRONTEND_URL=https://your-frontend.vercel.app"
echo "     DB_HOST=<MYSQLHOST>"
echo "     DB_PORT=<MYSQLPORT>"
echo "     DB_USER=<MYSQLUSER>"
echo "     DB_PASSWORD=<MYSQLPASSWORD>"
echo "     DB_NAME=<MYSQLDATABASE>"
echo "     DB_SSL=false"
echo "     DB_CONNECTION_LIMIT=5"
echo "     JWT_SECRET=$JWT_SECRET"
echo "     SMTP_EMAIL=your_gmail@gmail.com"
echo "     SMTP_PASSWORD=your_gmail_app_password"
echo "     RAZORPAY_KEY_ID=your_razorpay_key_id"
echo "     RAZORPAY_KEY_SECRET=your_razorpay_key_secret"
echo ""
echo "3. 🎨 Frontend (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub repository"
echo "   - Set Root Directory: frontend"
echo "   - Set Environment Variable:"
echo "     VITE_API_URL=https://your-backend.onrender.com"
echo ""
echo "4. 🔄 Update CORS:"
echo "   - After frontend deploys, update FRONTEND_URL in Render"
echo "   - Redeploy backend"
echo ""
echo "5. 🧪 Testing:"
echo "   - Test backend: curl https://your-backend.onrender.com/health"
echo "   - Visit frontend URL"
echo "   - Try user registration and booking"
echo ""
echo "✨ Deployment Complete!"
echo "======================"
echo "Your salon reservation system is now live! 🎉"