const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendVerification, verifyCode, updateUserProfile, sendResetCode, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-verification', sendVerification);
router.post('/verify-code', verifyCode);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);
router.post('/send-reset-code', sendResetCode);
router.post('/reset-password', resetPassword);

module.exports = router;
