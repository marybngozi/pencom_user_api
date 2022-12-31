const moment = require("moment");
const UploadSchedule = require("../data/uploadSchedule");
const Item = require("../data/item");
const { NotFoundError } = require("../utils/errors");
const MakeEmailTemplate = require("../utils/makeEmailTemplate");
const { sendMail, validateEmail } = require("../utils/notification");

const getItems = async (req, res, next) => {
  try {
    const items = await Item.findAllItems();

    if (!items.length) throw new NotFoundError("Items not found");

    return res.status(200).json({
      message: "Items fetched successfully",
      data: items,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("dashboardController-getItems", e);
    next(e);
  }
};

const getStates = async (req, res, next) => {
  try {
    const states = await Item.getAllStates();

    if (!states.length) throw new NotFoundError("States not found");

    return res.status(200).json({
      message: "States fetched successfully",
      data: states,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("dashboardController-getStates", e);
    next(e);
  }
};

const testTemplates = async (req, res, next) => {
  try {
    // send email
    const email = "umunnawill@gmail.com";
    const emailData = {
      year: new Date().getFullYear(),
    };

    const message = MakeEmailTemplate("paymentPfc.html", emailData);

    const subject = `Welcome to Pencom`;

    // send welcome/verify email tto the user
    // sendMail(email, message, subject);
    validateEmail(email);

    return res.status(201).json({
      message: `testing email has been sent to ${email}`,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const blueBox = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    let { year } = req.body;

    let totals = 0;
    const searchBody = {
      year: year ? year : new Date().getFullYear(),
    };

    if (userType <= 300) {
      searchBody["companyCode"] = companyCode;
      totals = await UploadSchedule.sumAll(searchBody);
    } else {
      totals = await Item.sumAll();
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      totals: totals,
    });
  } catch (e) {
    console.log("dashboardController-blueBox", e);
    next(e);
  }
};

const pinkBox = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    let { month } = req.body;

    let count = 0;
    const searchBody = {};

    if (userType == 100) {
      searchBody["companyCode"] = companyCode;
      searchBody["year"] = new Date().getFullYear();
      searchBody["month"] = month ? month : new Date().getMonth(); //cos js month is less than 1
      count = await UploadSchedule.countStaff4Month(searchBody);
    } else {
      count = await Item.sumAll();
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      count: count,
    });
  } catch (e) {
    console.log("dashboardController-pinkBox", e);
    next(e);
  }
};

const grayBox = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    let { month, contributionType } = req.body;

    let data1 = 0;
    let data2 = 0;
    const searchBody = {};

    if (userType == 100) {
      searchBody["companyCode"] = companyCode;
      searchBody["year"] = new Date().getFullYear();
      /* Get the sum for the year */
      data2 = await UploadSchedule.sumAll(searchBody);
      data2 = data2[contributionType];
      searchBody["month"] = month ? month : new Date().getMonth(); //cos js month is less than 1
      /* Get the sum for the month */
      data1 = await UploadSchedule.sumAll(searchBody);
      data1 = data1[contributionType];
    } else {
      data1 = await Item.sumAll();
      data2 = await Item.sumAll();
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      totals: { data1, data2 },
    });
  } catch (e) {
    console.log("dashboardController-grayBox", e);
    next(e);
  }
};

const graphBox = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    let { year } = req.body;

    let series = [];
    const searchBody = {};

    if (userType == 100) {
      searchBody["companyCode"] = companyCode;
      searchBody["year"] = year ? year : new Date().getFullYear();
      series = await UploadSchedule.sumAllByMonth(searchBody);
    } else {
      series = await Item.sumAll();
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      series: series,
    });
  } catch (e) {
    console.log("dashboardController-graphBox", e);
    next(e);
  }
};

const tableBox = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    let { year } = req.body;

    let data = [];
    const searchBody = {};

    if (userType == 100) {
      searchBody["companyCode"] = companyCode;
      searchBody["year"] = year ? year : new Date().getFullYear();
      data = await UploadSchedule.sumCountAllByMonth(searchBody);
    } else {
      data = await Item.sumAll();
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      data: data,
    });
  } catch (e) {
    console.log("dashboardController-tableBox", e);
    next(e);
  }
};

module.exports = {
  getItems,
  testTemplates,
  getStates,
  blueBox,
  pinkBox,
  grayBox,
  graphBox,
  tableBox,
};
