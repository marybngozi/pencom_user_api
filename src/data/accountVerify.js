const randomstring = require("randomstring");
const { AccountVerified } = require("../models/accountVerified");
const { ResetToken } = require("../models/resetToken");

const createVerification = async (email) => {
  email = email.toLowerCase();

  const token = randomstring.generate(40);
  const verification = new AccountVerified({
    email,
    token,
  });
  await verification.save();

  return verification;
};

const getVerification = async ({ email }) => {
  const user = await AccountVerified.findOne({ email: email, deleted: false });

  return user;
};

const verifyValidToken = async (token) => {
  const user = await AccountVerified.findOneAndUpdate(
    { token: token, tokenVerified: false, deleted: false },
    {
      tokenVerified: true,
    },
    {
      new: true,
    }
  );

  return user;
};

const createResetToken = async (email) => {
  email = email.toLowerCase();

  await ResetToken.updateMany(
    { email, tokenUsed: false, deleted: false },
    {
      tokenUsed: true,
      usedOn: new Date(),
    }
  );

  const token = randomstring.generate(40);
  const verification = new ResetToken({
    email,
    token,
  });
  await verification.save();

  return verification;
};

const getToken = async ({ email, token }) => {
  const searchObj = { email, deleted: false, tokenUsed: false };
  if (token) searchObj.token = token;

  const userToken = await ResetToken.findOne(searchObj);

  return userToken;
};

const updateValidToken = async ({ token, email }) => {
  const searchObj = { email, deleted: false, tokenUsed: false };

  if (token) searchObj.token = token;

  const tokenUpdate = await ResetToken.findOneAndUpdate(
    searchObj,
    {
      tokenUsed: true,
      usedOn: new Date(),
    },
    {
      new: true,
    }
  );

  return tokenUpdate;
};

module.exports = {
  createVerification,
  getVerification,
  verifyValidToken,
  createResetToken,
  getToken,
  updateValidToken,
};
