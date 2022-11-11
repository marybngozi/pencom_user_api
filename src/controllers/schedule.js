const fs = require("fs");
const moment = require("moment");
const QRCode = require("qrcode");
const EventEmitter = require("events");
const UploadSchedule = require("../data/uploadSchedule");
const ProcessedSchedule = require("../data/processedSchedule");
const User = require("../data/user");
const Item = require("../data/item");
const Wallet = require("../data/wallet");
const { parseExcel, createExcel } = require("../utils/excel");
const { validateUploads } = require("../utils/validateUpload");
const MakeEmailTemplate = require("../utils/makeEmailTemplate");
const { sendMail } = require("../utils/notification");

const {
  BadRequestError,
  ServerError,
  NotFoundError,
} = require("../utils/errors");

let uploadData = {};
const eventHandler = new EventEmitter();

eventHandler.on("validateUpload", async (task) => {
  // perform validation and
  const { outputData, isValid } = await validateUploads(uploadData);

  // if isValid, update task status, build excel
  let data = uploadData.data;
  let status = "failure";

  if (isValid) {
    (data = outputData), (status = "success");
  }
  // update task to success
  await UploadSchedule.updateTask(task.id, status);

  // build excel with the ouptut data
  await createExcel(data, uploadData.filePath);
});

const listSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, companyCode } = req.user;
    let { itemCode, dateStart, dateEnd } = req.body;

    if (!itemCode) throw new NotFoundError("Items not found");

    // when only one date is provided, send error, the both dates must be provided
    if ((!dateStart && dateEnd) || (dateStart && !dateEnd)) {
      throw new BadRequestError("Both dates or none must be provided");
    }

    // Get the monthly data
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    let startDate = new Date(year, month);
    let endDate = new Date(year, month + 1, 1);

    if (dateStart && dateEnd) {
      // use provided Date duration
      startDate = new Date(dateStart);
      endDate = new Date(dateEnd);

      // Adds one day to adjust search
      endDate.setDate(endDate.getDate() + 1);
    }

    let findObj = { itemCode, startDate, endDate, companyCode };

    const uploads = await UploadSchedule.getUnpaidUploadBatch(findObj);

    return res.status(200).json({
      message: "Items fetched successfully",
      data: uploads,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-listSchedule", e);
    next(e);
  }
};

const getBatchSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    // let { userType } = req.user;
    let { uploadBatchId } = req.body;

    if (!uploadBatchId) throw new BadRequestError("Batch Id was not provided");

    const uploads = await UploadSchedule.getUnpaidUploads(uploadBatchId);

    return res.status(200).json({
      message: "Items fetched successfully",
      data: uploads,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-getBatchSchedule", e);
    next(e);
  }
};

const deleteSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId } = req.user;
    let { deleteArr } = req.body;

    // Bulk delete action
    const { nModified } = await UploadSchedule.bulkDelete(deleteArr);

    if (nModified != deleteArr.length)
      throw new BadRequestError("Deletion not successful");

    return res.status(200).json({
      message: "Delete successful",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    cconsole.log("scheduleController-deleteSchedule", e);
    next(e);
  }
};

const summarizeSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, userType, companyCode } = req.user;
    let { itemCode, month, year } = req.body;

    let uploads = [];
    let theCountsMain = {};

    // get all pfas and their pfc details
    const pfas = await User.getAllPfas("include");
    if (!pfas.length) throw new NotFoundError("PFAs not found");

    let findObj = { month, year, itemCode, companyCode };

    // Get the total for all pfas for the given month and year
    let { upload, sumed } = await UploadSchedule.processSumCount(findObj);

    if (sumed.length) {
      for (let i = 0; i < sumed.length; i++) {
        const val = sumed[i];
        const valPfa = pfas.find((pfa) => val._id == pfa.pfaCode);
        sumed[i] = {
          ...sumed[i],
          pfaName: valPfa.pfaName,
          pfcId: valPfa.pfc.id,
        };

        if (!theCountsMain[valPfa.pfc.pfcName]) {
          theCountsMain[valPfa.pfc.pfcName] = [];
        }

        theCountsMain[valPfa.pfc.pfcName].push(sumed[i]);
      }

      uploads.push(...upload);
    }

    return res.status(200).json({
      message: "Fetched scheduled summary",
      data: {
        month,
        year,
        itemCode,
        summary: theCountsMain,
        data: uploads,
      },
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-summarizeSchedule", e);
    next(e);
  }
};

const uploadScheduleExcel = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, companyCode } = req.user;
    let { itemCode, month, year } = req.body;
    // console.log(req.body);

    if (!itemCode) throw new NotFoundError("Item must be provided");
    if (!month) throw new NotFoundError("Month must be provided");
    if (!year) throw new NotFoundError("Year must be provided");

    const filePath = req.file.path;

    // get the json data from excel
    uploadData.data = await parseExcel(filePath);
    uploadData.itemCode = itemCode;
    uploadData.month = month;
    uploadData.year = year;
    uploadData.companyCode = companyCode;
    uploadData.agentId = agentId;
    uploadData.filePath = filePath;

    // log the validation task in the database
    const validationTask = await UploadSchedule.createTask({
      agentId,
      filePath,
      itemCode,
      month,
      year,
    });

    // background review the schedule upload, emit the event for validation
    eventHandler.emit("validateUpload", validationTask);

    return res.status(201).json({
      message:
        "Schedule received, reviewing ..., Feedback will be available soon",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-uploadScheduleExcel", e);
    next(e);
  }
};

const downloadExcel = async (req, res, next) => {
  try {
    // Get the token parameters
    let { filePath } = req.body;

    if (!filePath) throw new BadRequestError("File name must be provided");

    console.log("scheduleController.downloadExcel: started");
    const file = fs.createReadStream(filePath);
    let filename = filePath.split("-").pop();
    filename = filename.split(".")[0];

    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  } catch (e) {
    console.log("scheduleController-downloadExcel", e);
    next(e);
  }
};

const scheduleStatus = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId } = req.user;

    const tasks = await UploadSchedule.getTasks({ agentId });

    return res.status(200).json({
      message: "Schedule Tasks fetched successfully",
      data: tasks,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-scheduleStatus", e);
    next(e);
  }
};

const removeTask = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id } = req.user;

    const tasks = await UploadSchedule.deleteTask(id);

    return res.status(200).json({
      message: "Schedule Tasks deleted successfully",
      data: tasks,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-scheduleStatus", e);
    next(e);
  }
};

const uploadSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId } = req.user;

    let { id } = req.body;

    const task = await UploadSchedule.getTask(id);

    // end if task was not found
    if (!task) throw new NotFoundError("Schedule was not found!");

    // convert schdeule to json
    const scheduleUpload = await parseExcel(task.filePath);

    await UploadSchedule.addSchedules(scheduleUpload);

    // delete the task
    await UploadSchedule.deleteTask(id);

    return res.status(200).json({
      message: "Schedule uploaded successfully",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-scheduleStatus", e);
    next(e);
  }
};

const processSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, companyName, companyCode, email } = req.user;
    let { itemCode, month, year } = req.body;

    // declaring all variables
    let { payDetails, payData } = req.body;

    const paymentBooked = await ProcessedSchedule.checkProcessedSchedule({
      agentId,
      amount: payDetails.amount,
      month: payDetails.month,
      year: payDetails.year,
      itemCode: payDetails.itemCode,
    });

    if (paymentBooked)
      throw new BadRequestError("Payment already booked before");

    // add payDetails to Processed Schedule table
    const processed = await ProcessedSchedule.addProcessedSchedule({
      companyCode,
      agentId,
      amount: payDetails.amount,
      month: payDetails.month,
      year: payDetails.year,
      itemCode: payDetails.itemCode,
    });

    // make new data array having {id, invoiceNo, amount}
    const dataArr = payData.map((obj) => {
      let dataObj = {};
      dataObj["invoiceNo"] = processed.invoiceNo;
      dataObj["id"] = obj["id"];
      dataObj["amount"] = obj["amount"];
      return dataObj;
    });

    // add payData to the Processed Schedule Items tables
    await ProcessedSchedule.addProcessedScheduleItems(dataArr);

    // set the payData records in Schedule Schedule table as processed
    await UploadSchedule.updateProcessed(dataArr);

    // get the itemName for the mandate
    const itemDetails = await Item.findItem(payDetails.itemCode);
    const itemName = itemDetails ? itemDetails.itemName : "";

    // get the QR code for the mandate
    const scheduleUrl = await QRCode.toDataURL(
      `${payDetails.scheduleUrl}/${processed.invoiceNo}`
    );

    // make an object for the mandate template
    const mandateData = {
      scheduleUrl: scheduleUrl,
      todayDate: moment().format("Do-MMM-YYYY"),
      userNames: companyName,
      userEmail: payDetails.email,
      stateValidationID: companyCode,
      itemName: itemName,
      custReference: processed.invoiceNo,
      amount: payDetails.amount,
      itemCode: payDetails.itemCode,
      monthPaid: payDetails.month,
      yearPaid: payDetails.year,
      paymentStatus: "Not Paid",
    };

    const message = MakeEmailTemplate("mandate.html", mandateData);

    const subject = `Pencom MANDATE`;

    // send email with mandate of the Schedule details to the agent
    sendMail(email, message, subject);

    return res.status(200).json({
      message: "Payment Booked Successful",
      data: processed.invoiceNo,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-processSchedule", e);
    next(e);
  }
};

const listProcessedSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;
    let { itemCode, month, year } = req.body;

    let findObj = { companyCode };

    if (itemCode) {
      findObj["itemCode"] = itemCode;
    }

    if (month) {
      findObj["month"] = month;
    }

    if (year) {
      findObj["year"] = year;
    }

    const scheduleDetails = await ProcessedSchedule.getAllProcessedSchedule(
      findObj
    );

    return res.status(200).json({
      message: "Processed Schedule fetched successfully",
      data: scheduleDetails,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-listProcessedSchedule", e);
    next(e);
  }
};

const listProcessedScheduleItem = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;
    let { invoiceNo } = req.body;

    const remitItems = await ProcessedSchedule.getAllProcessedScheduleItems({
      invoiceNo,
    });

    return res.status(200).json({
      message: "Processed Schedule items fetched successfully",
      data: remitItems,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-listProcessedScheduleItem", e);
    next(e);
  }
};

const getMandate = async (req, res, next) => {
  try {
    // Get the body parameters
    let { invoiceNo } = req.body;
    // get the processed remittance using the custReference
    const upload = await ProcessedSchedule.getProcessedSchedule(invoiceNo);

    if (!upload) throw new BadRequestError("Mandate not found");

    // get company data
    const company = await User.getUser({ companyCode: upload.companyCode });

    // get the item details
    const item = await Item.findItem(upload.itemCode);
    if (!item) throw new BadRequestError("No Item found");

    const data = {
      item: upload,
      itemName: item.itemName,
      companyName: company.companyName,
      companyCode: company.companyCode,
    };

    return res.status(200).json({
      message: "Mandate details fetched successfully",
      data: data,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-getMandate", e);
    next(e);
  }
};

const getPaymentDetails = async (req, res, next) => {
  try {
    // Get the body parameters
    let { invoiceNo } = req.body;
    // get the processed remittance using the custReference
    const upload = await ProcessedSchedule.getProcessedSchedule(invoiceNo);

    if (!upload) throw new BadRequestError("Mandate not found");

    // get company data
    const company = await User.getUser({ companyCode: upload.companyCode });

    // get the item details
    const item = await Item.findItem(upload.itemCode);
    if (!item) throw new BadRequestError("No Item found");

    // get wallet details
    const wallet = await Wallet.getWallet(upload.companyCode);
    if (!wallet) throw new BadRequestError("Wallet not found");

    const { agentId, amount, year, paymentStatus, month, itemCode } = upload;
    const data = {
      agentId,
      amount,
      invoiceNo,
      year,
      paymentStatus,
      month,
      itemCode,
      itemName: item.itemName,
      email: company.email,
      companyName: company.companyName,
      companyCode: company.companyCode,
    };

    return res.status(200).json({
      message: "Mandate details fetched successfully",
      data: data,
      wallet,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("scheduleController-getMandate", e);
    next(e);
  }
};

module.exports = {
  listSchedule,
  deleteSchedule,
  summarizeSchedule,
  processSchedule,
  uploadScheduleExcel,
  downloadExcel,
  scheduleStatus,
  uploadSchedule,
  listProcessedSchedule,
  listProcessedScheduleItem,
  getMandate,
  getPaymentDetails,
  removeTask,
  getBatchSchedule,
};
