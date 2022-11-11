const mongoose = require("mongoose");
const { ProcessedSchedule } = require("../models/processedSchedule");
const { ProcessedScheduleItem } = require("../models/processedScheduleItem");

const generateInvoiceNo = async () => {
  let invoiceNo = Math.floor(Math.random() * 1000000000000);
  const numExists = await ProcessedSchedule.findOne({ invoiceNo: invoiceNo });
  if (numExists) {
    invoiceNo = generateInvoiceNo();
  }
  return invoiceNo;
};

const addProcessedSchedule = async ({
  companyCode,
  agentId,
  amount,
  month,
  year,
  itemCode,
}) => {
  const invoiceNo = await generateInvoiceNo();

  return await ProcessedSchedule.create({
    companyCode,
    invoiceNo,
    agentId,
    amount,
    month,
    year,
    itemCode,
    paymentStatus: 0,
  });
};

const checkProcessedSchedule = async ({
  agentId,
  amount,
  month,
  year,
  itemCode,
}) => {
  const itExists = await ProcessedSchedule.findOne({
    agentId,
    deleted: false,
    paymentStatus: 0,
    amount: amount,
    month,
    year,
    itemCode,
  });

  if (itExists) return true;
  return false;
};

const addProcessedScheduleItems = async (arr) => {
  return await ProcessedScheduleItem.create(arr);
};

const getNotPaidProcessedSchedule = async ({ itemCode, agentId }) => {
  const findObj = {
    deleted: false,
    paymentStatus: 0,
    agentId: agentId,
  };

  if (itemCode) {
    findObj["itemCode"] = itemCode;
  }

  return ProcessedSchedule.find(findObj, {
    updatedAt: 0,
    deletedAt: 0,
    deleted: false,
  }).sort({ amount: "asc" });
};

const getProcessedSchedule = async (invoiceNo, paymentStatus, itemCode) => {
  const findObj = { deleted: false, invoiceNo };
  if (paymentStatus || paymentStatus === 0) {
    findObj["paymentStatus"] = paymentStatus;
  }

  if (itemCode) {
    findObj["itemCode"] = itemCode;
  }

  return ProcessedSchedule.findOne(findObj, {
    updatedAt: 0,
    deletedAt: 0,
    deleted: false,
  });
};

const getAllProcessedSchedule = async (findObj) => {
  return ProcessedSchedule.find(
    {
      deleted: false,
      ...findObj,
    },
    {
      updatedAt: 0,
      deletedAt: 0,
      deleted: false,
    }
  ).sort({ amount: "asc" });
};

const getAllProcessedScheduleItems = async ({ invoiceNo, paid }) => {
  const findObj = { invoiceNo, deleted: false };

  if (paid || paid === 0) {
    findObj["paid"] = paid;
  }

  return ProcessedScheduleItem.find(findObj, {
    updatedAt: 0,
    deletedAt: 0,
    deleted: false,
  })
    .sort({ amount: "asc" })
    .populate("id");
};

const getProcessedScheduleItemsNP = async ({ invoiceNo, paid }) => {
  const findObj = { invoiceNo, deleted: false };

  if (paid || paid === 0) {
    findObj["paid"] = paid;
  }

  return ProcessedScheduleItem.find(findObj, {
    updatedAt: 0,
    deletedAt: 0,
    deleted: false,
  }).sort({ amount: "asc" });
};

const bulkUpdateProcessedSchedule = async ({ invoiceNoArr, paymentStatus }) => {
  const bulk = ProcessedSchedule.collection.initializeUnorderedBulkOp();
  invoiceNoArr.forEach((invoiceNo) => {
    bulk
      .find({
        invoiceNo,
        deleted: false,
      })
      .updateOne({ $set: { paymentStatus, updatedAt: new Date() } });
  });
  return await bulk.execute();
};

const updatePaidProcessedScheduleItem = async (paidItemsArr) => {
  const bulk = ProcessedScheduleItem.collection.initializeUnorderedBulkOp();
  paidItemsArr.forEach((item) => {
    bulk
      .find({
        _id: mongoose.Types.ObjectId(item._id),
        deleted: false,
      })
      .updateOne({ $set: { paid: 1, updatedAt: new Date() } });
  });
  return await bulk.execute();
};

const updateProcessedScheduleItem = async (invoiceNo) => {
  return ProcessedScheduleItem.updateMany(
    {
      invoiceNo,
      deleted: false,
      paid: 0,
    },
    {
      paid: 1,
    }
  );
};

module.exports = {
  addProcessedSchedule,
  checkProcessedSchedule,
  addProcessedScheduleItems,
  getProcessedSchedule,
  getAllProcessedSchedule,
  getAllProcessedScheduleItems,
  getProcessedScheduleItemsNP,
  bulkUpdateProcessedSchedule,
  updateProcessedScheduleItem,
  updatePaidProcessedScheduleItem,
  getNotPaidProcessedSchedule,
};
