const mongoose = require("mongoose");
const { UploadSchedule } = require("../models/uploadSchedule");
const { UploadTask } = require("../models/uploadTask");

const addSchedules = async (schedules) => {
  return await UploadSchedule.create(schedules);
};

const aggregateAndCount = async (startDate, endDate, data) => {
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...data,
        deleted: false,
        createdAt: { $gte: startDate, $lt: endDate },
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

const aggregateSumGroup = async (startDate, endDate, data) => {
  const sums = await UploadSchedule.aggregate([
    {
      $match: {
        ...data,
        deleted: false,
        createdAt: { $gte: startDate, $lt: endDate },
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

  return await UploadSchedule.find(reqObj, {
    uploadType: 0,
    updatedAt: 0,
    deletedAt: 0,
    dateProcessed: 0,
  });
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

const processSumCount = async ({ companyCode, itemCode, month, year }) => {
  const reqObj = {
    paid: 0,
    deleted: false,
    processedStatus: 0,
    month: Number(month),
    year: year,
    itemCode: itemCode,
    companyCode,
  };

  console.log(reqObj);

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
};
