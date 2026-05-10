const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Password validation: min 6 chars, 1 uppercase, 1 number
const validatePassword = (password) => {
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least 1 uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least 1 number';
  return null;
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecret123salonkey', {
    expiresIn: '30d',
  });
};

// Create reusable transporter — shared across all functions
const isEmailConfigured = Boolean(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })
  : null;

// SMTP health check — called from server.js on startup
const verifySMTP = async () => {
  if (!transporter) {
    console.log('SMTP not configured. Email OTP will use mock mode.');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ SMTP connection verified — emails will work');
    return true;
  } catch (err) {
    console.error('❌ SMTP verification failed:', err.message);
    console.error('   Check SMTP_EMAIL and SMTP_PASSWORD in your .env file');
    return false;
  }
};

const sendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete any existing codes for this email first to avoid stale entries
    await db.execute('DELETE FROM verification_codes WHERE email = ?', [email]);
    await db.execute(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, code]
    );

    if (!transporter) {
      console.log(`Mock verification code for ${email}: ${code}`);
      return res.status(200).json({
        message: 'Verification code generated. SMTP is not configured, so use the code shown here.',
        devCode: code
      });
    }

    let message = {
      from: `"StaySync Salon" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Your Verification Code — StaySync Salon',
      text: `Your registration verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; background: #1e1c1b; color: #f5f5f5; border-radius: 8px;">
          <h2 style="color: #ffa396; text-align: center; margin-bottom: 20px;">StaySync Salon</h2>
          <p style="text-align: center; font-size: 16px; margin-bottom: 10px;">Your verification code is:</p>
          <div style="text-align: center; font-size: 36px; font-weight: bold; color: #ffa396; letter-spacing: 8px; padding: 20px; background: rgba(255,163,150,0.1); border-radius: 8px; margin-bottom: 20px;">${code}</div>
          <p style="text-align: center; font-size: 14px; color: #a6a6a6;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
      `
    };

    // Use await instead of callback — this ensures response is sent only after email send completes/fails
    try {
      const info = await transporter.sendMail(message);
      console.log('Verification email sent to', email, '| MessageId:', info.messageId);
      res.status(200).json({ message: 'Verification code sent! Please check your email inbox.' });
    } catch (emailError) {
      console.warn(`Email delivery failed for ${email}. Falling back to mock OTP:`, emailError.message);
      return res.status(200).json({
        message: 'Email delivery failed, so use the verification code shown here.',
        devCode: code
      });
    }
  } catch (error) {
    console.error('Send Verification Error:', error.message);

    // Differentiate SMTP errors from DB errors
    res.status(500).json({ message: 'Failed to send verification email. Please try again.', error: error.message });
  }
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  try {
    const [codes] = await db.execute('SELECT * FROM verification_codes WHERE email = ? ORDER BY id DESC LIMIT 1', [email]);
    if (codes.length === 0) {
      return res.status(400).json({ message: 'Please request a verification code first' });
    }

    const latestCode = codes[0];
    if (latestCode.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    const [validCode] = await db.execute(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );

    if (validCode.length === 0) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    res.status(200).json({ message: 'Code verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const registerUser = async (req, res) => {
  const { name, email, phone, password, code } = req.body;

  // Input validation
  if (!name || !email || !password || !code) {
    return res.status(400).json({ message: 'Name, email, password, and verification code are required' });
  }

  try {
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate password rules
    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    const [codes] = await db.execute('SELECT * FROM verification_codes WHERE email = ? ORDER BY id DESC LIMIT 1', [email]);
    if (codes.length === 0) {
      return res.status(400).json({ message: 'Please request a verification code' });
    }

    const latestCode = codes[0];
    if (latestCode.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    const [validCode] = await db.execute(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );

    if (validCode.length === 0) {
      return res.status(400).json({ message: 'Verification code expired. Please request a new one.' });
    }

    await db.execute('DELETE FROM verification_codes WHERE email = ?', [email]);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = email === 'admin@gmail.com' ? 'admin' : 'user';

    const [result] = await db.execute(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword, role]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      phone,
      role,
      token: generateToken(result.insertId, role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, phone } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    const [result] = await db.execute(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name, phone || null, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendResetCode = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check user exists
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Delete old codes, insert new
    await db.execute('DELETE FROM verification_codes WHERE email = ?', [email]);
    await db.execute(
      'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email, code]
    );

    if (!transporter) {
      console.log(`Mock password reset code for ${email}: ${code}`);
      return res.status(200).json({
        message: 'Reset code generated. SMTP is not configured, so use the code shown here.',
        devCode: code
      });
    }

    let message = {
      from: `"StaySync Salon" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Password Reset Code — StaySync Salon',
      text: `Your password reset code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; background: #1e1c1b; color: #f5f5f5; border-radius: 8px;">
          <h2 style="color: #ffa396; text-align: center; margin-bottom: 20px;">StaySync Salon</h2>
          <p style="text-align: center; font-size: 16px; margin-bottom: 10px;">Your password reset code is:</p>
          <div style="text-align: center; font-size: 36px; font-weight: bold; color: #ffa396; letter-spacing: 8px; padding: 20px; background: rgba(255,163,150,0.1); border-radius: 8px; margin-bottom: 20px;">${code}</div>
          <p style="text-align: center; font-size: 14px; color: #a6a6a6;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
      `
    };

    // Use await instead of callback
    try {
      const info = await transporter.sendMail(message);
      console.log('Reset code sent to', email, '| MessageId:', info.messageId);
      res.status(200).json({ message: 'Reset code sent! Please check your email inbox.' });
    } catch (emailError) {
      console.warn(`Reset email delivery failed for ${email}. Falling back to mock OTP:`, emailError.message);
      return res.status(200).json({
        message: 'Email delivery failed, so use the reset code shown here.',
        devCode: code
      });
    }
  } catch (error) {
    console.error('Send Reset Code Error:', error.message);

    res.status(500).json({ message: 'Failed to send reset email. Please try again.', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }

  try {
    // Verify the code
    const [codes] = await db.execute('SELECT * FROM verification_codes WHERE email = ? ORDER BY id DESC LIMIT 1', [email]);
    if (codes.length === 0) {
      return res.status(400).json({ message: 'Please request a reset code first' });
    }

    const latestCode = codes[0];
    if (latestCode.code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    const [validCode] = await db.execute(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email, code]
    );

    if (validCode.length === 0) {
      return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });
    }

    // Delete used codes
    await db.execute('DELETE FROM verification_codes WHERE email = ?', [email]);

    // Validate new password
    const pwError = validatePassword(newPassword);
    if (pwError) {
      return res.status(400).json({ message: pwError });
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendVerification,
  verifyCode,
  registerUser,
  loginUser,
  updateUserProfile,
  sendResetCode,
  resetPassword,
  verifySMTP,
};
