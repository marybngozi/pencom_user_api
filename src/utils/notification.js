const axios = require("axios");
const config = require("../config");
const logger = require("./logger");
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
    },
    data: data,
  };

  try {
    const emailSend = await axios(emailConfig);
    delete emailSend.data.Message;

    // check if email was sent successfully
    if (emailSend.data.Code == "02") {
      logger.info("Sending email => " + JSON.stringify(emailSend.data));
      return true;
    } else {
      logger.error("Sending email => " + JSON.stringify(emailSend.data));
      return false;
    }
  } catch (error) {
    logger.error("Sending email => " + JSON.stringify(error));
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
    delete smsSend.data.Message;

    // check if sms was sent successfully
    if (smsSend.data.StatusCode == "101") {
      logger.info("Sending sms => " + JSON.stringify(smsSend.data));
      return true;
    } else {
      logger.error("Sending sms => " + JSON.stringify(smsSend.data));
      return false;
    }
  } catch (error) {
    logger.error("Sending sms => " + JSON.stringify(error));
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

    if (response) {
      if (response.data.is_valid) {
        logger.info(
          `Validating email => ${email}: ${JSON.stringify(response.data)}`
        );
      } else {
        logger.error(
          `Validating email => ${email}: ${JSON.stringify(response.data)}`
        );
      }
      return response.data;
    }
    return { is_valid: false };
  } catch (error) {
    throw new ServerError();
  }
};

module.exports = {
  sendMail,
  sendSms,
  validateEmail,
};
