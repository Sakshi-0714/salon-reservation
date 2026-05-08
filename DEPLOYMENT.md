# Salon Reservation System - Deployment Guide

**Tech Stack:**
- Frontend: React + Vite → Vercel
- Backend: Node.js + Express → Render
- Database: MySQL → Railway

## Prerequisites

1. **Railway Account**: [railway.app](https://railway.app)
2. **Render Account**: [render.com](https://render.com)
3. **Vercel Account**: [vercel.com](https://vercel.com)
4. **Razorpay Account**: [razorpay.com](https://razorpay.com) (for payments)
5. **GitHub Repository**: Push your code to GitHub

## 1. Database Setup (Railway MySQL)

### Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Provision MySQL"
3. Wait for the database to be created
4. Go to the "Variables" tab in your MySQL service
5. Copy these environment variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`

### Import Database Schema
1. Open Railway MySQL query tab
2. Copy and paste the contents of `backend/database.sql`
3. Run the query to create tables

## 2. Backend Deployment (Render)

### Create Render Web Service
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:

```
Name: salon-backend
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### Environment Variables for Render
Add these environment variables in Render dashboard:

```
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app

DB_HOST=YOUR_MYSQLHOST_FROM_RAILWAY
DB_PORT=YOUR_MYSQLPORT_FROM_RAILWAY
DB_USER=YOUR_MYSQLUSER_FROM_RAILWAY
DB_PASSWORD=YOUR_MYSQLPASSWORD_FROM_RAILWAY
DB_NAME=YOUR_MYSQLDATABASE_FROM_RAILWAY
DB_SSL=false
DB_CONNECTION_LIMIT=5

JWT_SECRET=your_super_secure_random_jwt_secret_here

SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Generate Secure JWT Secret
Run this command to generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### Gmail App Password Setup
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use that password in SMTP_PASSWORD

### Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy the backend URL (e.g., `https://salon-backend.onrender.com`)

## 3. Frontend Deployment (Vercel)

### Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Environment Variables for Vercel
Add this environment variable:

```
VITE_API_URL=https://your-backend.onrender.com
```

### Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy the frontend URL (e.g., `https://salon-reservation.vercel.app`)

## 4. Update CORS Configuration

### Update Backend Environment Variables
1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL:
```
FRONTEND_URL=https://your-frontend.vercel.app
```
3. Trigger a new deployment to apply CORS changes

## 5. Testing Deployment

### Test Backend Health
```bash
curl https://your-backend.onrender.com/health
```
Expected response: `{"status":"ok"}`

### Test Frontend
1. Visit your Vercel URL
2. Try registering a new user
3. Check if API calls work

## 6. Domain Configuration (Optional)

### Custom Domain for Frontend
1. In Vercel dashboard, go to your project
2. Go to "Settings" → "Domains"
3. Add your custom domain

### Custom Domain for Backend
1. In Render dashboard, go to your service
2. Go to "Settings" → "Custom Domains"
3. Add your custom domain

## 7. Environment Variables Summary

### Backend (.env for local development)
```
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=salon_db
DB_SSL=false

JWT_SECRET=your_jwt_secret
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend (.env for local development)
```
VITE_API_URL=http://localhost:5000
```

## 8. Troubleshooting

### Database Connection Issues
- Ensure Railway MySQL is running
- Check environment variables are correctly set
- Verify DB_SSL=false for Railway

### CORS Issues
- Make sure FRONTEND_URL in backend matches your Vercel URL exactly
- Include protocol (https://) and no trailing slash

### Build Failures
- Check that all dependencies are listed in package.json
- Ensure Node.js version compatibility
- Check build logs for specific errors

### Payment Issues
- Verify Razorpay keys are correct
- Ensure webhook endpoints are configured if needed

## 9. Local Development Setup

### Backend
```bash
cd backend
npm install
# Set up local MySQL database
# Update .env with local database credentials
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Update .env with VITE_API_URL
npm run dev
```

## 10. Monitoring and Maintenance

### Render
- Monitor logs in Render dashboard
- Set up health checks
- Configure auto-scaling if needed

### Railway
- Monitor database performance
- Set up backups
- Check connection limits

### Vercel
- Monitor build times and success rates
- Set up preview deployments for staging

---

**Note:** Always test thoroughly after deployment. Check all features including user registration, login, booking appointments, and payment processing.

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm start
```

Production build check:

```bash
cd frontend
npm run build
