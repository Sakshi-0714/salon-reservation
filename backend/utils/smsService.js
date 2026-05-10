const sendBillSMS = async (phoneNumber, billDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { success: false, error: 'Phone number not available' };
  }

  const message = formatBillMessage(billDetails);

  console.log('--- Mock SMS: Bill Delivery ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
};

const sendPaymentConfirmationSMS = async (phoneNumber, paymentDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { success: false, error: 'Phone number not available' };
  }

  const message = `Dear ${paymentDetails.userName}, your payment of Rs ${paymentDetails.amount} has been received successfully. Bill Ref: ${paymentDetails.billNumber}. Thank you for choosing StaySync Salon.`;

  console.log('--- Mock SMS: Payment Confirmation ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
};

const formatBillMessage = (billDetails) => {
  return `Dear ${billDetails.userName}, your StaySync bill has been generated. Bill Ref: ${billDetails.billNumber}. Amount: Rs ${billDetails.totalAmount}. Status: Paid. Thank you.`;
};

const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  const digits = String(phone).replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  return phone.startsWith('+') ? phone : `+91${digits}`;
};

module.exports = {
  sendBillSMS,
  sendPaymentConfirmationSMS,
  formatPhoneNumber,
  formatBillMessage,
};
