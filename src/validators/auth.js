const Joi = require("joi");

const registerCompanySchema = Joi.object({
  companyName: Joi.string().required(),
  companyRc: Joi.string(),
  email: Joi.string().email().required(),
  verifyUrl: Joi.string().uri().required(),
  phone: Joi.string().required().min(3).max(15),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  password: Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
      )
    )
    .message(
      "Password must contain at least one digit, one uppercase, one lowercase and one special character and should not be less than 8 characters"
    ),
  confirmPassword: Joi.string().valid(Joi.ref("password")).messages({
    "any.only": "Password and confirmPassword does not match",
  }),
});

const registerCompany = async (req, res, next) => {
  try {
    await registerCompanySchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.error("registerCompanyValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const registerStaffSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  otherName: Joi.string(),
  email: Joi.string().email().required(),
  verifyUrl: Joi.string().uri().required(),
  phone: Joi.string().min(3).max(15),
  address: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  rsaPin: Joi.string().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
      )
    )
    .message(
      "Password must contain at least one digit, one uppercase, one lowercase and one special character and should not be less than 8 characters"
    ),
  confirmPassword: Joi.string().valid(Joi.ref("password")).messages({
    "any.only": "Password and confirmPassword does not match",
  }),
});

const registerStaff = async (req, res, next) => {
  try {
    await registerStaffSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("registerStaffValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const verifySchema = Joi.object({
  token: Joi.string().required(),
});

const verify = async (req, res, next) => {
  try {
    await verifySchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("verifyValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const loginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

const login = async (req, res, next) => {
  try {
    await loginSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("loginValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  verifyUrl: Joi.string().uri().required(),
});

const forgotPassword = async (req, res, next) => {
  try {
    await forgotPasswordSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("forgotPasswordValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const verifyResetchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().required(),
});

const verifyReset = async (req, res, next) => {
  try {
    await verifyResetchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("verifyResetValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  cpassword: Joi.string().min(6).required().valid(Joi.ref("password")),
  email: Joi.string().email().required(),
  token: Joi.string().required(),
});

const resetPassword = async (req, res, next) => {
  try {
    await resetPasswordSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("resetPasswordValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  cpassword: Joi.string().min(6).required().valid(Joi.ref("newPassword")),
  email: Joi.string().email().required(),
});

const changePassword = async (req, res, next) => {
  try {
    await changePasswordSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("changePasswordValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const companyValidateSchema = Joi.object({
  companyCode: Joi.string().required(),
});

const companyValidate = async (req, res, next) => {
  try {
    await companyValidateSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("companyValidateValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const companyVerifySchema = Joi.object({
  token: Joi.string().required(),
  companyCode: Joi.string().required(),
});

const companyVerify = async (req, res, next) => {
  try {
    await companyVerifySchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("companyVerifyValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const makeAdminStaffSchema = Joi.object({
  rsaPin: Joi.string().required(),
});

const makeAdminStaff = async (req, res, next) => {
  try {
    req.body = { ...req.body, ...req.params };
    await makeAdminStaffSchema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    console.log("makeAdminStaffValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

module.exports = {
  registerCompany,
  registerStaff,
  verify,
  forgotPassword,
  login,
  verifyReset,
  resetPassword,
  changePassword,
  companyValidate,
  companyVerify,
  makeAdminStaff,
};
