const sendBillSMS = async (phoneNumber, billDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { success: false, error: 'Phone number not available' };
  }

  const message = formatBillMessage(billDetails);
  if (getSmsProvider() === 'smslocal') {
    return sendSMSLocal(phoneNumber, message);
  }

  console.log('--- Mock SMS: Bill Delivery ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
};

const sendSMSLocal = async (phoneNumber, message) => {
  const apiKey = process.env.SMSLOCAL_API_KEY;
  const route = process.env.SMSLOCAL_ROUTE;
  const sender = process.env.SMSLOCAL_SENDER_ID;
  const templateId = process.env.SMSLOCAL_TEMPLATE_ID;

  if (!apiKey || !route || !sender) {
    return {
      success: false,
      provider: 'smslocal',
      error: 'SMSLocal is selected, but SMSLOCAL_API_KEY, SMSLOCAL_ROUTE, or SMSLOCAL_SENDER_ID is missing'
    };
  }

  const number = normalizeIndianMobile(phoneNumber);
  if (!number) {
    return {
      success: false,
      provider: 'smslocal',
      error: 'Valid 10-digit Indian mobile number is required'
    };
  }

  const params = new URLSearchParams({
    key: apiKey,
    route,
    sender,
    number,
    sms: message,
  });

  if (templateId) {
    params.set('templateid', templateId);
  }

  try {
    const response = await fetch(`https://app.smslocal.in/api/smsapi?${params.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'text/plain, application/json',
      },
    });

    const responseText = (await response.text()).trim();
    console.log('SMSLocal response:', responseText);

    if (!response.ok) {
      return {
        success: false,
        provider: 'smslocal',
        error: `SMSLocal HTTP ${response.status}: ${responseText || response.statusText}`
      };
    }

    const errorMessage = getSMSLocalError(responseText);
    if (errorMessage) {
      return {
        success: false,
        provider: 'smslocal',
        error: errorMessage
      };
    }

    return {
      success: true,
      provider: 'smslocal',
      messageId: responseText,
      message: 'SMSLocal accepted the SMS request'
    };
  } catch (error) {
    console.error('SMSLocal error:', error.message);
    return {
      success: false,
      provider: 'smslocal',
      error: error.message || 'SMSLocal request failed'
    };
  }
};

const sendPaymentConfirmationSMS = async (phoneNumber, paymentDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { success: false, error: 'Phone number not available' };
  }

  const message = `Dear ${paymentDetails.userName}, your payment of Rs ${paymentDetails.amount} has been received successfully. Bill Ref: ${paymentDetails.billNumber}. Thank you for choosing StaySync Salon.`;
  if (getSmsProvider() === 'smslocal') {
    return sendSMSLocal(phoneNumber, message);
  }

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

const normalizeIndianMobile = (phone) => {
  if (!phone) return '';

  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);

  return '';
};

const getSmsProvider = () => {
  const provider = String(process.env.SMS_PROVIDER || '').toLowerCase();
  if (provider) return provider;
  return process.env.SMSLOCAL_API_KEY ? 'smslocal' : 'mock';
};

const getSMSLocalError = (responseText) => {
  const code = String(responseText || '').trim();
  const errors = {
    101: 'SMSLocal 101: Invalid user',
    102: 'SMSLocal 102: Invalid sender ID',
    103: 'SMSLocal 103: Invalid contact(s)',
    104: 'SMSLocal 104: Invalid route',
    105: 'SMSLocal 105: Invalid message',
    106: 'SMSLocal 106: Spam blocked',
    107: 'SMSLocal 107: Promotional block',
    108: 'SMSLocal 108: Low credits in the specified route',
    109: 'SMSLocal 109: Promotional route works from 9 AM to 8:45 PM only',
    110: 'SMSLocal 110: DLT Template ID is not valid',
    111: 'SMSLocal 111: No SMS message available',
  };

  if (errors[code]) return errors[code];
  if (/error|failed|invalid/i.test(code)) return `SMSLocal error: ${code}`;
  return null;
};

module.exports = {
  sendBillSMS,
  sendPaymentConfirmationSMS,
  formatPhoneNumber,
  formatBillMessage,
};
