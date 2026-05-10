# Quick Start Guide - Local Development

## Prerequisites
- Node.js v16+ installed
- MySQL v8+ installed and running
- Git installed
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Navigate
```bash
cd salon-reservation
```

### 2. Backend Setup

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Create Database
```bash
# Using MySQL CLI
mysql -u root -p

# Then paste all contents of backend/database.sql
source backend/database.sql;
```

#### 2.3 Configure Environment
Create `.env` file in backend directory:

```
# Database (Local)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=salon_db
DB_SSL=false

# Razorpay Test Keys
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=rzp_test_your_test_key_secret

# Mock SMS
# Mock SMS is simulated by the backend and does not require external SMS credentials.

# Email (Gmail)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

#### 2.4 Start Backend Server
```bash
npm run dev
# or
npm start
```

Should output:
```
Salon Reservation API is running on port 5000...
```

### 3. Frontend Setup

#### 3.1 Install Dependencies
```bash
cd ../frontend
npm install
```

#### 3.2 Configure Environment
Create `.env` file in frontend directory:

```
REACT_APP_API_URL=http://localhost:5000
```

#### 3.3 Start Frontend
```bash
npm start
```

Frontend will open at `http://localhost:3000`

---

## Testing Payment Flow

### 1. Register User
1. Go to http://localhost:3000/auth
2. Click "Sign Up"
3. Enter details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Password: Test@123

### 2. Book Appointment
1. Click "Services" or browse available services
2. Select a service
3. Choose date and time
4. Click "Book Appointment"

### 3. Make Payment
1. Go to "My Appointments"
2. Click "Pay Now" button
3. Click "Razorpay" payment method
4. Use test card: `4111 1111 1111 1111`
5. Expiry: `12/25`
6. CVV: `123`
7. OTP: `123456`

### 4. Verify Bill Generation
1. Check database:
```bash
mysql -u root -p salon_db
SELECT * FROM bills WHERE appointment_id = 1;
```

2. Expected output:
```
| id | appointment_id | bill_number  | total_amount | payment_status | created_at |
| 1  | 1              | 9876543210   | 500          | Paid           | timestamp  |
```

### 5. Test SMS (Mock SMS)
1. Complete a payment through the application.
2. Open the backend logs in your terminal or deployment dashboard.
3. Confirm the mock SMS log output includes bill details and customer phone number.
4. No external SMS console or credentials are required.

---

## Testing Admin Features

### 1. Create Admin User
```bash
# Open MySQL
mysql -u root -p salon_db

# Insert admin user
INSERT INTO users (name, email, phone, password, role) 
VALUES ('Admin', 'admin@salon.com', '9000000000', 'hashed_password', 'admin');
```

### 2. Login as Admin
1. Go to login page
2. Use admin email
3. Access admin dashboard (usually `/admin` route)

### 3. View All Appointments
- Dashboard shows all bookings
- Can update appointment status
- Can mark as completed
- Can cancel appointments

### 4. Generate Bills Manually
- Select appointment
- Click "Generate Bill"
- Bill is created and SMS sent (if configured)

---

## Database Schema Overview

### users
```sql
id | name | email | phone | password | role | created_at
```

### appointments
```sql
id | user_id | appointment_date | appointment_time | services (JSON) | 
payment_status | razorpay_order_id | razorpay_payment_id | created_at
```

### bills
```sql
id | appointment_id | bill_number | total_amount | payment_status | created_at
```

### services
```sql
id | category | name | description | price | assigned_staff
```

---

## Common Commands

### Start Development
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

### Reset Database
```bash
mysql -u root -p -e "DROP DATABASE salon_db; CREATE DATABASE salon_db;"
mysql -u root -p salon_db < backend/database.sql
```

### View Backend Logs
```bash
# Backend logs show:
# - Database queries
# - Payment verification attempts
# - SMS sending status
# - Error traces
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'

# Create appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_date": "2024-06-20",
    "appointment_time": "14:30",
    "paid_advance": false,
    "services": [{"id": 1, "name": "Haircut", "price": 500}]
  }'
```

---

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution**: Run `npm install` in backend directory

### Issue: "Error: connect ECONNREFUSED"
**Solution**: MySQL server not running. Start MySQL:
```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Issue: "CORS error"
**Solution**: Check `FRONTEND_URL` in backend `.env` matches frontend URL

### Issue: Razorpay payment fails
**Solution**: 
1. Check test keys are correct
2. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
3. Check browser console for errors

### Issue: SMS not sending in local
**Solution**: Mock SMS is simulated by the backend. Check console logs for:
```
SMS Service: Mock SMS is simulated. Bill details are logged for review.
```

---

## Port Conflicts

If ports are already in use:

### Change Backend Port
```bash
# In backend/.env
PORT=5001

# Restart backend
npm run dev
```

### Change Frontend Port
```bash
# In frontend/.env
PORT=3001

# Restart frontend
npm start
```

Then update `REACT_APP_API_URL` to match new backend port.

---

## Git Workflow for Deployment

### Push Local Changes
```bash
# From root directory
git add -A
git commit -m "Add SMS integration and cloud deployment config"

# Push to GitHub
git push origin main
```

### Deploy to Cloud
After pushing to GitHub:

1. **Backend**: Render auto-deploys from GitHub
2. **Frontend**: Vercel auto-deploys from GitHub
3. **Database**: Manual setup on Railway (one-time)

---

## Performance Tips

### Database Optimization
- Add indexes on frequently queried columns:
```sql
ALTER TABLE appointments ADD INDEX idx_user_id (user_id);
ALTER TABLE appointments ADD INDEX idx_date (appointment_date);
ALTER TABLE bills ADD INDEX idx_appointment_id (appointment_id);
```

### Caching
- Frontend: Browser cache for static assets
- Backend: Consider Redis for session caching (advanced)

### Monitoring
- Backend: Check Render logs for errors
- Frontend: Check browser console for issues
- Database: Monitor Railway dashboard for slow queries

---

## Need Help?

- **API Issues**: Check `API_DOCUMENTATION.md`
- **Deployment Issues**: Check `DEPLOYMENT_GUIDE.md`
- **Code Questions**: Review inline code comments
- **Backend Logs**: Check terminal where `npm run dev` is running
- **Frontend Logs**: Check browser Developer Tools → Console

---

**Version**: 1.0
**Last Updated**: May 2024


