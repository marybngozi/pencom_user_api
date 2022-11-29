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

const listBatchContributionsSchema = Joi.object({
  itemCode: Joi.any(),
  dateStart: Joi.any(),
  dateEnd: Joi.any(),
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

module.exports = {
  walletPayment,
  listBatchContributions,
  listContributionItems,
};
