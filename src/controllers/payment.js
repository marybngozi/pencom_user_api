const moment = require("moment");
const UploadSchedule = require("../data/uploadSchedule");
const ProcessedSchedule = require("../data/processedSchedule");
const Item = require("../data/item");
const Wallet = require("../data/wallet");

const {
  BadRequestError,
  ServerError,
  NotFoundError,
} = require("../utils/errors");

const walletPayment = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId } = req.user;
    let { companyCode, invoiceNo, walletCode } = req.body;

    // Get agent's wallet
    const wallet = await Wallet.getWallet(companyCode);

    // if no wallet found or wallet amount is 0
    if (!wallet || wallet.amount <= 0)
      throw new BadRequestError("Insufficient Fund");

    // Get the payment details using the invoiceNo from the Processed Schedule table
    const ScheduleDetail = await ProcessedSchedule.getProcessedSchedule(
      invoiceNo,
      0
    );

    // if no processed Schedule was found
    if (!ScheduleDetail)
      throw new BadRequestError(
        "No unpaid schedule found for the invoice number provided"
      );

    // if the ScheduleDetail amount is greatet than to the wallet amount
    if (ScheduleDetail.amount > wallet.amount)
      throw new BadRequestError("Insufficient Fund");

    let newWalletAmount = wallet.amount;
    let expenses = 0;

    // substract the ScheduleDetail amount from the wallet amount
    newWalletAmount -= ScheduleDetail.amount;
    expenses += ScheduleDetail.amount;

    // using invoiceNo, update the Processed Schedule paymentStatus to 1 in the Processed Schedule table
    await ProcessedSchedule.bulkUpdateProcessedSchedule({
      invoiceNoArr: [invoiceNo],
      paymentStatus: 1,
    });

    // using invoiceNo, update the Processed Schedule items paid to 1 in the Processed Schedule item table
    await ProcessedSchedule.updateProcessedScheduleItem(invoiceNo);

    // get all updated items above from the Processed Schedule items, to their id to set them as paid
    const paidItemsArr = await ProcessedSchedule.getProcessedScheduleItemsNP({
      invoiceNo,
      paid: 1,
    });

    // update the paid Schedule items paid to 1 in the Schedule schedule table using their id
    await UploadSchedule.updatePaid(paidItemsArr);

    // use newWalletAmount to update the wallet and history
    if (newWalletAmount !== wallet.amount) {
      await Wallet.updateWallet({
        moneyAmount: expenses,
        companyCode,
        agentId,
        transactionType: 0,
        invoiceNo,
      });
    }

    // Log the contributions for the Pfcs and Pfas
    const contributions = await ProcessedSchedule.getProcessedItemsPfc({
      invoiceNo,
      agentId,
      itemCode: ScheduleDetail.itemCode,
      companyCode,
      month: ScheduleDetail.month,
      year: ScheduleDetail.year,
      paymentType: "wallet",
    });

    await Item.addContributions(contributions);

    return res.status(200).json({
      message: "Wallet Payment successful",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("paymentController-walletPayment", e);
    next(e);
  }
};

module.exports = {
  walletPayment,
};
