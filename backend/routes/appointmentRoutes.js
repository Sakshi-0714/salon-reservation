const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyAppointments,
  getAppointments,
  updateAppointmentStatus,
  cancelSession,
  payAppointment,
  payInPerson,
  userCancelSession,
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey,
  searchAppointmentsByPhone,
  createBill,
  getBill,
  resendBillSMS
} = require('../controllers/appointmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createAppointment)
  .get(protect, admin, getAppointments);

router.get('/myappointments', protect, getMyAppointments);
router.get('/search/:phone', protect, admin, searchAppointmentsByPhone);

router.patch('/:id/status', protect, admin, updateAppointmentStatus);
router.patch('/:id/cancel', protect, admin, cancelSession);
router.patch('/:id/user-cancel', protect, userCancelSession);
router.patch('/:id/pay', protect, payAppointment);
router.patch('/:id/pay-in-person', protect, payInPerson);

router.post('/:id/bill', protect, admin, createBill);
router.get('/:id/bill', protect, getBill);
router.post('/:id/bill/sms', protect, resendBillSMS);

router.get('/razorpay-key', protect, getRazorpayKey);
router.post('/razorpay-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);

module.exports = router;
