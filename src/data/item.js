const mongoose = require("mongoose");
const { Item } = require("../models/item");
const { Pfc } = require("../models/pfc");
const { Pfa } = require("../models/pfa");
const { PfcContribution } = require("../models/pfcContribution");
const { State } = require("../models/state");

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

const getBatchContributions = async ({
  itemCode,
  startDate,
  endDate,
  userType,
  agentId,
}) => {
  const findObj = {
    deleted: false,
  };

  if (itemCode) {
    findObj["itemCode"] = itemCode;
  }

  if (userType == 400) {
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

  if (userType == 500) {
    const pfax = await Pfa.findOne(
      {
        userId: agentId,
      },
      {
        pfaCode: 1,
      }
    );
    findObj["pfaCode"] = pfax.pfaCode;
  }

  console.log({ findObj }, startDate, endDate);

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
        localField: "schedule.pfaCode",
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
          pfaCode: "$pfaCode",
          batchId: "$batchId",
        },
        pfaName: {
          $first: "$pfaName",
        },
        pfaCode: {
          $first: "$pfaCode",
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
      },
    },
  ]);

  return contributions;
};

const getContributionItems = async (pfaCode, batchId) => {
  const findObj = {
    deleted: false,
    pfaCode,
    batchId,
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
  ]);

  return contributions;
};

module.exports = {
  findAllItems,
  findItem,
  getAllStates,
  addContributions,
  getBatchContributions,
  getContributionItems,
};
