const axios = require("axios");
const config = require("../config");
const { ServerError } = require("../utils/errors");

const sendMail = async (email, message, subject) => {
  const data = JSON.stringify({
    to: email,
    sender_name: config.SENDER_NAME,
    sender_email: config.SENDER_EMAIL,
    vendor_code: config.EMAIL_VENDOR_CODE,
    encoded: true,
    is_html: true,
    subject: subject,
    msg: message,
  });

  const emailConfig = {
    method: "post",
    url: config.EMAIL_API_URL,
    headers: {
      apikey: config.EMAIL_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
      // Cookie: "PHPSESSID=okdbrvc94sn22cvltlcvv36u1k",
    },
    data: data,
  };

  try {
    const emailSend = await axios(emailConfig);

    console.log(JSON.stringify(emailSend.data));

    // check if email was sent successfully
    if (emailSend.data.Code == "02") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

const sendSms = async (phone, message) => {
  const data = JSON.stringify({
    vendor_code: config.SMS_VENDOR_CODE,
    encoded: false,
    to: phone,
    from: config.SENDER_SMS,
    msg: message,
  });

  const smsConfig = {
    method: "post",
    url: config.SMS_API_URL,
    headers: {
      apikey: config.SMS_API_KEY,
      "Content-Type": "application/json",
    },
    data: data,
  };

  try {
    const smsSend = await axios(smsConfig);

    console.log(JSON.stringify(smsSend.data));

    // check if sms was sent successfully
    if (smsSend.data.StatusCode == "101") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
};

const validateEmail = async (email) => {
  try {
    const data = JSON.stringify({
      email: email,
      vendor_code: config.EMAIL_VENDOR_CODE,
    });

    const validateConfig = {
      method: "post",
      url: config.VALIDATE_API_URL,
      headers: {
        apikey: config.EMAIL_API_KEY,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios(validateConfig);

    console.log(response.data);
    if (response) {
      return response.data;
    }
  } catch (error) {
    console.log(error);
    throw new ServerError();
  }
};

module.exports = {
  sendMail,
  sendSms,
  validateEmail,
};
