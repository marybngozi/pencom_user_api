const mongoose = require("mongoose");
const { ProcessedScheduleItem } = require("../models/processedScheduleItem");
const { UploadSchedule } = require("../models/uploadSchedule");
const { UploadTask } = require("../models/uploadTask");

const addSchedules = async (schedules) => {
  return await UploadSchedule.create(schedules);
};

const aggregateAndCount = async (duration, data) => {
  const date = new Date();
  if (duration == "month") {
    data["month"] = date.getMonth() + 1;
  }
  if (duration == "year") {
    data["year"] = date.getFullYear();
  }
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...data,
        deleted: false,
        paid: 1,
      },
    },
    {
      $group: {
        _id: null,
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

  return sums;
};

const aggregateSumGroup = async (data) => {
  const date = new Date();
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...data,
        paid: 1,
        deleted: false,
        year: date.getFullYear(),
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
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

const getUnpaidUploads = async (uploadBatchId) => {
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

  const upload = await UploadSchedule.find(
    {
      ...reqObj,
    },
    {
      uploadType: 0,
      updatedAt: 0,
      deletedAt: 0,
      dateProcessed: 0,
    }
  );

  const sumed = await UploadSchedule.aggregate([
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

  return { upload, sumed };
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

const getTasks = async ({ agentId }) => {
  const findObj = {
    deleted: false,
    agentId,
  };

  return await UploadTask.find(findObj);
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

const getTransactions = async (rsaPin) => {
  return UploadSchedule.aggregate([
    {
      $match: {
        rsaPin,
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
      $project: {
        pfc: "$pfc.pfcName",
        pfa: "$pfa.pfaName",
        pfcId: "$pfc._id",
        pfaCode: "$pfa.pfaCode",
        staffId: "$schedule.staffId",
        rsaPin: "$schedule.rsaPin",
        amount: "$schedule.amount",
        firstName: "$schedule.firstName",
        lastName: "$schedule.lastName",
        employeeNormalContribution: "$schedule.employeeNormalContribution",
        employerNormalContribution: "$schedule.employerNormalContribution",
        employeeVoluntaryContribution:
          "$schedule.employeeVoluntaryContribution",
        employerVoluntaryContribution:
          "$schedule.employerVoluntaryContribution",
        month: "$schedule.month",
        year: "$schedule.year",
        paid: "$schedule.paid",
      },
    },
    {
      $sort: {
        pfc: 1,
        pfa: 1,
      },
    },
  ]);

  return items;
};

module.exports = {
  addSchedules,
  aggregateAndCount,
  aggregateSumGroup,
  bulkDelete,
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
};
