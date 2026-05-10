const axios = require('axios');

const sendBillSMS = async (phoneNumber, billDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { success: false, error: 'Phone number not available' };
  }

  const message = formatBillMessage(billDetails);
  const provider = getSmsProvider();

  if (provider === 'smslocal') {
    return sendSMSLocal(phoneNumber, message);
  }

  if (provider === 'fast2sms') {
    return sendFast2SMS(phoneNumber, message);
  }

  console.log('--- Mock SMS: Bill Delivery ---');
  console.log(`To: ${phoneNumber}`);
  console.log(message);
  console.log('--- End Mock SMS ---');

  return { success: true, simulated: true, message: 'Mock SMS sent' };
};

const sendSMSLocal = async (phoneNumber, message) => {
  const apiKey = process.env.SMSLOCAL_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'SMSLOCAL_API_KEY is not configured' };
  }

  const number = normalizeIndianMobile(phoneNumber);

  if (!number) {
    return { success: false, error: 'Valid 10-digit Indian mobile number is required' };
  }

  try {
    const response = await axios.get('https://app.smslocal.in/api/smsapi', {
      params: {
        key: apiKey,
        route: process.env.SMSLOCAL_ROUTE || '2',
        sender: process.env.SMSLOCAL_SENDER_ID || 'STSYNC',
        number,
        sms: message,
      },
    });

    console.log('SMSLocal response:', response.data);

    const responseText = typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data);

    if (
      responseText.toLowerCase().includes('error') ||
      responseText.toLowerCase().includes('failed') ||
      responseText.toLowerCase().includes('invalid')
    ) {
      return {
        success: false,
        provider: 'smslocal',
        error: responseText,
      };
    }

    return {
      success: true,
      provider: 'smslocal',
      message: 'SMS sent',
      response: response.data,
    };
  } catch (error) {
    const providerMessage = error.response?.data || error.message;
    console.error('SMSLocal error:', providerMessage);

    return {
      success: false,
      provider: 'smslocal',
      error: typeof providerMessage === 'string'
        ? providerMessage
        : JSON.stringify(providerMessage),
    };
  }
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

  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      new URLSearchParams({
        route: process.env.FAST2SMS_ROUTE || 'q',
        message,
        language: 'english',
        numbers,
        flash: '0',
        sms_details: '1',
      }).toString(),
      {
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
      }
    );

    const payload = response.data;
    console.log('Fast2SMS response:', payload);

    if (payload?.return === false) {
      return {
        success: false,
        provider: 'fast2sms',
        error: Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message || 'Fast2SMS rejected the SMS request',
      };
    }

    return {
      success: true,
      provider: 'fast2sms',
      requestId: payload.request_id,
      message: Array.isArray(payload.message) ? payload.message.join(', ') : 'SMS sent',
    };
  } catch (error) {
    const providerMessage = formatProviderError(error.response?.data || error.message);
    console.error('Fast2SMS error:', error.response?.data || error.message);

    return {
      success: false,
      provider: 'fast2sms',
      error: providerMessage,
    };
  }
};

const getSmsProvider = () => {
  if (process.env.SMS_PROVIDER) {
    return process.env.SMS_PROVIDER.toLowerCase();
  }

  if (process.env.SMSLOCAL_API_KEY) return 'smslocal';
  if (process.env.FAST2SMS_API_KEY) return 'fast2sms';

  return 'mock';
};

const sendPaymentConfirmationSMS = async (phoneNumber, paymentDetails) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { success: false, error: 'Phone number not available' };
  }

  const message = `Dear ${paymentDetails.userName}, your payment of Rs ${paymentDetails.amount} has been received successfully. Bill Ref: ${paymentDetails.billNumber}. Thank you for choosing StaySync Salon.`;

  const provider = getSmsProvider();

  if (provider === 'smslocal') {
    return sendSMSLocal(phoneNumber, message);
  }

  if (provider === 'fast2sms') {
    return sendFast2SMS(phoneNumber, message);
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

  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }

  return '';
};

const formatProviderError = (providerError) => {
  if (Array.isArray(providerError)) return providerError.join(', ');

  if (providerError && typeof providerError === 'object') {
    const message = Array.isArray(providerError.message)
      ? providerError.message.join(', ')
      : providerError.message;

    const status = providerError.status_code
      ? `Fast2SMS ${providerError.status_code}`
      : 'Fast2SMS';

    return message ? `${status}: ${message}` : JSON.stringify(providerError);
  }

  return String(providerError);
};

module.exports = {
  sendBillSMS,
  sendPaymentConfirmationSMS,
  formatPhoneNumber,
  formatBillMessage,
};