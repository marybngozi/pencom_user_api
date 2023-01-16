const Joi = require("joi");

const walletPaymentSchema = Joi.object({
  invoiceNo: Joi.string().required(),
  walletCode: Joi.string().required(),
  companyCode: Joi.string().required(),
});

const walletPayment = async (req, res, next) => {
  try {
    await walletPaymentSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("walletPaymentValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const unremittedContributionsSchema = Joi.object({
  company: Joi.any(),
  dateStart: Joi.any(),
  dateEnd: Joi.any(),
});

const unremittedContributions = async (req, res, next) => {
  try {
    await unremittedContributionsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("unremittedContributionsValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const listBatchContributionsSchema = Joi.object({
  company: Joi.any(),
  dateStart: Joi.any(),
  dateEnd: Joi.any(),
  year: Joi.any(),
  month: Joi.any(),
  searchTerm: Joi.any(),
});

const listBatchContributions = async (req, res, next) => {
  try {
    await listBatchContributionsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("listBatchContributionsValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const listContributionItemsSchema = Joi.object({
  pfaCode: Joi.any(),
  companyCode: Joi.string().required(),
  batchId: Joi.string().required(),
});

const listContributionItems = async (req, res, next) => {
  try {
    await listContributionItemsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("listContributionItemsValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};
const transmitContributionsSchema = Joi.object({
  pfaCode: Joi.string().required(),
});

const transmitContributions = async (req, res, next) => {
  try {
    await transmitContributionsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("transmitContributionsValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

module.exports = {
  walletPayment,
  unremittedContributions,
  listBatchContributions,
  listContributionItems,
  transmitContributions,
};
