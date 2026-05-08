# Deployment Guide

This project is currently a Create React App frontend and an Express backend.
Use these services:

- Frontend: Vercel
- Backend: Render Web Service
- Database: Railway MySQL

## 1. Railway MySQL

1. Create a Railway project.
2. Add a MySQL database.
3. Open the MySQL service variables and copy:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
4. Import the schema:

```bash
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -p MYSQLDATABASE < backend/database.sql
```

If Railway gives you a public `DATABASE_URL`, you can still use the individual MySQL variables above in Render.

## 2. Render Backend

Create a new Render Web Service from the repository.

Settings:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

Environment variables:

```env
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app

DB_HOST=MYSQLHOST_FROM_RAILWAY
DB_PORT=MYSQLPORT_FROM_RAILWAY
DB_USER=MYSQLUSER_FROM_RAILWAY
DB_PASSWORD=MYSQLPASSWORD_FROM_RAILWAY
DB_NAME=MYSQLDATABASE_FROM_RAILWAY
DB_SSL=false

JWT_SECRET=use_a_long_random_secret

SMTP_EMAIL=your_gmail_address@gmail.com
SMTP_PASSWORD=your_gmail_app_password

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Deploy, then test:

```bash
curl https://your-backend.onrender.com/health
```

Expected response:

```json
{"status":"ok"}
```

## 3. Vercel Frontend

Create a new Vercel project from the repository.

Settings:

```text
Root Directory: frontend
Framework Preset: Create React App
Install Command: npm install
Build Command: npm run build
Output Directory: build
```

Environment variables:

```env
REACT_APP_API_URL=https://your-backend.onrender.com
```

Deploy the frontend. After Vercel gives you the final URL, copy it into Render as `FRONTEND_URL` and redeploy the backend so CORS allows the real production frontend.

## 4. Local Commands

Backend:

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
```

## 5. Razorpay

Use test keys while testing. For production payments:

1. Switch Razorpay account to live mode.
2. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Render.
3. Redeploy the Render service.
4. Verify payment flow from the deployed Vercel frontend.
