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

const updateStaffMenuSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  subMenuIds: Joi.array().items(Joi.string().hex().length(24)).required(),
});

const updateStaffMenu = async (req, res, next) => {
  try {
    await updateStaffMenuSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.error("updateStaffMenuValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

module.exports = {
  getStaffMenus,
  updateStaffMenu,
};
