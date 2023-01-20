const fs = require("fs");
const path = require("path");
const moment = require("moment");
const QRCode = require("qrcode");
const EventEmitter = require("events");
const UploadSchedule = require("../data/uploadSchedule");
const ProcessedSchedule = require("../data/processedSchedule");
const User = require("../data/user");
const Item = require("../data/item");
const Wallet = require("../data/wallet");
const { parseExcel, createExcel } = require("../utils/excel");
const logger = require("../utils/logger");
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
    data = outputData;
    status = "success";
  }
  // update task to success
  await UploadSchedule.updateTask(task.id, status);

  // build excel with the ouptut data
  await createExcel(data, uploadData.filePath);

  /********************* SEND NOTIFICATION THAT THE VERIFICATION IS DONE *************/
  // make an object for the email template
  const emailData = {
    year: moment().format("YYYY"),
    userNames: uploadData.companyName,
    monthPaid: moment()
      .month(uploadData.month - 1)
      .format("MMMM"),
    yearPaid: uploadData.year,
    scheduleUrl: uploadData.scheduleUrl,
    status1: isValid ? "is now ready for processing" : "requires modification",
    status2: isValid ? "continue the process" : "review the schedule",
  };

  const message = MakeEmailTemplate("scheduleVerified.html", emailData);

  const subject = `Pencom Schedule Status`;

  // send email notification
  sendMail(uploadData.email, message, subject);
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
    logger.error(JSON.stringify({ "scheduleController-listSchedule": e }));
    next(e);
  }
};

const getBatchSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    // let { userType } = req.user;
    let { uploadBatchId } = req.body;

    if (!uploadBatchId) throw new BadRequestError("Batch Id was not provided");

    const uploads = await UploadSchedule.getUnpaidUploads(
      uploadBatchId,
      req.query
    );

    return res.status(200).json({
      message: "Items fetched successfully",
      ...uploads[0],
    });
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-getBatchSchedule": e }));
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
    logger.error(JSON.stringify({ "scheduleController-deleteSchedule": e }));
    next(e);
  }
};

const deleteScheduleBatch = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId } = req.user;
    let { uploadBatchId } = req.body;

    // Bulk delete action
    const deletedSchedule = await UploadSchedule.deleteBatch(uploadBatchId);

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
    logger.error(
      JSON.stringify({ "scheduleController-deleteScheduleBatch": e })
    );
    next(e);
  }
};

const summarizeSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, userType, companyCode } = req.user;
    let { itemCode, month, year } = req.body;

    let theCountsMain = {};

    // get all pfas and their pfc details
    const pfas = await User.getAllPfas("include");
    if (!pfas.length) throw new NotFoundError("PFAs not found");

    let findObj = { month, year, itemCode, companyCode, processedStatus: 0 };

    // Get the total for all pfas for the given month and year
    let sumed = await UploadSchedule.processSumCount(findObj);

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
    }

    return res.status(200).json({
      message: "Fetched scheduled summary",
      data: {
        month,
        year,
        itemCode,
        summary: theCountsMain,
      },
    });
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-summarizeSchedule": e }));
    next(e);
  }
};

const uploadScheduleExcel = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, companyCode, companyName, email } = req.user;
    let { itemCode, month, year, scheduleUrl } = req.body;

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
    uploadData.companyName = companyName;
    uploadData.email = email;
    uploadData.agentId = agentId;
    uploadData.filePath = filePath;
    uploadData.scheduleUrl = scheduleUrl;

    // log the validation task in the database
    const validationTask = await UploadSchedule.createTask({
      agentId,
      filePath,
      itemCode,
      month,
      year,
    });

    // make an object for the email template
    const emailData = {
      year: moment().format("YYYY"),
      userNames: companyName,
      monthPaid: moment()
        .month(month - 1)
        .format("MMMM"),
      yearPaid: year,
    };

    const message = MakeEmailTemplate("scheduleReceived.html", emailData);

    const subject = `Pencom Schedule Verification`;

    // send email notification
    sendMail(email, message, subject);

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
    logger.error(
      JSON.stringify({ "scheduleController-uploadScheduleExcel": e })
    );
    next(e);
  }
};

const downloadExcel = async (req, res, next) => {
  try {
    // Get the token parameters
    let { filePath } = req.body;

    if (!filePath) throw new BadRequestError("File name must be provided");

    logger.info("scheduleController.downloadExcel: started");
    const file = fs.createReadStream(filePath);
    let filename = filePath.split("-").pop();
    filename = filename.split(".")[0];

    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-downloadExcel": e }));
    next(e);
  }
};

const scheduleStatus = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId } = req.user;
    let { month, year, statusOption } = req.body;

    let findObj = { agentId };

    if (statusOption && statusOption != 0) {
      findObj["status"] = statusOption;
    }

    if (month) {
      findObj["month"] = month;
    }

    if (year && year != "All years") {
      findObj["year"] = year;
    }

    const tasks = await UploadSchedule.getTasks(findObj);

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
    logger.error(JSON.stringify({ "scheduleController-scheduleStatus": e }));
    next(e);
  }
};

const removeTask = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id } = req.body;

    const task = await UploadSchedule.deleteTask(id);

    return res.status(200).json({
      message: "Schedule Tasks deleted successfully",
      data: task,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-scheduleStatus": e }));
    next(e);
  }
};

const uploadSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId } = req.user;

    let { id, scheduleUrl } = req.body;

    const task = await UploadSchedule.getTask(id);

    // end if task was not found
    if (!task) throw new NotFoundError("Schedule was not found!");

    // convert schdeule to json
    const scheduleUpload = await parseExcel(task.filePath);

    await UploadSchedule.addSchedules(scheduleUpload);

    // delete the task
    await UploadSchedule.deleteTask(id);

    // get the schedule total
    const scheduleTotal = scheduleUpload.reduce((acc, obj) => {
      return acc + obj.amount;
    }, 0);

    req.body.payDetails = {
      amount: scheduleTotal,
      itemCode: task.itemCode,
      scheduleUrl: scheduleUrl,
      month: task.month,
      year: task.year,
    };
    /* GO TO PROCESS SCHEDULE */
    next();
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-scheduleStatus": e }));
    next(e);
  }
};

const processSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { agentId, companyName, companyCode, email } = req.user;

    // declaring all variables
    let { payDetails } = req.body;

    const paymentBooked = await ProcessedSchedule.checkProcessedSchedule({
      agentId,
      amount: payDetails.amount,
      month: payDetails.month,
      year: payDetails.year,
      itemCode: payDetails.itemCode,
    });

    if (paymentBooked)
      throw new BadRequestError(
        "Schedule with same data already booked before"
      );

    // add payDetails to Processed Schedule table
    const processed = await ProcessedSchedule.addProcessedSchedule({
      companyCode,
      agentId,
      amount: payDetails.amount,
      month: payDetails.month,
      year: payDetails.year,
      itemCode: payDetails.itemCode,
    });

    // get the payData
    let findObj = {
      month: payDetails.month,
      year: payDetails.year,
      itemCode: payDetails.itemCode,
      companyCode,
      processedStatus: 0,
      items: true,
    };

    // Get the payData for the given month and year
    const payData = await UploadSchedule.processSumCount(findObj);

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

    // get the QR code for the mandate
    const scheduleUrl = await QRCode.toDataURL(
      `${payDetails.scheduleUrl}/${processed.invoiceNo}`
    );

    // get the mandate summary
    let mandateSummary = await UploadSchedule.processSumCountMandate(
      processed.invoiceNo
    );

    // make an object for the mandate template
    const mandateData = {
      scheduleUrl: scheduleUrl,
      todayDate: moment().format("Do-MMM-YYYY"),
      userNames: companyName,
      companyCode: companyCode,
      invoiceNo: processed.invoiceNo,
      amount: payDetails.amount,
      monthPaid: moment().month(payDetails.month).format("MMMM"),
      yearPaid: payDetails.year,
      items: mandateSummary,
    };

    const message = MakeEmailTemplate("mandate.html", mandateData);

    const subject = `Pencom MANDATE`;

    // send email with mandate of the Schedule details to the agent
    sendMail(email, message, subject);

    return res.status(200).json({
      message: "Schedule Processed Successfully",
      data: processed.invoiceNo,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-processSchedule": e }));
    next(e);
  }
};

const listProcessedSchedule = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;
    let { statusOption, month, year } = req.body;

    let findObj = { companyCode };

    if ((statusOption || statusOption == 0) && statusOption != -1) {
      findObj["paymentStatus"] = statusOption;
    }

    if (month) {
      findObj["month"] = month;
    }

    if (year && year != "All years") {
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
    logger.error(
      JSON.stringify({ "scheduleController-listProcessedSchedule": e })
    );
    next(e);
  }
};

const listProcessedScheduleItem = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;
    let { invoiceNo } = req.body;

    const remitItems = await ProcessedSchedule.getAllProcessedScheduleItems(
      {
        invoiceNo,
      },
      req.query
    );

    return res.status(200).json({
      message: "Processed Schedule items fetched successfully",
      ...remitItems[0],
    });
  } catch (e) {
    logger.error(
      JSON.stringify({ "scheduleController-listProcessedScheduleItem": e })
    );
    next(e);
  }
};

const getMandate = async (req, res, next) => {
  try {
    // Get the body parameters
    let { invoiceNo } = req.body;

    // Get the total for all pfas for that invoice
    let uploadItems = await UploadSchedule.processSumCountMandate(invoiceNo);

    if (!uploadItems.length) throw new BadRequestError("Invoice is invalid");

    // get company data
    const company = await User.getUser({
      companyCode: uploadItems[0].companyCode,
    });

    // get the item details
    const item = await Item.findItem(uploadItems[0].itemCode);
    if (!item) throw new BadRequestError("No Item found");

    const data = {
      // item: uploadItems,
      itemName: item.itemName,
      companyName: company.companyName,
      companyCode: company.companyCode,
    };

    return res.status(200).json({
      message: "Mandate details fetched successfully",
      data: data,
      items: uploadItems,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-getMandate": e }));
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
    logger.error(JSON.stringify({ "scheduleController-getMandate": e }));
    next(e);
  }
};

const getContribution = async (req, res, next) => {
  try {
    // Get the token parameters
    let { rsaPin } = req.user;

    // Get the body parameters
    let { yearOption, monthOption, companyOption } = req.body;
    const searchBody = { rsaPin };
    if (yearOption && yearOption != "All years")
      searchBody["year"] = yearOption;
    if (monthOption && monthOption != "All months")
      searchBody["month"] = monthOption;
    if (companyOption && companyOption != "all")
      searchBody["companyCode"] = companyOption;

    // get the processed remittance using the custReference
    const transactions = await UploadSchedule.getTransactions(searchBody);

    return res.status(200).json({
      message: "Contributions details fetched successfully",
      data: transactions,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    logger.error(JSON.stringify({ "scheduleController-getMandate": e }));
    next(e);
  }
};

// total, group and list to build the download
const downloadProcessedItems = async (req, res, next) => {
  try {
    // Get the token parameters
    let { invoiceNo } = req.body;

    const uploadItems = await UploadSchedule.processSumCountItems(invoiceNo);

    if (!uploadItems.length) throw new BadRequestError("No item found");

    //emptyItemRow
    const eIR = {
      PFC: null,
      PFA: null,
      "STAFF ID": null,
      "RSA PIN": null,
      AMOUNT: null,
      "STAFF NAME": null,
      "EMPLOYEE NORMAL CONTRIBUTION": null,
      "EMPLOYER NORMAL CONTRIBUTION": null,
      "EMPLOYEE VOLUNTARY CONTRIBUTION": null,
      "EMPLOYER VOLUNTARY CONTRIBUTION": null,
      MONTH: null,
      YEAR: null,
    };

    const excelData = [];
    const grandTotal = {
      PFC: "GRAND TOTAL",
      AMOUNT: 0,
      "EMPLOYEE NORMAL CONTRIBUTION": 0,
      "EMPLOYER NORMAL CONTRIBUTION": 0,
      "EMPLOYEE VOLUNTARY CONTRIBUTION": 0,
      "EMPLOYER VOLUNTARY CONTRIBUTION": 0,
    };

    // format data
    for (const pfc of uploadItems) {
      eIR["PFC"] = pfc.pfcName;
      excelData.push({ ...eIR });
      eIR["PFC"] = null;

      // add pfas
      for (const pfa of pfc.pfas) {
        eIR["PFA"] = pfa.pfaName;
        excelData.push({ ...eIR });
        eIR["PFA"] = null;

        // add schedules
        for (const item of pfa.schedules) {
          eIR["STAFF ID"] = item.staffId;
          eIR["RSA PIN"] = item.rsaPin;
          eIR["AMOUNT"] = item.amount;
          eIR["STAFF NAME"] = item.firstName + " " + item.lastName;
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
        eIR["PFA"] = "PFA TOTAL";
        eIR["AMOUNT"] = pfa.amount;
        eIR["EMPLOYER NORMAL CONTRIBUTION"] = pfa.employerNormalContribution;
        eIR["EMPLOYEE NORMAL CONTRIBUTION"] = pfa.employeeNormalContribution;
        eIR["EMPLOYEE VOLUNTARY CONTRIBUTION"] =
          pfa.employeeVoluntaryContribution;
        eIR["EMPLOYER VOLUNTARY CONTRIBUTION"] =
          pfa.employerVoluntaryContribution;

        excelData.push({ ...eIR });

        // clear the template data
        Object.keys(eIR).forEach((key) => {
          eIR[key] = null;
        });
      }

      // add the pfc totals
      eIR["PFC"] = "PFC TOTAL";
      eIR["AMOUNT"] = pfc.amount;
      eIR["EMPLOYER NORMAL CONTRIBUTION"] = pfc.employerNormalContribution;
      eIR["EMPLOYEE NORMAL CONTRIBUTION"] = pfc.employeeNormalContribution;
      eIR["EMPLOYEE VOLUNTARY CONTRIBUTION"] =
        pfc.employeeVoluntaryContribution;
      eIR["EMPLOYER VOLUNTARY CONTRIBUTION"] =
        pfc.employerVoluntaryContribution;

      excelData.push({ ...eIR });

      // clear the template data
      Object.keys(eIR).forEach((key) => {
        eIR[key] = null;
      });
      // add totals to grand total
      grandTotal["AMOUNT"] += pfc.amount;
      grandTotal["EMPLOYER NORMAL CONTRIBUTION"] +=
        pfc.employerNormalContribution;
      grandTotal["EMPLOYEE NORMAL CONTRIBUTION"] +=
        pfc.employeeNormalContribution;
      grandTotal["EMPLOYEE VOLUNTARY CONTRIBUTION"] +=
        pfc.employeeVoluntaryContribution;
      grandTotal["EMPLOYER VOLUNTARY CONTRIBUTION"] +=
        pfc.employerVoluntaryContribution;
    }

    excelData.push(grandTotal);

    const fileName = `${Date.now()}-processed_schedule.xlsx`;
    const filePath = path.join(
      __basedir + "/public/uploads/schedule",
      fileName
    );
    await createExcel(excelData, filePath);

    logger.info("scheduleController.downloadProcessedItems: started");
    const file = fs.createReadStream(filePath);

    // deletes the file after download
    file.on("end", () => {
      fs.unlink(filePath, () => {
        logger.info(
          `scheduleController.downloadProcessedItems: file ${filePath} deleted`
        );
      });
    });

    let filename = filePath.split("-").pop();
    filename = filename.split(".")[0];

    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  } catch (e) {
    logger.error(
      JSON.stringify({ "scheduleController-downloadProcessedItems": e })
    );
    next(e);
  }
};

const downloadUploadedItems = async (req, res, next) => {
  try {
    // Get the token parameters
    let { uploadBatchId } = req.body;

    const uploadItems = await UploadSchedule.getUnpaidUploadsExcel(
      uploadBatchId
    );

    if (!uploadItems.length) throw new BadRequestError("No item found");

    // format data
    uploadItems.forEach((item, i) => {
      const newItem = {
        MONTH: moment()
          .set("month", Number(item.month) - 1)
          .format("MMMM"),
        YEAR: item.year,
        PFA: item.pfa.pfaName,
        "PFA CODE": item.pfaCode,
        "STAFF ID": item.staffId,
        "RSA PIN": item.rsaPin,
        AMOUNT: item.amount,
        "FIRST NAME": item.firstName,
        "LAST NAME": item.lastName,
        "EMPLOYEE NORMAL CONTRIBUTION": item.employeeNormalContribution,
        "EMPLOYER NORMAL CONTRIBUTION": item.employerNormalContribution,
        "EMPLOYEE VOLUNTARY CONTRIBUTION": item.employeeVoluntaryContribution,
        "EMPLOYER VOLUNTARY CONTRIBUTION": item.employerVoluntaryContribution,
      };
      uploadItems[i] = newItem;
    });

    const fileName = `${Date.now()}-uploaded_schedule.xlsx`;
    const filePath = path.join(
      __basedir + "/public/uploads/schedule",
      fileName
    );
    await createExcel(uploadItems, filePath);

    logger.info("scheduleController.downloadUploadedItems: started");
    const file = fs.createReadStream(filePath);

    // deletes the file after download
    file.on("end", () => {
      fs.unlink(filePath, () => {
        logger.info(
          `scheduleController.downloadUploadedItems: file ${filePath} deleted`
        );
      });
    });

    let filename = filePath.split("-").pop();
    filename = filename.split(".")[0];

    res.setHeader(
      "Content-Disposition",
      'attachment: filename="' + filename + '"'
    );
    file.pipe(res);
  } catch (e) {
    logger.error(
      JSON.stringify({ "scheduleController-downloadUploadedItems": e })
    );
    next(e);
  }
};

module.exports = {
  listSchedule,
  deleteSchedule,
  deleteScheduleBatch,
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
  getContribution,
  downloadProcessedItems,
  downloadUploadedItems,
};
