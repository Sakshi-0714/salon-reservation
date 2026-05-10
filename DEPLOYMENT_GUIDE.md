# Salon Reservation System - Complete Cloud Deployment Guide

## Overview
This guide covers complete deployment of the Salon Reservation System on:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Railway MySQL
- **Payments**: Razorpay (Test Mode)
- **SMS**: Mock SMS (backend log simulation)

## Prerequisites

1. **GitHub Account**: Both projects must be pushed to GitHub
2. **Vercel Account**: https://vercel.com
3. **Render Account**: https://render.com
4. **Railway Account**: https://railway.app
5. **Razorpay Account**: https://razorpay.com (Test keys)
6. **Mock SMS**: No external SMS provider is required; success messages are logged by the backend.

---

## STEP 1: Prepare Backend for Deployment

### 1.1 Install Dependencies
```bash
cd backend
npm install
```

This will install all required packages.

### 1.2 Verify Database Schema
Before deploying, ensure the database has all required tables. Run the migration SQL:

```bash
# When connected to Railway MySQL, run:
source backend/database.sql
```

**Key Tables:**
- `users` - User accounts
- `appointments` - Booking records
- `services` - Service catalog
- `bills` - Generated bills
- `staff` - Staff assignments
- `reviews` - Customer reviews
- `verification_codes` - OTP codes

### 1.3 Environment Variables Setup

Create a `.env` file in the backend directory (or use the Render environment variables panel):

```
# Database
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<railway-password>
DB_NAME=salon_db

# Razorpay
RAZORPAY_KEY_ID=rzp_test_<your_test_key_id>
RAZORPAY_KEY_SECRET=<your_test_key_secret>

# Mock SMS
Mock SMS is simulated via backend logging; no external credentials are required.

# Email
SMTP_EMAIL=<your-gmail@gmail.com>
SMTP_PASSWORD=<gmail-app-password>

# Frontend
FRONTEND_URL=https://your-salon-app.vercel.app

# Server
PORT=5000
NODE_ENV=production
```

### 1.4 Push Backend to GitHub

```bash
cd backend
git add .
git commit -m "Add SMS integration and cloud deployment configuration"
git push origin main
```

---

## STEP 2: Deploy Database on Railway MySQL

### 2.1 Create Railway MySQL Database

1. Go to https://railway.app
2. Login/Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL" (or MySQL if available)
4. Click "MySQL" to select MySQL
5. Wait for deployment to complete

### 2.2 Get Connection Details

In the Railway dashboard:
1. Click on your MySQL database
2. Go to "Connect" tab
3. Copy the following details:
   - `DB_HOST`: Railway MySQL URL
   - `DB_USER`: root
   - `DB_PASSWORD`: Auto-generated password

### 2.3 Initialize Database Schema

1. Open MySQL Workbench or use Railway's built-in console
2. Connect using the details from Step 2.2
3. Copy and paste the entire content of `backend/database.sql`
4. Execute to create all tables

---

## STEP 3: Set Up Razorpay (Test Mode)

### 3.1 Get Test Keys

1. Go to https://dashboard.razorpay.com/app/keys
2. **Key ID** (Publishable Key): Starting with `rzp_test_`
3. **Key Secret**: Use this in backend `.env`
4. **NOTE**: Use only TEST keys for development

### 3.2 Test Razorpay Integration

Payment flow in test mode:
- Any card number works: `4111 1111 1111 1111`
- Any valid future expiry date: `12/25`
- Any 3-digit CVV: `123`
- OTP: `123456`

---

## STEP 4: Set Up Mock SMS Simulation

Mock SMS is handled entirely in the backend as a simulated SMS delivery mechanism. No external SMS provider, account SID, auth token, or phone number setup is required.

When payment is verified, the backend logs the SMS payload and recipient phone number. Use the backend logs to confirm that bill details were generated and would be sent to the customer.

---

## STEP 5: Deploy Backend on Render

### 5.1 Push Backend to GitHub (if not done)

```bash
cd backend
git add .
git commit -m "Add SMS integration and cloud deployment"
git push origin main
```

### 5.2 Create Render Web Service

1. Go to https://render.com
2. Login with GitHub
3. Click "New +" → "Web Service"
4. Select your backend repository
5. Configure:
   - **Name**: `salon-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter)

### 5.3 Add Environment Variables on Render

In Render dashboard for your service:
1. Go to "Environment" tab
2. Add all variables from `.env.example`:

```
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<railway-password>
DB_NAME=salon_db
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=gmail-app-password
FRONTEND_URL=https://your-salon-app.vercel.app
PORT=5000
NODE_ENV=production
```

### 5.4 Deploy

Click "Deploy" or wait for auto-deployment from GitHub push.

### 5.5 Get Backend URL

After deployment succeeds, copy the service URL:
- Format: `https://salon-backend-xxxxx.onrender.com`
- Use this for `FRONTEND_URL` references and frontend API configuration

---

## STEP 6: Deploy Frontend on Vercel

### 6.1 Prepare Frontend

1. Update `.env` file in frontend:

```
REACT_APP_API_URL=https://salon-backend-xxxxx.onrender.com
```

### 6.2 Push Frontend to GitHub

```bash
cd frontend
git add .
git commit -m "Update API URL for cloud deployment"
git push origin main
```

### 6.3 Deploy on Vercel

1. Go to https://vercel.com
2. Login with GitHub
3. Click "New Project"
4. Select your frontend repository
5. Configure:
   - **Framework Preset**: React
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `build` (or `dist` for Vite)

### 6.4 Add Environment Variables

In Vercel project settings:
1. Go to "Settings" → "Environment Variables"
2. Add:
   - `REACT_APP_API_URL`: `https://salon-backend-xxxxx.onrender.com`

### 6.5 Deploy

Click "Deploy" and wait for completion.

### 6.6 Get Frontend URL

After successful deployment:
- Format: `https://your-salon-app.vercel.app`
- Update backend `FRONTEND_URL` environment variable with this URL

---

## STEP 7: Configure CORS & Security

### 7.1 Update Backend CORS

The backend already has CORS configured to accept your frontend URL:

```javascript
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());
```

### 7.2 Verify CORS Headers

Test API call from frontend:
```bash
curl -H "Origin: https://your-salon-app.vercel.app" \
  https://salon-backend-xxxxx.onrender.com/health
```

Should return: `{"status":"ok"}`

---

## STEP 8: Complete Integration Testing

### 8.1 Test User Registration

1. Visit frontend: https://your-salon-app.vercel.app
2. Register new account
3. Verify email received
4. Login

### 8.2 Test Appointment Booking

1. Browse services
2. Select date, time, and services
3. Proceed to payment

### 8.3 Test Payment with Razorpay

1. Click "Pay with Razorpay"
2. Use test card: `4111 1111 1111 1111`
3. Complete payment

### 8.4 Verify Bill Generation

After successful payment:
- ✅ Bill automatically generated in database
- ✅ Bill number uses customer's phone number as reference
- ✅ Bill details sent via SMS to customer's phone (if Mock SMS configured)

### 8.5 Test SMS Delivery

1. Check the backend logs after payment completes.
2. Verify the mock SMS output includes:
   - Bill reference number
   - Total amount
   - Appointment details

---

## STEP 9: Setup HTTPS & SSL

### 9.1 Vercel HTTPS

- ✅ Automatically configured by Vercel
- ✅ Valid SSL certificate provided

### 9.2 Render HTTPS

- ✅ Automatically configured by Render
- ✅ Free SSL certificate provided

### 9.3 Verify HTTPS

Test your URLs:
```bash
curl -I https://your-salon-app.vercel.app
curl -I https://salon-backend-xxxxx.onrender.com
```

Both should return `HTTP/2 200` with valid SSL.

---

## STEP 10: Production Checklist

Before going live with real payments:

- [ ] Update Razorpay to **LIVE Mode** keys (not test mode)
- [ ] Update `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` with live keys
- [ ] Set `NODE_ENV=production` in Render
- [ ] Set up proper error logging (optional: use Sentry, LogRocket)
- [ ] Test complete payment flow with live keys
- [ ] Verify mock SMS output in backend logs
- [ ] Set up monitoring and uptime alerts
- [ ] Create database backups (Railway: automatic)

---

## Troubleshooting Guide

### Issue: CORS Error
**Solution**: 
1. Verify `FRONTEND_URL` in Render environment matches your Vercel URL
2. Check browser console for exact error message
3. Restart Render service after updating env vars

### Issue: 503 Service Unavailable
**Solution**:
1. Check Render build logs for errors
2. Verify all environment variables are set
3. Check Railway database connection is active

### Issue: Payment Not Processing
**Solution**:
1. Verify Razorpay keys are correct (test vs production)
2. Check browser console for JS errors
3. Review backend logs in Render dashboard

### Issue: SMS Not Sending
**Solution**:
1. Check backend logs for mock SMS output
2. Verify phone number format (+91xxxxxxxxxx for India)
3. Ensure the appointment phone number is saved on the user record
4. Confirm payment verification completed successfully

### Issue: Database Connection Failed
**Solution**:
1. Verify Railway MySQL is running
2. Check credentials in `.env`
3. Verify `DB_HOST` format (includes `.railway.app`)
4. Test connection using MySQL Workbench

---

## Database Maintenance

### Backup Database

Railway provides automatic daily backups. To manually export:

1. Connect with MySQL Workbench
2. Right-click database → "Export"
3. Choose format (SQL)
4. Save locally

### Monitor Database

In Railway dashboard:
- View CPU usage
- Check storage
- Monitor connections

---

## Cost Estimation (Monthly)

| Service | Free Tier | Paid (if needed) |
|---------|-----------|-----------------|
| **Vercel** | 100GB bandwidth | $20+/month |
| **Render** | Limited free tier | $7+/month |
| **Railway** | $5 free credits | Pay-as-you-go |
| **Mock SMS** | Simulated backend logs | $0 |
| **Razorpay** | Free + 1.95% fee | Same rate |

**Estimated:** Free for low traffic

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Razorpay Docs**: https://razorpay.com/docs
- **Mock SMS**: Simulated backend logging, no external docs required

---

## API Endpoints Reference

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/myappointments` - Get user's appointments
- `POST /api/appointments/razorpay-order` - Create payment order
- `POST /api/appointments/verify-payment` - Verify payment & generate bill
- `GET /api/appointments/:id/bill` - Get bill details

### Bill Generation
- Auto-generates after payment verification
- Bill number uses customer's phone number
- SMS sent automatically (if Mock SMS configured)
- Bill stored in database with full details

### SMS Configuration
- Triggered after successful payment
- Includes: Bill number, amount, appointment details
- Uses customer's registered phone number
- Falls back gracefully if SMS service unavailable

---

## Next Steps

1. ✅ Complete all deployment steps
2. ✅ Test payment flow with test keys
3. ✅ Verify SMS delivery
4. ✅ Set up monitoring
5. ✅ Upgrade Razorpay to live mode for real payments
6. ✅ Monitor backend logs and database performance

---

**Last Updated**: May 2024
**Version**: 1.0


