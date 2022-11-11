const Joi = require("joi");

const getStaffMenusSchema = Joi.object({
  rsaPin: Joi.string().required(),
  companyCode: Joi.string().required(),
});

const getStaffMenus = async (req, res, next) => {
  try {
    await getStaffMenusSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.error("getStaffMenusValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

module.exports = {
  getStaffMenus,
};
