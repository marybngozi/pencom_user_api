const Joi = require("joi");

const deleteScheduleSchema = Joi.object({
  deleteArr: Joi.array().items(Joi.string()),
});

const deleteSchedule = async (req, res, next) => {
  try {
    await deleteScheduleSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.error("deleteScheduleValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const deleteScheduleBatchSchema = Joi.object({
  uploadBatchId: Joi.string().required(),
});

const deleteScheduleBatch = async (req, res, next) => {
  try {
    await deleteScheduleBatchSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.error("deleteScheduleBatchValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const listScheduleSchema = Joi.object({
  itemCode: Joi.string().required(),
  dateStart: Joi.any(),
  dateEnd: Joi.any(),
});

const listSchedule = async (req, res, next) => {
  try {
    await listScheduleSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("listScheduleValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const listProcessedScheduleSchema = Joi.object({
  itemCode: Joi.any(),
  month: Joi.any(),
  year: Joi.any(),
});

const listProcessedSchedule = async (req, res, next) => {
  try {
    await listProcessedScheduleSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("listProcessedScheduleValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const summarizeScheduleSchema = Joi.object({
  itemCode: Joi.string().required(),
  month: Joi.string().required(),
  year: Joi.number().required(),
});

const summarizeSchedule = async (req, res, next) => {
  try {
    await summarizeScheduleSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("summarizeScheduleValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const processScheduleSchema = Joi.object({
  payDetails: Joi.object({
    amount: Joi.number().required(),
    itemCode: Joi.string().required(),
    scheduleUrl: Joi.string().uri().required(),
    month: Joi.string().required(),
    year: Joi.number().required(),
  }),
  // payData: Joi.array().items(Joi.object()),
});

const processSchedule = async (req, res, next) => {
  try {
    await processScheduleSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("processScheduleValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const uploadScheduleSchema = Joi.object({
  id: Joi.string().required(),
  scheduleUrl: Joi.string().uri().required(),
});

const uploadSchedule = async (req, res, next) => {
  try {
    await uploadScheduleSchema.validateAsync(req.body, { abortEarly: true });
    next();
  } catch (err) {
    console.log("uploadScheduleValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

const listProcessedScheduleItemSchema = Joi.object({
  invoiceNo: Joi.any().required(),
});

const listProcessedScheduleItem = async (req, res, next) => {
  try {
    req.body = { ...req.body, ...req.params };
    await listProcessedScheduleItemSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("listProcessedScheduleItemValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};
const getContributionSchema = Joi.object({
  yearOption: Joi.any(),
  monthOption: Joi.any(),
  companyOption: Joi.any(),
});

const getContribution = async (req, res, next) => {
  try {
    await getContributionSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    next();
  } catch (err) {
    console.log("getContributionValidator", err.message);
    return res.status(400).json({
      message: err.message,
      errorCode: "V400",
    });
  }
};

module.exports = {
  deleteSchedule,
  deleteScheduleBatch,
  listSchedule,
  summarizeSchedule,
  processSchedule,
  uploadSchedule,
  listProcessedSchedule,
  listProcessedScheduleItem,
  getContribution,
};
