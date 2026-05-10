const axios = require("axios");

const sendBillSms = async (phone, bill) => {
  try {
    const message = `StaySync Bill Generated. Bill No: ${bill.billNo}, Amount: Rs.${bill.amount}, Status: Paid`;

    const response = await axios.get(
      "https://app.smslocal.in/api/smsapi",
      {
        params: {
          key: process.env.SMSLOCAL_API_KEY,
          sender: process.env.SMSLOCAL_SENDER_ID,
          route: process.env.SMSLOCAL_ROUTE,
          number: phone,
          sms: message,
        },
      }
    );

    console.log("SMS sent:", response.data);
  } catch (error) {
    console.log("SMS error:", error.response?.data || error.message);
  }
};

module.exports = sendBillSms;