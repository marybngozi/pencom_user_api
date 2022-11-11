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
module.exports = {
  walletPayment,
};
