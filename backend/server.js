require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:5173'];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin) || defaultDevOrigins.includes(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname === 'vercel.app' || hostname.endsWith('.vercel.app');
  } catch (error) {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/reviews', reviewRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Salon Reservation API is running...');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health/details', async (req, res) => {
  try {
    const db = require('./config/db');
    const [billColumns] = await db.execute(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'bills'
      ORDER BY ORDINAL_POSITION
    `);

    const columns = billColumns.map(row => row.COLUMN_NAME);
    const requiredBillColumns = [
      'customer_name',
      'customer_phone',
      'customer_email',
      'services',
      'razorpay_order_id',
      'razorpay_payment_id',
      'sms_status',
      'sms_error',
      'sms_sent_at',
      'updated_at'
    ];

    const smsProvider = process.env.SMSLOCAL_API_KEY
      ? 'smslocal'
      : 'mock';

    res.json({
      status: 'ok',
      smtp_configured: Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD),
      razorpay_configured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      sms_provider: smsProvider,
      smslocal_configured: Boolean(
        process.env.SMSLOCAL_API_KEY &&
        process.env.SMSLOCAL_ROUTE &&
        process.env.SMSLOCAL_SENDER_ID
      ),
      bill_schema_ok: requiredBillColumns.every(column => columns.includes(column)),
      missing_bill_columns: requiredBillColumns.filter(column => !columns.includes(column)),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health details check failed',
      error: error.message,
    });
  }
});

// Global error handler — catches unhandled route errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    const { ensureDatabase } = require('./utils/ensureDatabase');
    await ensureDatabase();
  } catch (err) {
    console.error('Database initialization failed:', err.message);
  }

  // Verify SMTP connection on startup
  try {
    const { verifySMTP } = require('./controllers/authController');
    await verifySMTP();
  } catch (err) {
    console.error('SMTP startup check failed:', err.message);
  }
});
