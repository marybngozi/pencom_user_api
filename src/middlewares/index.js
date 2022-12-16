/* eslint-disable consistent-return */
const { Router } = require("express");
const User = require("../data/user");
const CompanyValidation = require("../data/companyValidation");
const jwt = require("../utils/jwt");
const { UnAuthorizedAccess } = require("../utils/errors");

const index = () => {
  const api = Router();

  // add middleware you want for all routes here

  return api;
};

const authenticate = async (req, res, next) => {
  try {
    let token =
      req.headers["x-access-token"] ||
      req.headers.authorization ||
      req.body.token ||
      req.query.token; // Express headers are auto converted to lowercase

    if (!token)
      throw new UnAuthorizedAccess("Auth token is not supplied", "N403");

    if (token.startsWith("Bearer ")) token = token.replace("Bearer", "").trim(); // Remove Bearer from string

    const userId = jwt.verify(token);

    if (!userId) {
      throw new UnAuthorizedAccess("Token not valid", "N403");
    }

    let user = await User.getUserById(userId);

    if (!user) {
      throw new UnAuthorizedAccess("Access denied", "N403");
    }

    user.agentId = userId;
    req.user = user;

    next();
  } catch (e) {
    console.log("middleware-authenticate-error:", e);
    next(e);
  }
};

const accountValidate = async (req, res, next) => {
  try {
    if (req.user.userType != 100 && req.user.userType != 300) {
      throw new UnAuthorizedAccess("Access denied to resource");
    }

    // for companies
    if (req.user.userType == 100) {
      const isCompanyValidated = await CompanyValidation.checkAgentCompany(
        req.user.agentId
      );

      if (!isCompanyValidated) {
        throw new UnAuthorizedAccess(
          "Company Code has to be validated to proceed"
        );
      }
    }

    // for AdminStaff
    if (req.user.userType == 300) {
      // get the company's code form staff record
      const adminStaff = await CompanyValidation.getAdminStaff(
        req.user.agentId
      );

      if (!adminStaff) {
        throw new UnAuthorizedAccess(
          "Company Code has to be validated to proceed"
        );
      }
    }

    next();
  } catch (e) {
    console.log("middleware-accountValidate-error:", e);
    next(e);
  }
};

module.exports = {
  index,
  authenticate,
  accountValidate,
};
