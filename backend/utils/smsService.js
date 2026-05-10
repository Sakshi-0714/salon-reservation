const axios = require('axios');

/**
 * Send SMS to customer with bill details (mock implementation)
 * @param {string} phoneNumber - Customer's phone number
 * @param {Object} billDetails - Bill details object
 * @param {number} billDetails.billNumber - Bill number/reference
 * @param {number} billDetails.totalAmount - Total amount in rupees
 * @param {string} billDetails.userName - Customer name
 * @param {string} billDetails.appointmentDate - Appointment date
 * @param {string} billDetails.appointmentTime - Appointment time
 * @returns {Promise<Object>} - Result object with success/failure status
 */
const sendBillSMS = async (phoneNumber, billDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    console.warn('SMS: No phone number provided for bill delivery');
    return { success: false, error: 'Phone number not available' };
  }

  const message = formatBillMessage(billDetails);
  if (getSmsProvider() === 'fast2sms') {
    return sendFast2SMS(phoneNumber, message);
  }

  console.log('--- Mock SMS: Bill Delivery ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
};

const sendFast2SMS = async (phoneNumber, message) => {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'FAST2SMS_API_KEY is not configured' };
  }

  const numbers = normalizeIndianMobile(phoneNumber);
  if (!numbers) {
    return { success: false, error: 'Valid 10-digit Indian mobile number is required' };
  }

  const { data: payload } = await axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    {
      route: process.env.FAST2SMS_ROUTE || 'q',
      message,
      language: 'english',
      numbers,
    },
    {
      headers: {
        authorization: apiKey,
      },
    }
  );

  if (payload?.return === false) {
    return {
      success: false,
      provider: 'fast2sms',
      error: Array.isArray(payload.message)
        ? payload.message.join(', ')
        : payload.message || 'Fast2SMS rejected the SMS request'
    };
  }

  return {
    success: true,
    provider: 'fast2sms',
    requestId: payload.request_id,
    message: Array.isArray(payload.message) ? payload.message.join(', ') : 'SMS sent'
  };
};

const getSmsProvider = () => {
  if (process.env.FAST2SMS_API_KEY) return 'fast2sms';
  return (process.env.SMS_PROVIDER || 'mock').toLowerCase();
};

/**
 * Send payment confirmation SMS (mock implementation)
 * @param {string} phoneNumber - Customer's phone number
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} - Result object
 */
const sendPaymentConfirmationSMS = async (phoneNumber, paymentDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    console.warn('Mock SMS: No phone number provided for payment confirmation');
    return { success: false, error: 'Phone number not available' };
  }

  const message = `Dear ${paymentDetails.userName},\n\nYour payment of ₹${paymentDetails.amount} has been received successfully! Your appointment is confirmed.\n\nBill Reference: ${paymentDetails.billNumber}\nAppointment Date: ${paymentDetails.appointmentDate}\n\nThank you for choosing StaySync Salon!`;

  console.log('--- Mock SMS: Payment Confirmation ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
};

/**
 * Format bill message
 * @param {Object} billDetails - Bill details
 * @returns {string} - Formatted message
 */
const formatBillMessage = (billDetails) => {
  return `Dear ${billDetails.userName},\n\nYour appointment bill has been generated!\n\nBill Reference: ${billDetails.billNumber}\nTotal Amount: ₹${billDetails.totalAmount}\nAppointment Date: ${billDetails.appointmentDate}\nAppointment Time: ${billDetails.appointmentTime}\nPayment Status: Paid\n\nThank you for choosing StaySync Salon!`;
};

/**
 * Format Indian phone number to international format
 * @param {string} phone - Phone number (10 digits)
 * @returns {string} - Formatted phone number with +91 country code
 */
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  // Return as-is if already formatted
  return phone.startsWith('+') ? phone : `+91${digits}`;
};

const normalizeIndianMobile = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return '';
};

module.exports = {
  sendBillSMS,
  sendPaymentConfirmationSMS,
  formatPhoneNumber,
  formatBillMessage
};
