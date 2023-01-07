const { Router } = require("express");

const api = Router();
const authController = require("../controllers/auth");
const companyValidationController = require("../controllers/companyValidation");
const validator = require("../validators/auth");
const { authenticate, accountValidate } = require("../middlewares");

module.exports = () => {
  // ----------Auth specific routes --------------

  /* register a company */
  api.post(
    "/company-register",
    validator.registerCompany,
    authController.registerCompany
  );

  /* register a staff */
  api.post(
    "/staff-register",
    validator.registerStaff,
    authController.registerStaff
  );

  /* login a user */
  api.post("/login", validator.login, authController.login);

  /* verify a user account */
  api.post("/verify", validator.verify, authController.verifyAccount);

  /* send email for forgot password */
  api.post(
    "/forgot-password",
    validator.forgotPassword,
    authController.forgotPassword
  );

  /* verify a reset code */
  api.post("/verify-reset", validator.verifyReset, authController.verifyReset);

  /* reset a user password to new one */
  api.post(
    "/reset-password",
    validator.resetPassword,
    authController.resetPassword
  );

  /* change a user password to new one with the old one */
  api.post(
    "/change-password",
    authenticate,
    validator.changePassword,
    authController.changePassword
  );

  /* validate company code with external call */
  api.post(
    "/company-validate",
    authenticate,
    validator.companyValidate,
    companyValidationController.companyValidate
  );

  /* verify company code using token */
  api.post(
    "/company-verify",
    authenticate,
    validator.companyVerify,
    companyValidationController.companyVerify
  );

  /* resend company code token */
  api.post(
    "/resend-verify",
    authenticate,
    validator.companyValidate,
    companyValidationController.resendVerify
  );

  /* get user */
  api.get(
    "/staffs/:rsaPin",
    authenticate,
    validator.makeAdminStaff,
    authController.getStaff
  );

  /* create admin staff, send invite */
  api.post(
    "/admin-staff-invite",
    authenticate,
    accountValidate,
    validator.adminStaffInvite,
    companyValidationController.adminStaffInvite
  );

  /* admin staff accept invite */
  api.post(
    "/admin-staff-accept",
    validator.verify,
    companyValidationController.staffAcceptInvite
  );

  /* get company admin staffs */
  api.get(
    "/get-staffs",
    authenticate,
    accountValidate,
    companyValidationController.getCompanyStaffs
  );

  /* delete a company admin staff */
  api.post(
    "/delete-staff",
    authenticate,
    accountValidate,
    validator.makeAdminStaff,
    companyValidationController.removeCompanyStaffs
  );

  return api;
};
