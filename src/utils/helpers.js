const crypto = require("crypto");

const markAsDeleted = (input) => `${input}_deleted_${new Date().getTime()}`;

const generatePassword = (len) => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#@$%&()*+,-./:;<=>?^[\\]^_`{|}~";
  let retVal = "";
  for (let i = 0, n = charset.length; i < len; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }

  return retVal;
};

const hashString = (str) => {
  return crypto.createHash("md5").update(str).digest("hex");
};

const hideEmail = (email) => {
  if (!email) return "";

  return email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
    for (let i = 0; i < gp3.length; i++) {
      gp2 += "*";
    }
    return gp2;
  });
};

const hidePhone = (phone) => {
  if (!phone) return "";

  return phone.replace(/(.{2})(.*)(?=.{1})/, (gp1, gp2, gp3) => {
    for (let i = 0; i < gp3.length; i++) {
      gp2 += "*";
    }
    return gp2;
  });
};

module.exports = {
  generatePassword,
  hashString,
  hideEmail,
  hidePhone,
  markAsDeleted,
};
