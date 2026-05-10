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

// Global error handler — catches unhandled route errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Verify SMTP connection on startup
  try {
    const { verifySMTP } = require('./controllers/authController');
    await verifySMTP();
  } catch (err) {
    console.error('SMTP startup check failed:', err.message);
  }
});
