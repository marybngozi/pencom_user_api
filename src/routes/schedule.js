const { Router } = require("express");

const api = Router();
const scheduleController = require("../controllers/schedule");
const validator = require("../validators/schedule");
const { authenticate, accountValidate } = require("../middlewares");
const { uploadExcel } = require("../middlewares/upload");

module.exports = () => {
  // ---------- Schedule specific routes --------------

  // list schedules by batch
  api.post(
    "/list-batch",
    authenticate,
    accountValidate,
    validator.listSchedule,
    scheduleController.listSchedule
  );
  // list schedules in a batch
  api.post(
    "/list-schedule",
    authenticate,
    accountValidate,
    scheduleController.getBatchSchedule
  );
  // delete schedule
  api.post(
    "/remove",
    authenticate,
    accountValidate,
    validator.deleteSchedule,
    scheduleController.deleteSchedule
  );
  // summarize schedule
  api.post(
    "/summarize",
    authenticate,
    accountValidate,
    validator.summarizeSchedule,
    scheduleController.summarizeSchedule
  );
  // process schedule
  api.post(
    "/process",
    authenticate,
    accountValidate,
    validator.processSchedule,
    scheduleController.processSchedule
  );
  // TODO:upload Excel schedule
  api.post(
    "/upload-excel",
    authenticate,
    accountValidate,
    uploadExcel.single("fileUpload"),
    scheduleController.uploadScheduleExcel
  );
  api.post("/download-excel", scheduleController.downloadExcel);
  // get schedule tasks
  api.get(
    "/upload-status",
    authenticate,
    accountValidate,
    scheduleController.scheduleStatus
  );
  // delete schedule tasks
  api.post(
    "/delete-task",
    authenticate,
    accountValidate,
    scheduleController.removeTask
  );
  // upload schedule
  api.post(
    "/upload-schedule",
    authenticate,
    accountValidate,
    validator.uploadSchedule,
    scheduleController.uploadSchedule
  );
  // get processed schedules
  api.post(
    "/list-processed",
    authenticate,
    accountValidate,
    validator.listProcessedSchedule,
    scheduleController.listProcessedSchedule
  );
  // get processed schedules items
  api.post(
    "/list-processed-items",
    authenticate,
    accountValidate,
    validator.listProcessedScheduleItem,
    scheduleController.listProcessedScheduleItem
  );
  // get mandate details
  api.post(
    "/get-mandate",
    validator.listProcessedScheduleItem,
    scheduleController.getMandate
  );
  // get contributions
  api.post(
    "/get-contribution",
    authenticate,
    validator.getContribution,
    scheduleController.getContribution
  );
  // get payment details
  api.get(
    "/payment/:invoiceNo",
    authenticate,
    validator.listProcessedScheduleItem,
    scheduleController.getPaymentDetails
  );
  // get payment details
  api.get(
    "/payment/:invoiceNo",
    authenticate,
    validator.listProcessedScheduleItem,
    scheduleController.getPaymentDetails
  );
  // download processed items
  api.post(
    "/download-processed-items",
    authenticate,
    validator.listProcessedScheduleItem,
    scheduleController.downloadProcessedItems
  );

  return api;
};
