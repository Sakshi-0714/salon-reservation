# Salon Reservation System - Deployment Checklist

Use this checklist to track your progress through the deployment process.

---

## 📋 Phase 1: Preparation (Pre-Deployment)

### Local Setup
- [ ] Node.js v16+ installed
- [ ] MySQL v8+ installed locally
- [ ] Git installed and configured
- [ ] All documentation files read and understood

### GitHub Repository
- [ ] Backend pushed to GitHub
- [ ] Frontend pushed to GitHub
- [ ] Repository set to public (for free tier access)
- [ ] `.env` files excluded from git (added to .gitignore)

### Verify Current Code
- [ ] Backend `package.json` uses mock SMS logger
- [ ] `smsService.js` exists in `backend/utils/`
- [ ] `appointmentController.js` imports and uses smsService
- [ ] `.env.example` files have all required variables
- [ ] Database schema includes `bills` table

---

## 📦 Phase 2: Service Accounts & Credentials

### Create Accounts
- [ ] Vercel account created (https://vercel.com)
- [ ] Render account created (https://render.com)
- [ ] Railway account created (https://railway.app)
- [ ] Razorpay account created (https://razorpay.com)
- [ ] Mock SMS simulation reviewed (backend logging only)

### Gather Credentials

#### Razorpay (Test Mode)
- [ ] Test Key ID noted: `rzp_test_xxxxx`
- [ ] Test Key Secret noted: `xxxxx`
- [ ] Test keys verified in dashboard
- [ ] Confirmed using TEST MODE (not production)

#### Mock SMS
- [ ] Confirm mock SMS is logged by the backend
- [ ] No external SMS provider credentials are required

#### Gmail SMTP
- [ ] Gmail account ready
- [ ] 2FA enabled on Gmail (recommended)
- [ ] App Password generated (not account password)
- [ ] Credentials noted: `email@gmail.com` and app-password

---

## 🗄️ Phase 3: Database Setup (Railway)

### Railway MySQL Setup
- [ ] Railway account created
- [ ] MySQL database provisioned
- [ ] Connection details copied:
  - [ ] Host: `xxxxx.railway.app`
  - [ ] Port: `3306`
  - [ ] User: `root`
  - [ ] Password: `xxxxx`

### Initialize Database
- [ ] Connected to Railway MySQL
- [ ] Executed `database.sql` completely
- [ ] Verified all tables created:
  - [ ] `users` table exists
  - [ ] `appointments` table exists
  - [ ] `bills` table exists
  - [ ] `services` table exists
  - [ ] All foreign keys in place

### Test Database Connection
- [ ] MySQL Workbench connection successful
- [ ] Can run basic queries
- [ ] Sample data inserted and retrieved

---

## 🚀 Phase 4: Backend Deployment (Render)

### Prepare Backend for Deployment
- [ ] All code changes committed to GitHub
- [ ] `npm install` run successfully locally
- [ ] `.env.example` completed with dummy values
- [ ] No sensitive data in source code
- [ ] `render.yaml` created in backend directory

### Create Render Service
- [ ] Render account logged in
- [ ] New Web Service created
- [ ] GitHub repository selected
- [ ] Service named: `salon-backend`
- [ ] Environment set to: `Node`
- [ ] Plan selected (free or paid)

### Configure Environment Variables (Render)
- [ ] `DB_HOST` set to Railway MySQL host
- [ ] `DB_PORT` set to 3306
- [ ] `DB_USER` set to root
- [ ] `DB_PASSWORD` set correctly
- [ ] `DB_NAME` set to salon_db
- [ ] `RAZORPAY_KEY_ID` set (test mode)
- [ ] `RAZORPAY_KEY_SECRET` set (test mode)
- [ ] `SMTP_EMAIL` set
- [ ] `SMTP_PASSWORD` set
- [ ] `FRONTEND_URL` set to temporary value (will update)
- [ ] `PORT` set to 5000
- [ ] `NODE_ENV` set to production

### Deploy Backend
- [ ] Clicked "Deploy" on Render
- [ ] Build process completed successfully
- [ ] No build errors in logs
- [ ] Service running status shows "Live"
- [ ] Backend URL copied: `https://salon-backend-xxxxx.onrender.com`

### Test Backend
- [ ] Health endpoint works: `GET /health` → 200 OK
- [ ] No CORS errors in logs
- [ ] No database connection errors
- [ ] Server startup message appears in logs

---

## 🎨 Phase 5: Frontend Deployment (Vercel)

### Prepare Frontend
- [ ] Updated `frontend/.env` with correct API URL:
  ```
  REACT_APP_API_URL=https://salon-backend-xxxxx.onrender.com
  ```
- [ ] Committed changes to GitHub
- [ ] Verified `package.json` has correct scripts
- [ ] Local build successful: `npm run build`

### Create Vercel Project
- [ ] Vercel account logged in
- [ ] New Project created
- [ ] Frontend repository selected
- [ ] Framework detected as React ✓

### Configure Vercel Deployment
- [ ] Root Directory set to: `frontend`
- [ ] Build Command correct: `npm run build`
- [ ] Output Directory set: `build` or `dist`

### Add Environment Variables (Vercel)
- [ ] `REACT_APP_API_URL` set correctly
- [ ] Environment variables match local setup

### Deploy Frontend
- [ ] Clicked "Deploy" in Vercel
- [ ] Build process completed
- [ ] No build errors
- [ ] Preview deployment successful
- [ ] Production deployment successful
- [ ] Frontend URL copied: `https://your-salon-app.vercel.app`

### Test Frontend
- [ ] Website loads without errors
- [ ] Can access all pages
- [ ] No CORS errors in browser console
- [ ] API calls successful (check Network tab)

---

## 🔗 Phase 6: Cross-Service Integration

### Update Backend with Frontend URL
- [ ] Go to Render dashboard
- [ ] Update `FRONTEND_URL` to: `https://your-salon-app.vercel.app`
- [ ] Restart backend service
- [ ] Wait for deployment to complete

### Verify CORS Configuration
- [ ] Test API from frontend
- [ ] No "CORS error" in browser console
- [ ] API responses received correctly
- [ ] Headers include proper CORS values

### Test Database Connectivity
- [ ] Register new user from frontend
- [ ] Check user in database: 
  ```sql
  SELECT * FROM users ORDER BY id DESC LIMIT 1;
  ```
- [ ] User data saved correctly

---

## ✅ Phase 7: Feature Testing

### User Authentication
- [ ] Can register new account
- [ ] Confirmation email received
- [ ] Can login with credentials
- [ ] JWT token generated and stored
- [ ] Can logout successfully

### Appointment Booking
- [ ] Can browse services
- [ ] Can select date and time
- [ ] Can add services to appointment
- [ ] Appointment created in database
- [ ] Appointment appears in "My Appointments"

### Payment Processing
- [ ] Razorpay payment button appears
- [ ] Can initiate payment
- [ ] Razorpay modal opens
- [ ] Test card accepted: `4111 1111 1111 1111`
- [ ] Payment marked as "Paid" in database
- [ ] Payment status updated in UI

### Bill Generation
- [ ] Bill automatically created after payment
- [ ] Bill record exists in database:
  ```sql
  SELECT * FROM bills WHERE appointment_id = 1;
  ```
- [ ] Bill number uses customer's phone
- [ ] Total amount calculated correctly
- [ ] Payment status shows "Paid"

### SMS Delivery
- [ ] Check backend logs for mock SMS messages
- [ ] Verify mock SMS output includes:
  - [ ] Bill reference number
  - [ ] Total amount
  - [ ] Appointment date
  - [ ] Appointment time

### Admin Features
- [ ] Can login as admin
- [ ] Admin dashboard loads
- [ ] Can view all appointments
- [ ] Can update appointment status
- [ ] Can generate bills manually
- [ ] Emails send on status changes

---

## 🔒 Phase 8: Security & Performance

### Security Checks
- [ ] HTTPS enabled on both frontend and backend
- [ ] No API keys visible in browser console
- [ ] No credentials in source code
- [ ] CORS properly restricted
- [ ] Payment verification working
- [ ] Invalid signatures rejected

### Performance Checks
- [ ] Page load time < 3 seconds
- [ ] API response time < 1 second
- [ ] No console errors or warnings
- [ ] Network requests are minimal
- [ ] Images optimized

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile devices
- [ ] Responsive design working

---

## 📊 Phase 9: Production Readiness

### Database Backups
- [ ] Automatic backups enabled (Railway)
- [ ] Manual backup created and stored locally
- [ ] Backup restoration tested

### Error Monitoring (Optional)
- [ ] Sentry account created (optional)
- [ ] Error tracking configured
- [ ] Slack notifications set up (optional)

### Uptime Monitoring (Optional)
- [ ] Uptime monitoring service configured
- [ ] Alerts configured for downtimes

### Documentation
- [ ] README.md complete
- [ ] DEPLOYMENT_GUIDE.md complete
- [ ] API_DOCUMENTATION.md complete
- [ ] QUICK_START.md complete
- [ ] All docs pushed to GitHub

---

## 🔴 Phase 10: Switch to Production (Optional)

**⚠️ IMPORTANT**: Only do this after testing everything thoroughly!

### Razorpay Migration
- [ ] Created live Razorpay keys (https://dashboard.razorpay.com)
- [ ] Live Key ID copied
- [ ] Live Key Secret copied
- [ ] Updated `RAZORPAY_KEY_ID` in Render env (production key)
- [ ] Updated `RAZORPAY_KEY_SECRET` in Render env (production key)
- [ ] Confirmed all test transactions are in TEST mode
- [ ] Render service restarted

### Mock SMS Production
- [ ] Confirm backend mock SMS log output in production
- [ ] Confirm bill and SMS log entries are generated after payment
- [ ] No external SMS provider setup is required

### Final Verification
- [ ] Test payment with live keys
- [ ] Confirm payment processes correctly
- [ ] Check Razorpay dashboard for live transaction
- [ ] Verify bill generated
- [ ] Verify SMS sent

---

## 📝 Final Checklist

### Before Going Live
- [ ] All tests passed
- [ ] No critical errors in logs
- [ ] Database backed up
- [ ] Team trained on admin features
- [ ] Support contact info documented
- [ ] Terms of Service reviewed
- [ ] Privacy Policy updated

### Launch Day
- [ ] Announcement to users ready
- [ ] Monitoring dashboard open
- [ ] Team on standby
- [ ] Emergency rollback plan documented
- [ ] Customer support ready

### Post-Launch
- [ ] Monitor logs for errors
- [ ] Check Razorpay transactions
- [ ] Verify SMS delivery
- [ ] Get user feedback
- [ ] Address issues promptly

---

## 📞 Troubleshooting Quick Reference

| Issue | Checklist | Documentation |
|-------|-----------|---------------|
| **CORS Error** | DB connection OK? Routes exist? | DEPLOYMENT_GUIDE.md |
| **Payment Fails** | Keys correct? Test mode on? | API_DOCUMENTATION.md |
| **SMS Not Sent** | Check backend mock SMS log output | IMPLEMENTATION_SUMMARY.md |
| **Build Error** | Dependencies installed? Env vars set? | QUICK_START.md |
| **Database Error** | Railway running? Password correct? | DEPLOYMENT_GUIDE.md |

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Frontend loads without errors
- ✅ Can register and login
- ✅ Can book appointments
- ✅ Can make payments
- ✅ Bills generate automatically
- ✅ SMS sent to customer (if configured)
- ✅ Admin features work
- ✅ No CORS errors
- ✅ HTTPS working on both
- ✅ Database backed up

---

## 📝 Notes

Use this space to note any issues or customizations:

```
Issue: ___________________________________
Solution: _________________________________

Custom Configuration: _____________________
_________________________________________

Date Completed: ___________________________
```

---

## 📊 Timeline

| Phase | Estimated Time | Actual Time |
|-------|---|---|
| Phase 1: Preparation | 30 min | ___ |
| Phase 2: Credentials | 1 hour | ___ |
| Phase 3: Database | 30 min | ___ |
| Phase 4: Backend | 20 min | ___ |
| Phase 5: Frontend | 20 min | ___ |
| Phase 6: Integration | 30 min | ___ |
| Phase 7: Testing | 1 hour | ___ |
| Phase 8: Security | 30 min | ___ |
| Phase 9: Production | 30 min | ___ |
| **TOTAL** | **~5 hours** | **___ hours** |

---

## ✨ Congratulations!

Once all checkboxes are completed, your Salon Reservation System is fully deployed on the cloud with:
- ✅ Complete payment processing
- ✅ Automatic bill generation
- ✅ SMS notifications
- ✅ Professional infrastructure
- ✅ Production-ready security

---

**Version**: 1.0
**Last Updated**: May 2024
**Status**: Ready to Use


