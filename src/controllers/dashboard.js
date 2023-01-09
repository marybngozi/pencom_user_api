const moment = require("moment");
const UploadSchedule = require("../data/uploadSchedule");
const Item = require("../data/item");
const User = require("../data/user");
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

    if (userType == 100) {
      /************* COMPANY *************/
      searchBody["companyCode"] = companyCode;
      totals = await UploadSchedule.sumAll(searchBody);
    } else if (userType <= 300) {
      /************* STAFF *************/
      searchBody["rsaPin"] = rsaPin;
      totals = await UploadSchedule.sumAll(searchBody);
    } else {
      /************* PFC & PFA *************/
      searchBody["agentId"] = agentId;
      searchBody["userType"] = userType;
      totals = await Item.sumAll(searchBody);
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
      /************* COMPANY *************/
      searchBody["companyCode"] = companyCode;
      searchBody["year"] = new Date().getFullYear();
      searchBody["month"] = month ? month : new Date().getMonth(); //cos js month is less than 1
      count = await UploadSchedule.countStaff4Month(searchBody);
    } else if (userType <= 300) {
      /************* STAFF *************/
      searchBody["rsaPin"] = rsaPin;
      count = await UploadSchedule.countStaffContributingCompanies(searchBody);
    } else if (userType == 400) {
      /************* PFC *************/
      const pfc = await User.getPfc({ userId: agentId });
      searchBody["pfcId"] = pfc.id;
      count = await Item.countStaffContributingCompanies(searchBody);
    } else if (userType == 500) {
      /************* PFA *************/
      const pfa = await User.getPfa({ userId: agentId });
      searchBody["pfaCode"] = pfa.pfaCode;
      count = await Item.countStaffContributingCompanies(searchBody);
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

    let { month, contributionType, viewOption } = req.body;
    let year = new Date().getFullYear();
    month = month ? month : new Date().getMonth(); //cos js month is less than 1

    let data1 = 0;
    let data2 = 0;
    const searchBody = {
      year: year,
    };

    if (userType == 100) {
      /*************** COMPANY ****************/
      searchBody["companyCode"] = companyCode;
      /* Get the sum for the year */
      data2 = await UploadSchedule.sumAll(searchBody);
      data2 = data2[contributionType];
      searchBody["month"] = month == 0 ? 12 : month;
      searchBody["year"] = month == 0 ? year - 1 : year;
      /* Get the sum for the month */
      data1 = await UploadSchedule.sumAll(searchBody);
      data1 = data1[contributionType];
    } else if (userType == 200 || userType == 300) {
      /*************** STAFF *****************/
      if (viewOption && viewOption != "all")
        searchBody["companyCode"] = viewOption;
      searchBody["rsaPin"] = rsaPin;
      /* Get the sum for the year */
      data2 = await UploadSchedule.sumAll(searchBody);
      data2 = data2[contributionType];
      searchBody["month"] = month == 0 ? 12 : month;
      searchBody["year"] = month == 0 ? year - 1 : year;
      /* Get the sum for the month */
      data1 = await UploadSchedule.sumAll(searchBody);
      data1 = data1[contributionType];
    } else if (userType == 400) {
      /************* PFC *************/
      if (viewOption && viewOption != "all")
        searchBody[contributionType] = viewOption;
      searchBody["userType"] = userType;
      searchBody["agentId"] = agentId;
      data2 = await Item.sumAll(searchBody);
      searchBody["month"] = month == 0 ? 12 : month;
      searchBody["year"] = month == 0 ? year - 1 : year;
      /* Get the sum for the month */
      data1 = await Item.sumAll(searchBody);
    } else if (userType == 500) {
      /************************************ PFA ***************************/
      if (viewOption && viewOption != "all")
        searchBody["companyCode"] = viewOption;
      searchBody["userType"] = userType;
      searchBody["agentId"] = agentId;
      if (contributionType == "date") {
        data2 = await Item.sumAll(searchBody);
        searchBody["month"] = month == 0 ? 12 : month;
        searchBody["year"] = month == 0 ? year - 1 : year;
        /* Get the sum for the month */
        data1 = await Item.sumAll(searchBody);
      } else {
        delete searchBody.year;
        searchBody["month"] = month == 0 ? 12 : month;
        /* Get all the sum for the group */
        const data = await Item.sumAllGroup(searchBody);
        /* separate into tthe types */
        data1 = data["employerNormalContribution"];
        data2 = data["employeeNormalContribution"];
      }
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

    let { year, viewOption } = req.body;

    let series = [];
    const searchBody = {
      year: year ? year : new Date().getFullYear(),
    };

    if (userType == 100) {
      /**************** COMPANY *****************/
      searchBody["companyCode"] = companyCode;
      series = await UploadSchedule.sumAllByMonth(searchBody);
    } else if (userType == 200 || userType == 300) {
      /**************** STAFF *****************/
      if (viewOption && viewOption != "all")
        searchBody["companyCode"] = viewOption;
      searchBody["rsaPin"] = rsaPin;
      series = await UploadSchedule.sumAllByMonth(searchBody);
    } else {
      /**************** PFC & PFA *****************/
      searchBody["userType"] = userType;
      searchBody["agentId"] = agentId;
      searchBody["viewOption"] = viewOption;
      series = await Item.sumAllByMonth(searchBody);
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

    let { year, month } = req.body;

    let data = [];
    const searchBody = {
      year: year ? year : new Date().getFullYear(),
    };

    if (userType == 100) {
      /**************** COMPANY *****************/
      searchBody["companyCode"] = companyCode;
      data = await UploadSchedule.sumCountAllByMonth(searchBody);
    } else if (userType == 200 || userType == 300) {
      /**************** STAFF *****************/
      searchBody["rsaPin"] = rsaPin;
      data = await UploadSchedule.sumCountAllByMonth(searchBody);
    } else {
      /**************** PFC *****************/
      searchBody["agentId"] = agentId;
      if (month && month != "All months") searchBody["month"] = month;
      data = await Item.sumCountAllByMonth(searchBody);
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

const pinkSeeAll = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, companyCode, rsaPin } = req.user;

    // let { year } = req.body;

    let data = {};
    const searchBody = {};

    if (userType == 200 || userType == 300) {
      /************* STAFF *************/
      searchBody["rsaPin"] = rsaPin;
      data = await UploadSchedule.sumStaffContributingCompanies(
        searchBody,
        req.query
      );
    } else if (userType == 400) {
      /************* PFC *************/
      const pfc = await User.getPfc({ userId: agentId });
      searchBody["pfcId"] = pfc.id;
      data = await Item.sumStaffContributingCompanies(searchBody, req.query);
    } else if (userType == 500) {
      /************* PFA *************/
      const pfa = await User.getPfa({ userId: agentId });
      searchBody["pfaCode"] = pfa.pfaCode;
      data = await Item.sumStaffContributingCompanies(searchBody, req.query);
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      ...data[0],
    });
  } catch (e) {
    console.log("dashboardController-pinkSeeAll", e);
    next(e);
  }
};

const listUserCompanies = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType, rsaPin } = req.user;

    let data = [];
    const searchBody = {};

    if (userType == 200 || userType == 300) {
      /************* STAFF *************/
      searchBody["rsaPin"] = rsaPin;
      data = await UploadSchedule.staffContributingCompanies(searchBody);
    } else if (userType == 400) {
      /************* PFC *************/
      const pfc = await User.getPfc({ userId: agentId });
      let pfas = await User.getAllPfas("exclude", { pfc: pfc.id });
      pfas = pfas.map((pfa) => pfa.pfaCode);
      searchBody["pfaCode"] = { $in: pfas };
      data = await UploadSchedule.staffContributingCompanies(searchBody);
    } else if (userType == 500) {
      /************* PFA *************/
      const pfa = await User.getPfa({ userId: agentId });
      searchBody["pfaCode"] = pfa.pfaCode;
      data = await UploadSchedule.staffContributingCompanies(searchBody);
    }

    return res.status(200).json({
      message: "Data fetched successfully",
      data: data,
    });
  } catch (e) {
    console.log("dashboardController-listUserCompanies", e);
    next(e);
  }
};

const listPfas = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId } = req.user;

    /************* PFC *************/
    const pfc = await User.getPfc({ userId: agentId });
    let pfas = await User.getAllPfas("exclude", { pfc: pfc.id });
    pfas = pfas.map((pfa) => ({
      label: pfa.pfaName,
      value: pfa.pfaCode,
    }));

    return res.status(200).json({
      message: "Data fetched successfully",
      data: pfas,
    });
  } catch (e) {
    console.log("dashboardController-listPfas", e);
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
  pinkSeeAll,
  listUserCompanies,
  listPfas,
};
