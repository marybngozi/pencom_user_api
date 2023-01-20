const fs = require("fs");
const User = require("../data/user");
const { getUserProfile } = require("../data/uploadSchedule");
const Verify = require("../data/accountVerify");
const jwt = require("../utils/jwt");
const logger = require("../utils/logger");
const MakeEmailTemplate = require("../utils/makeEmailTemplate");
const { sendMail, validateEmail } = require("../utils/notification");
const { validateRSAPin } = require("../utils/apiValidation");
const {
  BadRequestError,
  ServerError,
  NotFoundError,
} = require("../utils/errors");

const registerCompany = async (req, res, next) => {
  try {
    // check if the email a valid email
    const emailValid = await validateEmail(req.body.email);

    if (!emailValid.is_valid)
      throw new BadRequestError("Email address is invalid!");

    // get the mail login url
    let verifyUrl = req.body.verifyUrl || "#";

    // check if the email already exists
    const existUser = await User.getUser({ email: req.body.email });

    // if user was found
    if (existUser)
      throw new BadRequestError("Email address is already in use!");

    // create a user of company type
    req.body.userType = 100;
    const newUser = await User.createUser(req.body);

    // create user email verification
    const emailVerify = await Verify.createVerification(newUser.email);

    if (!emailVerify) throw new ServerError("Failed to generate Token");

    // send email
    const emailData = {
      verifyLink: verifyUrl + "/" + emailVerify.token,
      name: newUser.companyName,
      year: new Date().getFullYear(),
    };

    const message = MakeEmailTemplate("welcome.html", emailData);

    const subject = `Welcome to Pencom`;

    // send welcome/verify email tto the user
    sendMail(newUser.email, message, subject);

    return res.status(201).json({
      message: `Account created Successfully, verification email has been sent to ${newUser.email}`,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-registerCompany", e);
    next(e);
  }
};

const registerStaff = async (req, res, next) => {
  try {
    // check if the email a valid email
    const emailValid = await validateEmail(req.body.email);

    if (!emailValid.is_valid)
      throw new BadRequestError("Email address is invalid!");

    // check if the email a valid email
    const { rsaMessage, status } = await validateRSAPin(req.body.rsaPin);

    if (!status) throw new BadRequestError(rsaMessage);

    // get the mail login url
    let verifyUrl = req.body.verifyUrl || "#";

    // check if the email already exists
    const existUser = await User.getUser({ email: req.body.email });

    // if user was found
    if (existUser)
      throw new BadRequestError("Email address is already in use!");

    // create a user of staff type
    req.body.userType = 200;
    const newUser = await User.createUser(req.body);

    // create user email verification
    const emailVerify = await Verify.createVerification(newUser.email);

    if (!emailVerify) throw new ServerError("Failed to generate Token");

    // send email
    const emailData = {
      verifyLink: verifyUrl + "/" + emailVerify.token,
      name: `${newUser.firstName} ${newUser.lastName}`,
      year: new Date().getFullYear(),
    };

    const message = MakeEmailTemplate("welcome.html", emailData);

    const subject = `Welcome to Pencom`;

    // send welcome/verify email tto the user
    sendMail(newUser.email, message, subject);

    return res.status(201).json({
      message: `Account created Successfully, verification email has been sent to ${newUser.email}`,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-registerStaff", e);
    next(e);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    // get and update the token details
    const existToken = await Verify.verifyValidToken(req.body.token);

    // if no verfication token was found
    if (!existToken) throw new NotFoundError("Invalid verification link!");

    // update the status of the user
    const userUpdate = await User.updateAccountStatus(existToken.email);

    // if no verfication was donee for user
    if (!userUpdate)
      throw new NotFoundError(
        "Invalid verification link, Account not verified!"
      );

    return res.status(200).json({
      message: "Account verification was successfully!",
    });
  } catch (e) {
    console.log("authController-verify", e);
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const user = await User.getUser({ email: req.body.email });

    // if the user was not found
    if (!user) throw new NotFoundError("Invalid Login details");

    // Verify Password
    const passwordCorrect = await User.verifyPassword(
      user.id,
      req.body.password
    );

    if (!passwordCorrect)
      throw new BadRequestError("Incorrect Email or Password");

    if (!user.accountVerified)
      throw new BadRequestError(
        `This account has not been verified, check your email ${user.email} for verification link!`,
        "E302"
      );

    const token = jwt.sign(user.id);

    if (!token) throw new ServerError("Failed to generate Token");

    return res.status(200).json({
      message: "Login Successful!",
      data: {
        user,
        auth: token,
      },
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-login", e);
    next(e);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    // get the mail login url
    let verifyUrl = req.body.verifyUrl || "#";

    // get the user the email account
    const user = await User.getUser({ email: req.body.email });

    // if no user was found
    if (!user) throw new BadRequestError("Email address does not exist!");

    // create user email verification
    const emailVerify = await Verify.createResetToken(user.email);

    if (!emailVerify) throw new ServerError("Failed to generate Token");

    // send email
    const emailData = {
      verifyLink: `${verifyUrl}/${emailVerify.token}?email=${user.email}`,
      name: user.companyName
        ? user.companyName
        : `${user.firstName} ${user.lastName}`,
      year: new Date().getFullYear(),
    };

    const message = MakeEmailTemplate("resetPassword.html", emailData);

    const subject = `Reset Pencom Password`;

    // send reset password email tto the user
    sendMail(user.email, message, subject);

    return res.status(201).json({
      message: `Password reset link has been sent to ${user.email}`,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-forgotPassword", e);
    next(e);
  }
};

const verifyReset = async (req, res, next) => {
  try {
    // get the token details
    const existToken = await Verify.getToken({
      token: req.body.token,
      email: req.body.email,
    });

    // if no verfication token was found
    if (!existToken) throw new NotFoundError("Invalid verification link!");

    return res.status(200).json({
      message: "Token is valid",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-verifyReset", e);
    next(e);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // update the token if it exists
    const updateToken = await Verify.updateValidToken({
      email: req.body.email,
      token: req.body.token,
    });

    // if no token update
    if (!updateToken) throw new BadRequestError("Password update failed!");

    // update user password
    const user = await User.updatePassword(req.body.email, req.body.password);

    // if user update was not found
    if (!user) throw new BadRequestError("Password update failed!");

    return res.status(201).json({
      message: "Password update successful!",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-resetPassword", e);
    next(e);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await User.getUser({ email: req.body.email });

    // if the user was not found
    if (!user) throw new NotFoundError("User with email not found");

    // Verify Password
    const passwordCorrect = await User.verifyPassword(
      user.id,
      req.body.oldPassword
    );

    // if old password is not correct
    if (!passwordCorrect)
      throw new BadRequestError("Old Password is incorrect!");

    // update user password
    const updateUser = await User.updatePassword(
      req.body.email,
      req.body.newPassword
    );

    // if user update was not found
    if (!updateUser) throw new BadRequestError("Password update failed!");

    return res.status(201).json({
      message: "Password update successful!",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-changePassword", e);
    next(e);
  }
};

const getStaff = async (req, res, next) => {
  try {
    const staff = await User.getUser({ rsaPin: req.body.rsaPin });

    // if the user was not found
    if (!staff) throw new NotFoundError("Staff with RSA PIN was not found");

    return res.status(201).json({
      message: "Fetched successful!",
      data: staff,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-getStaff", e);
    next(e);
  }
};

const getProfile = async (req, res, next) => {
  try {
    let { companyCode } = req.user;

    const data = await getUserProfile({ companyCode });

    return res.status(200).json({
      message: "Fetched successful!",
      data: data,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("authController-getProfile", e);
    next(e);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, userType } = req.user;
    let {
      firstName,
      lastName,
      otherName,
      companyName,
      city,
      address,
      state,
      phone,
    } = req.body;

    if (!companyName && !firstName)
      throw new NotFoundError("Name must be provided");
    if (!city) throw new NotFoundError("City must be provided");
    if (!address) throw new NotFoundError("Address must be provided");
    if (!state) throw new NotFoundError("State must be provided");
    if (!phone) throw new NotFoundError("Phone must be provided");

    const userUpdate = {
      city,
      phone,
      address,
      state,
    };

    if (userType == 200 || userType == 300) {
      userUpdate.firstName = firstName;
      userUpdate.lastName = lastName;
      userUpdate.otherName = otherName;
    } else {
      userUpdate.companyName = companyName;
    }

    /* check if there is file, update it and remove the old one */
    const fileName = req.file ? req.file.filename : null;

    let user = await User.getUserById(agentId);

    if (user.logo && fileName) {
      const filePath = __basedir + "/public/logos/" + user.logo;
      fs.unlink(filePath, () => {
        logger.info(`authController.updateProfile: file ${filePath} deleted`);
      });
    }

    if (fileName) userUpdate.logo = fileName;

    user = await User.updateDetails(agentId, userUpdate);
    return res.status(201).json({
      message: "Updated successfully!",
      data: user,
    });
  } catch (e) {
    console.log("authController-updateProfile", e);
    next(e);
  }
};

module.exports = {
  login,
  registerCompany,
  registerStaff,
  verifyAccount,
  forgotPassword,
  verifyReset,
  resetPassword,
  changePassword,
  getStaff,
  getProfile,
  updateProfile,
};
