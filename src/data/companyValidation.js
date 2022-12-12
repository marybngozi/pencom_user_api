const moment = require("moment");
const User = require("./user");
const { CompanyValidation } = require("../models/companyValidation");
const { CompanyValidationToken } = require("../models/companyValidationToken");
const { AdminStaff } = require("../models/adminStaff");

const checkValidation = async (companyCode, agentId) => {
  let findObj = {
    deleted: false,
    companyCode,
    // agentId,
  };
  let itExists = await CompanyValidation.findOne(findObj, {
    createdAt: 0,
    updatedAt: 0,
  });

  if (!itExists) {
    return {
      status: false,
      code: "404",
      phone: null,
      email: null,
    };
  }

  if (agentId != itExists.agentId) {
    return {
      status: true,
      code: "N200",
      phone: itExists.verificationPhone,
      email: itExists.verificationEmail,
    };
  }

  // if the validation has been verified
  if (itExists.doneStatus == 1) {
    return {
      status: true,
      code: "U200",
      phone: itExists.verificationPhone,
      email: itExists.verificationEmail,
    };
  }

  return {
    status: false,
    code: "300",
    phone: itExists.verificationPhone,
    email: itExists.verificationEmail,
  };
};

const checkAgentCompany = async (agentId) => {
  let findObj = {
    deleted: false,
    agentId,
    doneStatus: 1,
  };

  let itExists = await CompanyValidation.findOne(findObj, {
    createdAt: 0,
    updatedAt: 0,
  });

  if (itExists) return true;
  return false;
};

const createValidation = async ({
  apiResponse,
  companyCode,
  agentId,
  vEmail,
  vPhone,
}) => {
  return await CompanyValidation.create({
    verificationEmail: vEmail,
    verificationPhone: vPhone,
    agentId,
    apiResponse: JSON.stringify(apiResponse),
    companyCode,
  });
};

const updateValidation = async ({ companyCode, agentId, doneStatus }) => {
  // update user table too
  const compValidation = await CompanyValidation.findOneAndUpdate(
    {
      doneStatus: 0,
      deleted: false,
      agentId,
      companyCode,
    },
    {
      doneStatus: doneStatus,
    },
    { new: true }
  );

  await User.updateDetails(agentId, { companyCode });

  return compValidation;
};

const findAllValidations = async (agentId) => {
  return await CompanyValidation.find(
    {
      deleted: false,
      doneStatus: 1,
      agentId,
    },
    {
      createdAt: 0,
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
    }
  );
};

const findValidation = async ({ companyCode, agentId, status }) => {
  const findObj = {
    deleted: false,
    doneStatus: status,
    companyCode,
  };
  if (agentId) {
    findObj["agentId"] = agentId;
  }
  if (validationId) {
    findObj["validationId"] = validationId;
  }

  return await CompanyValidation.findOne(findObj, {
    createdAt: 0,
    updatedAt: 0,
    deletedAt: 0,
    deleted: false,
    apiResponse: 0,
  });
};

const createToken = async ({ agentId, companyCode, email, phone }) => {
  // make 6 digits token
  const token = Math.floor(100000 + Math.random() * 900000);

  // Create an expiry time of 15 minutes
  const expiryTime = Number(moment().add(15, "minutes").format("x"));

  return await CompanyValidationToken.create({
    tokenVerified: 0,
    agentId,
    email,
    phone,
    companyCode,
    token,
    expiryTime,
  });
};

const updateNewToken = async ({ agentId, companyCode }) => {
  // make 4 digits token
  const newToken = Math.floor(100000 + Math.random() * 900000);

  // Create an expiry time of 15 minutes
  const expiryTime = Number(moment().add(15, "minutes").format("x"));

  return await CompanyValidationToken.findOneAndUpdate(
    {
      tokenVerified: 0,
      agentId,
      companyCode,
    },
    {
      token: newToken,
      expiryTime,
      updatedAt: new Date(),
    },
    { new: true }
  );
};

const checkToken = async ({ agentId, companyCode, token }) => {
  // validate an expiry time of 10 minutes
  const currentTime = Date.now();

  const tokenFound = await CompanyValidationToken.findOneAndUpdate(
    {
      tokenVerified: 0,
      agentId,
      companyCode,
      token,
      expiryTime: { $gte: currentTime },
    },
    {
      tokenVerified: 1,
      updatedAt: new Date(),
    },
    { new: true }
  );

  if (tokenFound) return true;
  return false;
};

const getAdminStaff = async (agentId, companyCode = null) => {
  const findObj = {
    deleted: false,
    agentId,
  };

  if (companyCode) {
    findObj["companyCode"] = companyCode;
  }

  return await AdminStaff.findOne(findObj, {
    createdAt: 0,
    updatedAt: 0,
    deletedAt: 0,
    deleted: false,
  });
};

const getAdminStaffs = async (companyCode) => {
  return await AdminStaff.find(
    { deleted: false, companyCode },
    {
      createdAt: 0,
      updatedAt: 0,
      deletedAt: 0,
      deleted: 0,
    }
  ).populate("agentId");
};

const createAdminStaff = async ({
  agentId,
  companyCode,
  rsaPin,
  companyId,
}) => {
  return await AdminStaff.create({
    agentId,
    companyCode,
    companyId,
    rsaPin,
  });
};

const deleteStaff = async (rsaPin, companyCode) => {
  return await AdminStaff.findOneAndUpdate(
    {
      rsaPin,
      companyCode,
      deleted: false,
    },
    {
      deleted: true,
    },
    { new: true }
  );
};

module.exports = {
  checkAgentCompany,
  updateNewToken,
  createToken,
  checkToken,
  checkValidation,
  createValidation,
  updateValidation,
  findAllValidations,
  findValidation,
  getAdminStaff,
  createAdminStaff,
  getAdminStaffs,
  deleteStaff,
};
