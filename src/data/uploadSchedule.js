const mongoose = require("mongoose");
const moment = require("moment");
const { ProcessedScheduleItem } = require("../models/processedScheduleItem");
const { UploadSchedule } = require("../models/uploadSchedule");
const { UploadTask } = require("../models/uploadTask");
const PAGESIZE = 10;

const addSchedules = async (schedules) => {
  return await UploadSchedule.create(schedules);
};

const sumAll = async (body) => {
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...body,
        deleted: false,
        paid: 1,
      },
    },
    {
      $group: {
        _id: null,
        amount: { $sum: "$amount" },
        employeeNormalContribution: { $sum: "$employeeNormalContribution" },
        employerNormalContribution: { $sum: "$employerNormalContribution" },
      },
    },
  ]);

  return sums.length
    ? sums[0]
    : {
        amount: 0,
        employeeNormalContribution: 0,
        employerNormalContribution: 0,
      };
};

const countStaff4Month = async (body) => {
  const sums = await UploadSchedule.distinct("rsaPin", {
    deleted: false,
    ...body,
  }).count();

  return sums;
};

const countStaffContributingCompanies = async (body) => {
  const sums = await UploadSchedule.distinct("companyCode", {
    deleted: false,
    ...body,
  }).count();

  return sums;
};

const staffContributingCompanies = async (body) => {
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        deleted: false,
        ...body,
        paid: 1,
      },
    },
    {
      $group: {
        _id: "$companyCode",
      },
    },
    {
      $lookup: {
        from: "users", // collection name in db
        localField: "_id",
        foreignField: "companyCode",
        as: "company",
      },
    },
    {
      $set: {
        label: {
          $arrayElemAt: ["$company.companyName", 0],
        },
        value: "$_id",
        company: null,
      },
    },
    {
      $sort: { companyName: 1 },
    },
  ]);

  return sums;
};

const sumStaffContributingCompanies = async (body, { page = 1 }) => {
  const skip = (Number(page) - 1) * PAGESIZE;
  let sums = await UploadSchedule.aggregate([
    {
      $match: {
        deleted: false,
        ...body,
        paid: 1,
      },
    },
    {
      $group: {
        _id: "$companyCode",
        amount: { $sum: "$amount" },
        month: { $max: "$month" },
        year: { $max: "$year" },
      },
    },
    {
      $lookup: {
        from: "users", // collection name in db
        localField: "_id",
        foreignField: "companyCode",
        as: "company",
      },
    },
    {
      $set: {
        companyName: {
          $arrayElemAt: ["$company.companyName", 0],
        },
        company: null,
      },
    },
    {
      $sort: { month: 1, year: 1 },
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

  /* Format the data */
  for (const sum of sums[0].data) {
    sum.lastMonthContributed = moment()
      .month(sum.month - 1)
      .year(sum.year)
      .format("MMMM YYYY");
  }

  return sums;
};

const sumAllByMonth = async (body) => {
  const series = [
    {
      name: "Employer Contribution",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "Employee Contribution",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      name: "Total Contribution",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...body,
        deleted: false,
        paid: 1,
      },
    },
    {
      $group: {
        _id: "$month",
        amount: { $sum: "$amount" },
        employeeNormalContribution: { $sum: "$employeeNormalContribution" },
        employerNormalContribution: { $sum: "$employerNormalContribution" },
      },
    },
  ]);

  /* Build the series */
  for (const sum of sums) {
    series[0].data[sum._id - 1] = sum.employerNormalContribution;
    series[1].data[sum._id - 1] = sum.employeeNormalContribution;
    series[2].data[sum._id - 1] = sum.amount;
  }

  return series;
};

const sumCountAllByMonth = async (body) => {
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...body,
        paid: 1,
        deleted: false,
      },
    },
    {
      $lookup: {
        from: "users", // collection name in db
        localField: "companyCode",
        foreignField: "companyCode",
        as: "company",
      },
    },
    {
      $set: {
        company: {
          $arrayElemAt: ["$company.companyName", 0],
        },
      },
    },
    {
      $group: {
        _id: "$month",
        staffCount: { $count: {} },
        amount: { $sum: "$amount" },
        company: { $max: "$company" },
        month: { $max: "$month" },
        createdAt: { $max: "$createdAt" },
      },
    },
    {
      $sort: { month: 1 },
    },
  ]);

  /* Format the data */
  for (const sum of sums) {
    sum.month = moment()
      .month(sum.month - 1)
      .format("MMMM");
    sum.createdAt = moment(sum.createdAt).format("MMM DD. YYYY");
  }
  return sums;
};

const bulkDelete = async (arr) => {
  const bulk = UploadSchedule.collection.initializeUnorderedBulkOp();
  arr.forEach((id) => {
    bulk
      .find({ _id: mongoose.Types.ObjectId(id) })
      .updateOne({ $set: { deleted: true, deletedAt: new Date() } });
  });
  return await bulk.execute();
};

const deleteBatch = async (uploadBatchId) => {
  return UploadSchedule.updateOne(
    {
      uploadBatchId,
    },
    {
      deleted: true,
      deletedAt: new Date(),
    }
  );
};

const getScheduleId = async (id) => {
  return await UploadSchedule.findById(id);
};

const getUnpaidUploadBatch = async ({
  companyCode,
  itemCode,
  startDate,
  endDate,
}) => {
  const reqObj = {
    deleted: false,
    paid: 0,
    processedStatus: 0,
    itemCode: itemCode,
    companyCode: companyCode,
  };

  return await UploadSchedule.aggregate([
    {
      $match: {
        ...reqObj,
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$uploadBatchId",
        count: { $count: {} },
        amount: { $sum: "$amount" },
        month: { $first: "$month" },
        year: { $first: "$year" },
        createdAt: { $first: "$createdAt" },
      },
    },
  ]);
};

const getUnpaidUploads = async (uploadBatchId, { page = 1 }) => {
  const reqObj = {
    deleted: false,
    paid: 0,
    processedStatus: 0,
    uploadBatchId: uploadBatchId,
  };

  const skip = (Number(page) - 1) * PAGESIZE;

  return await UploadSchedule.aggregate([
    { $match: reqObj },
    {
      $lookup: {
        from: "pfas", // collection name in db
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
};

const getUnpaidUploadsExcel = async (uploadBatchId) => {
  const reqObj = {
    deleted: false,
    paid: 0,
    processedStatus: 0,
    uploadBatchId: uploadBatchId,
  };

  return await UploadSchedule.aggregate([
    { $match: reqObj },
    {
      $lookup: {
        from: "pfas", // collection name in db
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
      $sort: { "pfa.pfaName": 1 },
    },
  ]);
};

const checkBatchName = async (batchId, agentId, itemCode) => {
  const existSchedule = await UploadSchedule.findOne({
    uploadBatchId: batchId,
    agentId,
    itemCode,
    deleted: false,
  });
  if (existSchedule) return true;

  return false;
};

const processSumCount = async ({
  companyCode,
  itemCode,
  month,
  year,
  processedStatus,
  items = false,
}) => {
  const reqObj = {
    paid: 0,
    deleted: false,
    month: Number(month),
    year: Number(year),
    itemCode: itemCode,
    companyCode,
  };

  if (processedStatus || processedStatus === 0) {
    reqObj["processedStatus"] = processedStatus;
  }

  if (!items) {
    return UploadSchedule.aggregate([
      { $match: reqObj },
      {
        $group: {
          _id: "$pfaCode",
          count: { $count: {} },
          amount: { $sum: "$amount" },
          employeeNormalContribution: { $sum: "$employeeNormalContribution" },
          employerNormalContribution: { $sum: "$employerNormalContribution" },
          employeeVoluntaryContribution: {
            $sum: "$employeeVoluntaryContribution",
          },
          employerVoluntaryContribution: {
            $sum: "$employerVoluntaryContribution",
          },
        },
      },
    ]);
  }

  return UploadSchedule.find(
    {
      ...reqObj,
    },
    {
      id: 1,
      amount: 1,
    }
  );
};

const processSumCountMandate = async (invoiceNo) => {
  // group processed item by pfcs and sub group by pfas
  const items = await ProcessedScheduleItem.aggregate([
    {
      $match: {
        invoiceNo: invoiceNo,
        deleted: false,
      },
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "id",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $lookup: {
        from: "processedschedules",
        localField: "invoiceNo",
        foreignField: "invoiceNo",
        as: "invoice",
      },
    },
    {
      $set: {
        schedule: {
          $arrayElemAt: ["$schedule", 0],
        },
        month: {
          $arrayElemAt: ["$invoice.month", 0],
        },
        invoiceAmount: {
          $arrayElemAt: ["$invoice.amount", 0],
        },
        year: {
          $arrayElemAt: ["$invoice.year", 0],
        },
        invoiceNo: {
          $arrayElemAt: ["$invoice.invoiceNo", 0],
        },
        paymentStatus: {
          $arrayElemAt: ["$invoice.paymentStatus", 0],
        },
        companyCode: {
          $arrayElemAt: ["$invoice.companyCode", 0],
        },
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
        pfa: {
          $arrayElemAt: ["$pfa", 0],
        },
      },
    },
    {
      $lookup: {
        from: "pfcs",
        localField: "pfa.pfc",
        foreignField: "_id",
        as: "pfc",
      },
    },
    {
      $set: {
        pfc: {
          $arrayElemAt: ["$pfc", 0],
        },
      },
    },
    {
      $group: {
        _id: "$pfa.pfaCode",
        pfcName: {
          $first: "$pfc.pfcName",
        },
        itemCode: {
          $first: "$schedule.itemCode",
        },
        invoiceAmount: {
          $first: "$invoiceAmount",
        },
        paymentStatus: {
          $first: "$paymentStatus",
        },
        invoiceNo: {
          $first: "$invoiceNo",
        },
        month: {
          $first: "$month",
        },
        year: {
          $first: "$year",
        },
        itemCount: {
          $count: {},
        },
        companyCode: {
          $first: "$companyCode",
        },
        pfcId: {
          $first: "$pfc._id",
        },
        pfaName: {
          $first: "$pfa.pfaName",
        },
        pfaAmount: {
          $sum: "$amount",
        },
        schedules: {
          $push: "$schedule",
        },
      },
    },
    {
      $group: {
        _id: "$pfcId",
        pfc: {
          $first: "$pfcName",
        },
        itemCode: {
          $first: "$itemCode",
        },
        month: {
          $first: "$month",
        },
        invoiceAmount: {
          $first: "$invoiceAmount",
        },
        invoiceNo: {
          $first: "$invoiceNo",
        },
        year: {
          $first: "$year",
        },
        paymentStatus: {
          $first: "$paymentStatus",
        },
        companyCode: {
          $first: "$companyCode",
        },
        pfcAmount: {
          $sum: "$pfaAmount",
        },
        itemCount: {
          $sum: "$itemCount",
        },
        pfas: {
          $push: {
            pfaCode: "$_id",
            pfaAmount: "$pfaAmount",
            itemCount: "$itemCount",
            pfa: "$pfaName",
            schedules: "$schedules",
          },
        },
      },
    },
  ]);

  return items;
};

const updateProcessed = async (arr) => {
  const bulk = UploadSchedule.collection.initializeUnorderedBulkOp();
  arr.forEach((obj) => {
    bulk
      .find({
        _id: mongoose.Types.ObjectId(obj.id),
        processedStatus: 0,
      })
      .updateOne({ $set: { processedStatus: 1, updatedAt: new Date() } });
  });
  return await bulk.execute();
};

const updatePaid = async (paidItemsArr) => {
  const bulk = UploadSchedule.collection.initializeUnorderedBulkOp();
  paidItemsArr.forEach((item) => {
    bulk
      .find({
        _id: mongoose.Types.ObjectId(item.id),
        deleted: false,
      })
      .updateOne({
        $set: { paid: 1, updatedAt: new Date(), datePaid: new Date() },
      });
  });
  return await bulk.execute();
};

const createTask = async ({ agentId, filePath, itemCode, month, year }) => {
  const task = new UploadTask({
    agentId,
    filePath,
    itemCode,
    month,
    year,
  });
  await task.save();

  return task;
};

const getTask = async (id) => {
  const task = await UploadTask.findOne({ _id: id, deleted: false });

  return task;
};

const getTasks = async (findObj) => {
  return await UploadTask.find({
    deleted: false,
    ...findObj,
  }).sort({
    createdAt: -1,
  });
};

const updateTask = async (id, status) => {
  return UploadTask.updateOne(
    {
      _id: id,
    },
    {
      status: status,
    }
  );
};

const deleteTask = async (id) => {
  return UploadTask.updateOne(
    {
      _id: id,
    },
    {
      deleted: true,
      deletedAt: new Date(),
    }
  );
};

const getTransactions = async (body) => {
  return UploadSchedule.aggregate([
    {
      $match: {
        ...body,
        deleted: false,
        paid: 1,
      },
    },
    {
      $lookup: {
        from: "users", // collection name in db
        localField: "companyCode",
        foreignField: "companyCode",
        as: "company",
      },
    },
    {
      $lookup: {
        from: "items", // collection name in db
        localField: "itemCode",
        foreignField: "itemCode",
        as: "item",
      },
    },
    {
      $project: {
        company: { companyName: 1 },
        item: { itemName: 1 },
        amount: 1,
        month: 1,
        year: 1,
        paid: 1,
        createdAt: 1,
      },
    },
  ]);
};

const processSumCountItems = async (invoiceNo) => {
  // group, sum and count processed item by pfcs and sub group by pfas for excel download
  const items = await ProcessedScheduleItem.aggregate([
    {
      $match: {
        invoiceNo: invoiceNo,
        deleted: false,
      },
    },
    {
      $lookup: {
        from: "uploadschedules",
        localField: "id",
        foreignField: "_id",
        as: "schedule",
      },
    },
    {
      $lookup: {
        from: "processedschedules",
        localField: "invoiceNo",
        foreignField: "invoiceNo",
        as: "invoice",
      },
    },
    {
      $set: {
        schedule: {
          $arrayElemAt: ["$schedule", 0],
        },
        invoice: {
          $arrayElemAt: ["$invoice", 0],
        },
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
        pfa: {
          $arrayElemAt: ["$pfa", 0],
        },
      },
    },
    {
      $lookup: {
        from: "pfcs",
        localField: "pfa.pfc",
        foreignField: "_id",
        as: "pfc",
      },
    },
    {
      $set: {
        pfc: {
          $arrayElemAt: ["$pfc", 0],
        },
      },
    },
    {
      $group: {
        _id: {
          pfcId: "$pfc._id",
          pfaCode: "$pfa.pfaCode",
        },
        pfcName: {
          $first: "$pfc.pfcName",
        },
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
      $group: {
        _id: "$_id.pfcId",
        pfcName: {
          $first: "$pfcName",
        },
        count: {
          $count: {},
        },
        amount: {
          $sum: "$amount",
        },
        employeeNormalContribution: {
          $sum: "$employeeNormalContribution",
        },
        employerNormalContribution: {
          $sum: "$employerNormalContribution",
        },
        employeeVoluntaryContribution: {
          $sum: "$employeeVoluntaryContribution",
        },
        employerVoluntaryContribution: {
          $sum: "$employerVoluntaryContribution",
        },
        pfas: {
          $push: {
            pfaName: "$pfaName",
            pfaCode: "$_id.pfaCode",
            count: "$count",
            amount: "$amount",
            employeeNormalContribution: "$employeeNormalContribution",
            employerNormalContribution: "$employerNormalContribution",
            employeeVoluntaryContribution: "$employeeVoluntaryContribution",
            employerVoluntaryContribution: "$employerVoluntaryContribution",
            schedules: "$schedules",
          },
        },
      },
    },
    {
      $sort: {
        pfcName: 1,
      },
    },
  ]);

  return items;
};

const getUserProfile = async (body) => {
  const batchAll = await UploadSchedule.distinct("uploadBatchId", {
    ...body,
    deleted: false,
  });

  const batchAllPaid = await UploadSchedule.distinct("uploadBatchId", {
    ...body,
    paid: 1,
    deleted: false,
  });

  const totalProcessed = await UploadSchedule.aggregate([
    {
      $match: {
        ...body,
        deleted: false,
      },
    },
    {
      $group: {
        _id: null,
        amount: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return {
    countAll: batchAll.length,
    countPaid: batchAllPaid.length,
    totalProcessed: totalProcessed.length ? totalProcessed[0].amount : 0,
  };
};

module.exports = {
  addSchedules,
  sumAll,
  countStaff4Month,
  countStaffContributingCompanies,
  sumStaffContributingCompanies,
  staffContributingCompanies,
  sumAllByMonth,
  bulkDelete,
  deleteBatch,
  getScheduleId,
  getUnpaidUploadBatch,
  getUnpaidUploads,
  checkBatchName,
  processSumCount,
  updateProcessed,
  updatePaid,
  createTask,
  getTask,
  updateTask,
  getTasks,
  deleteTask,
  getTransactions,
  processSumCountMandate,
  processSumCountItems,
  sumCountAllByMonth,
  getUnpaidUploadsExcel,
  getUserProfile,
};
