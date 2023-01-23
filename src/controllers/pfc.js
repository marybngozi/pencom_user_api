const fs = require("fs");
const path = require("path");
const Item = require("../data/item");
// const { NotFoundError } = require("../utils/errors");
const { createExcel } = require("../utils/excel");

const unRemittedContributions = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId } = req.user;
    let { company, dateStart, dateEnd } = req.body;

    // when only one date is provided, send error, the both dates must be provided
    if ((!dateStart && dateEnd) || (dateStart && !dateEnd)) {
      throw new BadRequestError("Both dates or none must be provided");
    }

    let findObj = { transmitted: false, agentId };

    if (dateStart && dateEnd) {
      // use provided Date duration
      const startDate = new Date(dateStart);
      let endDate = new Date(dateEnd);
      // Adds one day to adjust search
      endDate.setDate(endDate.getDate() + 1);

      findObj["createdAt"] = { $gte: startDate, $lte: endDate };
    }

    if (company && company != "all") findObj["companyCode"] = company;

    const contributions = await Item.getPfaBatchContributions(findObj);

    return res.status(200).json({
      message: "Contributions fetched successfully",
      data: contributions,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("pfcController-unRemittedContributions", e);
    next(e);
  }
};

const listBatchContributions = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType } = req.user;
    let { company, dateStart, dateEnd, month, year, searchTerm } = req.body;

    // when only one date is provided, send error, the both dates must be provided
    if ((!dateStart && dateEnd) || (dateStart && !dateEnd)) {
      throw new BadRequestError("Both dates or none must be provided");
    }

    let findObj = { agentId, userType };

    if (dateStart && dateEnd) {
      // use provided Date duration
      const startDate = new Date(dateStart);
      let endDate = new Date(dateEnd);
      // Adds one day to adjust search
      endDate.setDate(endDate.getDate() + 1);

      findObj["createdAt"] = { $gte: startDate, $lte: endDate };
    }

    if (company && company != "all") findObj["companyCode"] = company;
    if (month && month != "All months") findObj["month"] = month;
    if (year && year != "All years") findObj["year"] = year;

    const contributions = await Item.getBatchContributionsPfc(findObj);

    return res.status(200).json({
      message: "Contributions fetched successfully",
      data: contributions,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("pfcController-listBatchContributions", e);
    next(e);
  }
};

const listContributionItems = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId } = req.user;
    let { pfaCode, companyCode, batchId } = req.body;

    let contributions = [];

    if (pfaCode) {
      contributions = await Item.getContributionItems(
        {
          pfaCode,
          batchId,
          companyCode,
        },
        req.query
      );
    } else {
      contributions = await Item.getContributionPfas(
        {
          batchId,
          companyCode,
          agentId,
        },
        req.query
      );
    }

    return res.status(200).json({
      message: "Contribution Items fetched successfully",
      ...contributions[0],
    });
  } catch (e) {
    console.log("pfcController-listContributionItems", e);
    next(e);
  }
};

const downloadContributions = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId } = req.user;
    let { pfaCode, companyCode, batchId } = req.body;

    let contributions = [];

    if (pfaCode) {
      contributions = await Item.buildContributionItem({
        pfaCode,
        batchId,
        companyCode,
      });
    } else {
      contributions = await Item.buildContributionPfas({
        batchId,
        companyCode,
        agentId,
      });
    }

    const fileName = `${Date.now()}-pfccontributions.xlsx`;
    const filePath = path.join(
      __basedir + "../public/uploads/schedule",
      fileName
    );
    await createExcel(contributions, filePath);

    console.log("pfcController.downloadContributions: started");
    const file = fs.createReadStream(filePath);

    // deletes the file after download
    file.on("end", () => {
      fs.unlink(filePath, () => {
        console.log(
          `pfcController.downloadContributions: file ${filePath} deleted`
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
    console.log("pfcController-downloadContributions", e);
    next(e);
  }
};

const transmitContributions = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId } = req.user;
    let { pfaCode, companyCode, batchId } = req.body;

    const transmitted = await Item.updateTransmit({
      agentId,
      pfaCode,
    });

    return res.status(200).json({
      message: "Contribution transmitted to PFA successfully",
    });
  } catch (e) {
    console.log("pfcController-transmitContributions", e);
    next(e);
  }
};

module.exports = {
  unRemittedContributions,
  listBatchContributions,
  listContributionItems,
  downloadContributions,
  transmitContributions,
};
