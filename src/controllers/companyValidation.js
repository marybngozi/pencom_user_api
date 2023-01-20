const moment = require("moment");
const User = require("../data/user");
const CompanyValidation = require("../data/companyValidation");
const Wallet = require("../data/wallet");
const Menu = require("../data/menu");
const MakeEmailTemplate = require("../utils/makeEmailTemplate");
const { sendMail, sendSms } = require("../utils/notification");
const { hideEmail, hidePhone } = require("../utils/helpers");
const { companyValidationCall } = require("../utils/apiValidation");
const {
  BadRequestError,
  ServerError,
  NotFoundError,
} = require("../utils/errors");

const validationNotification = async (token, email, phone, companyName) => {
  const emailData = {
    token: token,
    company: companyName,
    year: moment().format("YYYY"),
  };
  let subject = "Company code Validation";

  // make email message from template
  let emailMessage = MakeEmailTemplate("otp.html", emailData);

  let smsMessage = `Your Pencom company code validation token is ${token}. Token expires in 10 minutes.`;

  let smsSent = false;
  let emailSent = false;

  // send to both, if they are available
  if (email) {
    // sends code to email
    emailSent = await sendMail(email, emailMessage, subject);
  }

  if (phone) {
    // sends code to phone
    smsSent = await sendSms(phone, smsMessage);
  }

  let responseMessage = "Company code verification is required, ";

  // hide the email and phone number
  let hiddenEmail = hideEmail(email);
  let hiddenPhone = hidePhone(phone);

  // if both sms and email was successful
  if (smsSent && emailSent) {
    responseMessage += `Token sent to email: ${hiddenEmail} and phone: ${hiddenPhone}`;
  } else if (smsSent) {
    responseMessage += `Token sent to phone: ${hiddenPhone}`;
  } else if (emailSent) {
    responseMessage += `Token sent to email: ${hiddenEmail}`;
  } else {
    responseMessage += "Token not sent";
  }
  return responseMessage;
};

const adminStaffInvite = async (req, res, next) => {
  try {
    /* Get the token parameters */
    let { userType, agentId, companyCode } = req.user;
    let { rsaPin, acceptUrl } = req.body;

    /* get user with rsaPin */
    const staff = await User.getUser({ rsaPin });
    const company = await User.getUser({ companyCode });

    /* if user was found */
    if (!staff) throw new BadRequestError("No Staff with RSA pin provided");

    /* ifuser is not verified */
    if (!staff.accountVerified)
      throw new BadRequestError(
        "Staff account is not verified. Staff shoule verify their email first!"
      );

    /* Check if the staff already exists for the comapny  */
    const staffExist = await CompanyValidation.getAdminStaff(
      staff.id,
      companyCode
    );
    if (staffExist)
      throw new BadRequestError("Staff is already a Sub-Admin of the company!");

    /* add user to staff admin record */
    const adminStaff = await CompanyValidation.createAdminStaff({
      agentId: staff.id,
      companyCode,
      companyId: agentId,
      rsaPin,
    });

    if (!adminStaff) throw new ServerError("Failed to create admin staff");

    const emailData = {
      staffName: staff.firstName + " " + staff.lastName,
      acceptLink: acceptUrl + "/" + adminStaff._id,
      companyName: company.companyName,
      year: new Date().getFullYear(),
    };

    /* send an invite to the staff and wait for response */
    const message = MakeEmailTemplate("staffInvite.html", emailData);

    const subject = `Invite to Sub-Admin Staff`;

    /* send welcome/verify email to the user */
    sendMail(staff.email, message, subject);

    return res.status(201).json({
      message: `Invite has been sent to ${staff.firstName} ${staff.lastName} to join as an Admin staff`,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("companyValidationController-adminStaffInvite", e);
    next(e);
  }
};

const staffAcceptInvite = async (req, res, next) => {
  try {
    /* Get the body parameters */
    let { token } = req.body;

    /* update the invite for the admin sttaff */
    const adminStaffUpdate = await CompanyValidation.updateAdminStaff(
      {
        _id: token,
        inviteAccepted: false,
      },
      { inviteAccepted: true }
    );

    /* if token as _id was not found or have been used before */
    if (!adminStaffUpdate)
      throw new BadRequestError("Link maybe broken or is no longer valid!");

    /* update user to staffAdmin */
    // const staff = await User.getUser({ rsaPin: adminStaffUpdate.rsaPin });
    await User.updateDetails(adminStaffUpdate.agentId, { userType: 300 });

    return res.status(201).json({
      message: `Invite has been accepted successfully`,
    });
  } catch (e) {
    console.log("companyValidationController-staffAcceptInvite", e);
    next(e);
  }
};

const companyValidate = async (req, res, next) => {
  try {
    // TODO:Get the token parameters //on validation get real data
    let { userType, agentId, companyName, email, phone } = req.user;

    // declaring all variables
    let { companyCode } = req.body;

    // check if the company has validated before
    let companyExists = await CompanyValidation.checkAgentCompany(agentId);

    // if agent has validated for the state before
    if (companyExists)
      throw new BadRequestError("Company code validation has been done before");

    // check if the companyCode exists for that stateCode before
    let { status: stats, code } = await CompanyValidation.checkValidation(
      companyCode,
      agentId
    );

    // if validation exists and verification has been done
    if (stats) throw new BadRequestError("Company code has been used");

    // if validation exists and verification has not been done
    if (!stats && code == "300") {
      // since the record exists, generate new token for verification and update the old token
      const updatedToken = await CompanyValidation.updateNewToken({
        agentId,
        companyCode,
      });

      // TODO: fix this = add email and phone
      let { token } = updatedToken;
      const responseMessage = await validationNotification(
        token,
        email,
        phone,
        companyName
      );

      return res.status(200).json({
        message: responseMessage,
        meta: {
          currentPage: 1,
          pageSize: 1,
          pageTotal: 1,
        },
      });
    }

    // if no validation exists at all, make a call to the company and log the response
    let { validationStatus, validationMessage } = await companyValidationCall({
      agentId,
      companyCode,
      email,
      phone,
    });

    // if there was any error with the validation
    if (!validationStatus) throw new BadRequestError(validationMessage);

    // since tthe validation is alright
    const createToken = await CompanyValidation.createToken({
      agentId,
      companyCode,
      email: email,
      phone: phone,
    });

    let { token } = createToken.toJSON();
    const responseMessage = await validationNotification(
      token,
      email,
      phone,
      companyName
    );

    return res.status(200).json({
      message: responseMessage,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("companyValidationController-companyValidate", e);
    next(e);
  }
};

const companyVerify = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId } = req.user;

    // declaring all variables
    let { token, companyCode } = req.body;

    // check if the token was found and the expiry date is yet to come,
    //and update the tokenVerified, if any found
    const tokenChecked = await CompanyValidation.checkToken({
      agentId,
      companyCode,
      token,
    });

    if (!tokenChecked)
      throw new NotFoundError("Token is Wrong, request for another one!");

    // update the validation in the
    await CompanyValidation.updateValidation({
      companyCode,
      agentId,
      doneStatus: 1,
    });

    await Wallet.createWallet({ companyCode, agentId });

    return res.status(200).json({
      message: "Account verification was successfully!",
    });
  } catch (e) {
    console.log("companyValidationController-verify", e);
    next(e);
  }
};

const resendVerify = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId, companyName } = req.user;

    // declaring all variables
    let { companyCode } = req.body;

    // get the company validation
    const previousValidation = await CompanyValidation.findValidation({
      companyCode,
      agentId,
      status: 0,
    });

    if (!previousValidation)
      throw new NotFoundError("Previous validation was not found");

    //generate new token for verification, find and update the old token, if any
    const updatedToken = await CompanyValidation.updateNewToken({
      agentId,
      companyCode,
    });

    let { email, phone, token } = updatedToken;

    const responseMessage = await validationNotification(
      token,
      email,
      phone,
      companyName
    );

    return res.status(200).json({
      message: responseMessage,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("companyValidationController-resendVerify", e);
    next(e);
  }
};

const getCompanyStaffs = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;

    const staffs = await CompanyValidation.getAdminStaffs(companyCode);

    return res.status(200).json({
      message: "Fetched admin staff successfully",
      data: staffs,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("companyValidationController-getCompanyStaffs", e);
    next(e);
  }
};

const removeCompanyStaffs = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;

    let { rsaPin } = req.body;

    const adminStaff = await CompanyValidation.deleteStaff(rsaPin, companyCode);

    /* Delete staff menu for the company */
    await Menu.deleteUserMenu(adminStaff.agentId, companyCode);

    return res.status(200).json({
      message: "Admin staff deleted successfully",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("companyValidationController-removeCompanyStaffs", e);
    next(e);
  }
};

module.exports = {
  resendVerify,
  adminStaffInvite,
  staffAcceptInvite,
  companyValidate,
  companyVerify,
  getCompanyStaffs,
  removeCompanyStaffs,
};
