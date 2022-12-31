const mongoose = require("mongoose");
const moment = require("moment");
const { Item } = require("../models/item");
const { Pfc } = require("../models/pfc");
// const { Pfa } = require("../models/pfa");
const { PfcContribution } = require("../models/pfcContribution");
const { State } = require("../models/state");
let PAGESIZE = 10;

const findAllItems = async () => {
  return await Item.find({ deleted: false }, { createdAt: 0, updatedAt: 0 });
};

const findItem = async (itemCode) => {
  return await Item.findOne(
    { deleted: false, itemCode },
    { createdAt: 0, updatedAt: 0 }
  );
};

const getAllStates = async () => {
  return await State.find(
    { deleted: false },
    { deleted: 0, createdAt: 0, updatedAt: 0 }
  );
};

const addContributions = async (contributions) => {
  return await PfcContribution.create(contributions);
};

const getBatchContributionsPfc = async ({
  itemCode,
  startDate,
  endDate,
  agentId,
}) => {
  const findObj = {
    deleted: false,
  };

  if (itemCode) {
    findObj["itemCode"] = itemCode;
  }

  const pfcx = await Pfc.findOne(
    {
      userId: agentId,
    },
    {
      id: 1,
    }
  );
  findObj["pfcId"] = mongoose.Types.ObjectId(pfcx.id);

  const contributions = await PfcContribution.aggregate([
    {
      $match: { ...findObj, createdAt: { $gte: startDate, $lte: endDate } },
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "scheduleId",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "companyCode",
        foreignField: "companyCode",
        as: "company",
      },
    },
    {
      $lookup: {
        from: "pfas",
        localField: "pfaCode",
        foreignField: "pfaCode",
        as: "pfa",
      },
    },
    {
      $set: {
        amount: {
          $arrayElemAt: ["$schedule.amount", 0],
        },
        companyName: {
          $arrayElemAt: ["$company.companyName", 0],
        },
        pfaName: {
          $arrayElemAt: ["$pfa.pfaName", 0],
        },
      },
    },
    {
      $group: {
        _id: {
          companyCode: "$companyCode",
          batchId: "$batchId",
        },
        batchId: {
          $first: "$batchId",
        },
        itemCount: {
          $count: {},
        },
        month: {
          $first: "$month",
        },
        year: {
          $first: "$year",
        },
        companyName: {
          $first: "$companyName",
        },
        amount: {
          $sum: "$amount",
        },
        createdAt: {
          $first: "$createdAt",
        },
        transmitted: {
          $min: "$transmitted",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return contributions;
};

const getContributionPfas = async (
  { companyCode, batchId, agentId },
  { page = 1, size }
) => {
  const findObj = {
    deleted: false,
    batchId,
    companyCode,
  };

  const pfcx = await Pfc.findOne(
    {
      userId: agentId,
    },
    {
      id: 1,
    }
  );
  findObj["pfcId"] = mongoose.Types.ObjectId(pfcx.id);

  if (size && size <= 10) PAGESIZE = Number(size);
  const skip = (Number(page) - 1) * PAGESIZE;

  const contributions = await PfcContribution.aggregate([
    {
      $match: findObj,
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "scheduleId",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $set: {
        amount: {
          $arrayElemAt: ["$schedule.amount", 0],
        },
      },
    },
    {
      $lookup: {
        from: "pfas",
        localField: "pfaCode",
        foreignField: "pfaCode",
        as: "pfa",
      },
    },
    {
      $set: {
        pfa: {
          $arrayElemAt: ["$pfa", 0],
        },
      },
    },
    {
      $group: {
        _id: "$pfa.pfaCode",
        pfaName: {
          $first: "$pfa.pfaName",
        },
        itemCount: {
          $count: {},
        },
        amount: {
          $sum: "$amount",
        },
        transmitted: {
          $min: "$transmitted",
        },
      },
    },
    {
      $sort: {
        pfaName: 1,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }, { $addFields: { page: page } }],
        data: [{ $skip: skip }, { $limit: PAGESIZE }],
      },
    },
    {
      $project: {
        data: 1,
        meta: { $arrayElemAt: ["$metadata", 0] },
      },
    },
  ]);

  return contributions;
};

const getContributionItems = async (
  { companyCode, batchId, pfaCode },
  { page = 1, size }
) => {
  const findObj = {
    deleted: false,
    batchId,
    companyCode,
    pfaCode,
  };

  if (size && size <= 10) PAGESIZE = Number(size);
  const skip = (Number(page) - 1) * PAGESIZE;

  const contributions = await PfcContribution.aggregate([
    {
      $match: findObj,
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "scheduleId",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $set: {
        schedule: {
          $arrayElemAt: ["$schedule", 0],
        },
      },
    },
    {
      $project: {
        _id: "$schedule._id",
        staffName: {
          $concat: ["$schedule.firstName", " ", "$schedule.lastName"],
        },
        rsaPin: "$schedule.rsaPin",
        amount: "$schedule.amount",
        employeeNormalContribution: "$schedule.employeeNormalContribution",
        employerNormalContribution: "$schedule.employerNormalContribution",
        employeeVoluntaryContribution:
          "$schedule.employeeVoluntaryContribution",
        employerVoluntaryContribution:
          "$schedule.employerVoluntaryContribution",
        transmitted: "$transmitted",
      },
    },
    {
      $sort: {
        staffName: 1,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }, { $addFields: { page: page } }],
        data: [{ $skip: skip }, { $limit: PAGESIZE }],
      },
    },
    {
      $project: {
        data: 1,
        meta: { $arrayElemAt: ["$metadata", 0] },
      },
    },
  ]);

  return contributions;
};

const buildContributionPfas = async ({ companyCode, batchId, agentId }) => {
  const findObj = {
    deleted: false,
    batchId,
    companyCode,
  };

  const pfcx = await Pfc.findOne(
    {
      userId: agentId,
    },
    {
      id: 1,
    }
  );
  findObj["pfcId"] = mongoose.Types.ObjectId(pfcx.id);

  const contributions = await PfcContribution.aggregate([
    {
      $match: findObj,
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "scheduleId",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $set: {
        schedule: {
          $arrayElemAt: ["$schedule", 0],
        },
      },
    },
    {
      $lookup: {
        from: "pfas",
        localField: "pfaCode",
        foreignField: "pfaCode",
        as: "pfa",
      },
    },
    {
      $set: {
        pfa: {
          $arrayElemAt: ["$pfa", 0],
        },
      },
    },
    {
      $group: {
        _id: "$pfa.pfaCode",
        pfaName: {
          $first: "$pfa.pfaName",
        },
        count: {
          $count: {},
        },
        amount: {
          $sum: "$schedule.amount",
        },
        employeeNormalContribution: {
          $sum: "$schedule.employeeNormalContribution",
        },
        employerNormalContribution: {
          $sum: "$schedule.employerNormalContribution",
        },
        employeeVoluntaryContribution: {
          $sum: "$schedule.employeeVoluntaryContribution",
        },
        employerVoluntaryContribution: {
          $sum: "$schedule.employerVoluntaryContribution",
        },
        schedules: {
          $push: "$schedule",
        },
      },
    },
    {
      $sort: {
        pfaName: 1,
      },
    },
  ]);

  if (!contributions.length) return [];

  // build the excel data
  //emptyItemRow
  const eIR = {
    PFA: null,
    "STAFF NAME": null,
    "RSA PIN": null,
    AMOUNT: null,
    "EMPLOYEE NORMAL CONTRIBUTION": null,
    "EMPLOYER NORMAL CONTRIBUTION": null,
    "EMPLOYEE VOLUNTARY CONTRIBUTION": null,
    "EMPLOYER VOLUNTARY CONTRIBUTION": null,
    MONTH: null,
    YEAR: null,
  };

  const excelData = [];
  const grandTotal = {
    PFA: "GRAND TOTAL",
    AMOUNT: 0,
    "EMPLOYEE NORMAL CONTRIBUTION": 0,
    "EMPLOYER NORMAL CONTRIBUTION": 0,
    "EMPLOYEE VOLUNTARY CONTRIBUTION": 0,
    "EMPLOYER VOLUNTARY CONTRIBUTION": 0,
  };

  // add pfas
  for (const pfa of contributions) {
    eIR["PFA"] = pfa.pfaName;
    excelData.push({ ...eIR });
    eIR["PFA"] = null;

    // add schedules
    for (const item of pfa.schedules) {
      eIR["STAFF NAME"] = item.firstName + " " + item.lastName;
      eIR["RSA PIN"] = item.rsaPin;
      eIR["AMOUNT"] = item.amount;
      eIR["EMPLOYER NORMAL CONTRIBUTION"] = item.employerNormalContribution;
      eIR["EMPLOYEE NORMAL CONTRIBUTION"] = item.employeeNormalContribution;
      eIR["EMPLOYEE VOLUNTARY CONTRIBUTION"] =
        item.employeeVoluntaryContribution;
      eIR["EMPLOYER VOLUNTARY CONTRIBUTION"] =
        item.employerVoluntaryContribution;
      eIR["MONTH"] = moment()
        .set("month", Number(item.month) - 1)
        .format("MMMM");
      eIR["YEAR"] = item.year;

      excelData.push({ ...eIR });

      // clear the template data
      Object.keys(eIR).forEach((key) => {
        eIR[key] = null;
      });
    }

    // add the pfa totals
    eIR["PFA"] = "TOTAL";
    eIR["AMOUNT"] = pfa.amount;
    eIR["EMPLOYER NORMAL CONTRIBUTION"] = pfa.employerNormalContribution;
    eIR["EMPLOYEE NORMAL CONTRIBUTION"] = pfa.employeeNormalContribution;
    eIR["EMPLOYEE VOLUNTARY CONTRIBUTION"] = pfa.employeeVoluntaryContribution;
    eIR["EMPLOYER VOLUNTARY CONTRIBUTION"] = pfa.employerVoluntaryContribution;

    excelData.push({ ...eIR });

    // clear the template data
    Object.keys(eIR).forEach((key) => {
      eIR[key] = null;
    });

    // add totals to grand total
    grandTotal["AMOUNT"] += pfa.amount;
    grandTotal["EMPLOYER NORMAL CONTRIBUTION"] +=
      pfa.employerNormalContribution;
    grandTotal["EMPLOYEE NORMAL CONTRIBUTION"] +=
      pfa.employeeNormalContribution;
    grandTotal["EMPLOYEE VOLUNTARY CONTRIBUTION"] +=
      pfa.employeeVoluntaryContribution;
    grandTotal["EMPLOYER VOLUNTARY CONTRIBUTION"] +=
      pfa.employerVoluntaryContribution;
  }

  excelData.push(grandTotal);

  return excelData;
};

const buildContributionItem = async ({ companyCode, pfaCode, batchId }) => {
  const findObj = {
    deleted: false,
    batchId,
    companyCode,
    pfaCode,
  };

  const contributions = await PfcContribution.aggregate([
    {
      $match: findObj,
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "scheduleId",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $set: {
        schedule: {
          $arrayElemAt: ["$schedule", 0],
        },
      },
    },
    {
      $project: {
        _id: "$schedule._id",
        staffName: {
          $concat: ["$schedule.firstName", " ", "$schedule.lastName"],
        },
        rsaPin: "$schedule.rsaPin",
        amount: "$schedule.amount",
        employeeNormalContribution: "$schedule.employeeNormalContribution",
        employerNormalContribution: "$schedule.employerNormalContribution",
        employeeVoluntaryContribution:
          "$schedule.employeeVoluntaryContribution",
        employerVoluntaryContribution:
          "$schedule.employerVoluntaryContribution",
        month: "$schedule.month",
        year: "$schedule.year",
      },
    },
    {
      $sort: {
        staffName: 1,
      },
    },
  ]);

  if (!contributions.length) return [];

  // build the excel data
  //emptyItemRow
  const eIR = {
    "STAFF NAME": null,
    "RSA PIN": null,
    AMOUNT: null,
    "EMPLOYEE NORMAL CONTRIBUTION": null,
    "EMPLOYER NORMAL CONTRIBUTION": null,
    "EMPLOYEE VOLUNTARY CONTRIBUTION": null,
    "EMPLOYER VOLUNTARY CONTRIBUTION": null,
    MONTH: null,
    YEAR: null,
  };

  const excelData = [];
  const grandTotal = {
    "STAFF NAME": "GRAND TOTAL",
    AMOUNT: 0,
    "EMPLOYEE NORMAL CONTRIBUTION": 0,
    "EMPLOYER NORMAL CONTRIBUTION": 0,
    "EMPLOYEE VOLUNTARY CONTRIBUTION": 0,
    "EMPLOYER VOLUNTARY CONTRIBUTION": 0,
  };

  // add schedules
  for (const item of contributions) {
    eIR["STAFF NAME"] = item.staffName;
    eIR["RSA PIN"] = item.rsaPin;
    eIR["AMOUNT"] = item.amount;
    eIR["EMPLOYER NORMAL CONTRIBUTION"] = item.employerNormalContribution;
    eIR["EMPLOYEE NORMAL CONTRIBUTION"] = item.employeeNormalContribution;
    eIR["EMPLOYEE VOLUNTARY CONTRIBUTION"] = item.employeeVoluntaryContribution;
    eIR["EMPLOYER VOLUNTARY CONTRIBUTION"] = item.employerVoluntaryContribution;
    eIR["MONTH"] = moment()
      .set("month", Number(item.month) - 1)
      .format("MMMM");
    eIR["YEAR"] = item.year;

    excelData.push({ ...eIR });

    // clear the template data
    Object.keys(eIR).forEach((key) => {
      eIR[key] = null;
    });

    // add totals to grand total
    grandTotal["AMOUNT"] += item.amount;
    grandTotal["EMPLOYER NORMAL CONTRIBUTION"] +=
      item.employerNormalContribution;
    grandTotal["EMPLOYEE NORMAL CONTRIBUTION"] +=
      item.employeeNormalContribution;
    grandTotal["EMPLOYEE VOLUNTARY CONTRIBUTION"] +=
      item.employeeVoluntaryContribution;
    grandTotal["EMPLOYER VOLUNTARY CONTRIBUTION"] +=
      item.employerVoluntaryContribution;
  }

  excelData.push(grandTotal);

  return excelData;
};

const updateTransmit = async ({ companyCode, pfaCode, batchId, agentId }) => {
  const findObj = {
    deleted: false,
    batchId,
    companyCode,
  };

  if (pfaCode) {
    findObj["pfaCode"] = pfaCode;
  } else {
    const pfcx = await Pfc.findOne(
      {
        userId: agentId,
      },
      {
        id: 1,
      }
    );
    findObj["pfcId"] = mongoose.Types.ObjectId(pfcx.id);
  }

  return await PfcContribution.updateMany(findObj, {
    transmitted: true,
    updatedAt: new Date(),
  });
};

const sumAll = async () => {
  return 1200090;
};

module.exports = {
  findAllItems,
  findItem,
  getAllStates,
  addContributions,
  getBatchContributionsPfc,
  getContributionPfas,
  getContributionItems,
  buildContributionPfas,
  buildContributionItem,
  updateTransmit,
  sumAll,
};
