require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  BODY_LIMIT: process.env.BODY_LIMIT || "100kb",
  SECRET_KEY: process.env.SECRET_KEY,
  TOKEN_VALIDITY: process.env.TOKEN_VALIDITY,

  /* Notification configurations */
  // Email
  EMAIL_API_URL: process.env.EMAIL_API_URL,
  EMAIL_VENDOR_CODE: process.env.EMAIL_VENDOR_CODE,
  EMAIL_API_KEY: process.env.EMAIL_API_KEY,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  SENDER_NAME: process.env.SENDER_NAME,
  VALIDATE_API_URL: process.env.VALIDATE_API_URL,

  // SMS
  SMS_API_URL: process.env.SMS_API_URL,
  SMS_VENDOR_CODE: process.env.SMS_VENDOR_CODE,
  SMS_API_KEY: process.env.SMS_API_KEY,
  SENDER_SMS: process.env.SENDER_SMS,
};
