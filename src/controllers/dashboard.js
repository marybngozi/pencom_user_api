const moment = require("moment");
const UploadSchedule = require("../data/uploadSchedule");
const Item = require("../data/item");
const { NotFoundError } = require("../utils/errors");

const countItemMonth = async (req, res) => {
  try {
    // Get the token parameters
    let { userType, companyCode, rsaPin } = req.user;

    // Get Records for the Month
    const date = new Date();
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

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

    let sums = await UploadSchedule.aggregateAndCount(
      startDate,
      endDate,
      findObj
    );

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

const countItemYear = async (req, res) => {
  try {
    // Get the token parameters
    let { userType, rsaPin, companyCode } = req.user;

    // Get Records for the year
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date();

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

    let sums = await UploadSchedule.aggregateAndCount(
      startDate,
      endDate,
      findObj
    );

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

const sumYearMonths = async (req, res) => {
  try {
    // Get the token parameters
    let { userType, rsaPin, companyCode } = req.user;

    // Get Records for the year
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date();

    const findObj = {};

    // for companies and admin staff
    if ((userType == 100 || userType == 300) && companyCode) {
      findObj["companyCode"] = companyCode;
    } else {
      // for staff
      findObj["rsaPin"] = rsaPin;
      findObj["paid"] = 1;
    }

    let sums = await UploadSchedule.aggregateSumGroup(
      startDate,
      endDate,
      findObj
    );

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

module.exports = {
  getItems,
  countItemMonth,
  countItemYear,
  getStates,
  sumYearMonths,
};
