const moment = require("moment");
const Item = require("../data/item");
const { NotFoundError } = require("../utils/errors");

const listBatchContributions = async (req, res, next) => {
  try {
    // Get the token parameters
    let { id: agentId, userType } = req.user;
    let { itemCode, dateStart, dateEnd } = req.body;

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

    let findObj = { itemCode, startDate, endDate, userType, agentId };

    const contributions = await Item.getBatchContributions(findObj);

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
    let { userType } = req.user;
    let { pfaCode, batchId } = req.body;

    const contributions = await Item.getContributionItems(pfaCode, batchId);

    return res.status(200).json({
      message: "Cosntribution Items fetched successfully",
      data: contributions,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("pfcController-listContributionItems", e);
    next(e);
  }
};

module.exports = {
  listBatchContributions,
  listContributionItems,
};
