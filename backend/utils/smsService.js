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
  console.log('--- Mock SMS: Bill Delivery ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
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

module.exports = {
  sendBillSMS,
  sendPaymentConfirmationSMS,
  formatPhoneNumber,
  formatBillMessage
};
