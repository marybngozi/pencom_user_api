const moment = require("moment");
const UploadSchedule = require("../data/uploadSchedule");
const Item = require("../data/item");
const { NotFoundError } = require("../utils/errors");
const MakeEmailTemplate = require("../utils/makeEmailTemplate");
const { sendMail, validateEmail } = require("../utils/notification");

const countItemMonth = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    let stat = {};

    const findObj = {};

    // for companies and admin staff
    if ((userType == 100 || userType == 300) && companyCode) {
      findObj["companyCode"] = companyCode;
    }
    // for staff
    if (userType == 200) {
      findObj["rsaPin"] = rsaPin;
      findObj["paid"] = 1;
    }

    let sums = [];

    if (userType != 400) {
      sums = await UploadSchedule.aggregateAndCount("month", findObj);
    } else {
      sums = await UploadSchedule.aggregateAndCountPfa("month", agentId);
    }

    console.log(sums);

    if (sums.length > 0) {
      stat = sums[0];
    } else {
      stat = {
        _id: null,
        amount: 0,
        employeeNormalContribution: 0,
        count: 0,
        employerNormalContribution: 0,
        employeeVoluntaryContribution: 0,
        employerVoluntaryContribution: 0,
      };
    }

    return res.status(200).json({
      message: "Month stat fetched successfully",
      data: stat,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("dashboardController-countItemMonth", e);
    next(e);
  }
};

const countItemYear = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, rsaPin, companyCode } = req.user;

    let stat = {};

    const findObj = {};

    // for companies and admin staff
    if ((userType == 100 || userType == 300) && companyCode) {
      findObj["companyCode"] = companyCode;
    } else {
      // for staff
      findObj["rsaPin"] = rsaPin;
      findObj["paid"] = 1;
    }

    let sums = [];

    if (userType != 400) {
      sums = await UploadSchedule.aggregateAndCount("year", findObj);
    } else {
      sums = await UploadSchedule.aggregateAndCountPfa("year", agentId);
    }

    if (sums.length > 0) {
      stat = sums[0];
    } else {
      stat = {
        _id: null,
        amount: 0,
        employeeNormalContribution: 0,
        count: 0,
        employerNormalContribution: 0,
        employeeVoluntaryContribution: 0,
        employerVoluntaryContribution: 0,
      };
    }

    return res.status(200).json({
      message: "Year stat fetched successfully",
      data: stat,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("dashboardController-countItemYear", e);
    next(e);
  }
};

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

const sumYearMonths = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, rsaPin, companyCode } = req.user;

    const findObj = {};

    // for companies and admin staff
    if ((userType == 100 || userType == 300) && companyCode) {
      findObj["companyCode"] = companyCode;
    }
    // for staff
    if (userType == 200) {
      findObj["rsaPin"] = rsaPin;
      findObj["paid"] = 1;
    }

    let sums = [];

    if (userType != 400) {
      sums = await UploadSchedule.aggregateSumGroup(findObj);
    } else {
      sums = await UploadSchedule.aggregateSumGroupPfa(agentId);
    }

    return res.status(200).json({
      message: "Year months stat fetched successfully",
      data: sums,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("dashboardController-sumYearMonths", e);
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

module.exports = {
  getItems,
  countItemMonth,
  countItemYear,
  getStates,
  sumYearMonths,
  testTemplates,
};
