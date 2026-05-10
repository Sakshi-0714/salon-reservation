# Cloud Deployment Steps

## 1. Railway MySQL

Your Railway MySQL service is already online. In Railway, open the MySQL service and copy `MYSQL_PUBLIC_URL`.

Run the schema on Railway:

```bash
mysql "<MYSQL_PUBLIC_URL>" < backend/database.sql
```

If your Railway database was created before this update and already has the old `bills` table, also run:

```bash
mysql "<MYSQL_PUBLIC_URL>" < backend/migrations/001_bills_cloud_deployment.sql
```

If your shell does not support URL login with `mysql`, use Railway's query editor and paste the SQL file contents there.

## 2. Render Backend

Create a new Render Web Service from this repository.

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Environment variables:

```env
NODE_ENV=production
MYSQL_PUBLIC_URL=<copy from Railway MYSQL_PUBLIC_URL>
JWT_SECRET=<generate a long random string>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
SMS_PROVIDER=mock
SMTP_EMAIL=<optional gmail address for OTP emails>
SMTP_PASSWORD=<optional gmail app password>
```

Render will provide `PORT` automatically.

After deploy, verify:

```bash
curl https://<your-render-service>.onrender.com/health
```

Expected response:

```json
{"status":"ok"}
```

## 3. Vercel Frontend

Create a new Vercel project from this repository.

- Root Directory: `frontend`
- Framework Preset: Create React App
- Build Command: `npm run build`
- Output Directory: `build`

Environment variable:

```env
REACT_APP_API_URL=https://<your-render-service>.onrender.com
```

After Vercel deploys, copy the Vercel URL back into Render's `FRONTEND_URL`, then redeploy the Render service.

## 4. Razorpay Test Mode

In Razorpay Dashboard, use Test Mode keys only:

```env
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

The frontend asks the backend for the public key. The secret key stays only on Render.

## 5. Payment, Bill, SMS Flow

The cloud backend now verifies the Razorpay signature first. Only after successful verification it:

1. marks the appointment as paid,
2. creates or updates a bill,
3. uses the customer's registered mobile number as the bill reference,
4. stores customer, service, amount, Razorpay, and SMS status details in `bills`,
5. sends a mock SMS from the backend logs.

With `SMS_PROVIDER=mock`, open Render logs after a successful payment to see the generated bill SMS.
