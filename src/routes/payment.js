const { Router } = require("express");

const api = Router();
const paymentController = require("../controllers/payment");
const pfcController = require("../controllers/pfc");
const validator = require("../validators/payment");
const { authenticate, accountValidate } = require("../middlewares");

module.exports = () => {
  // ---------- payment specific routes --------------

  // make wallet payment
  api.post(
    "/wallet",
    authenticate,
    accountValidate,
    validator.walletPayment,
    paymentController.walletPayment
  );

  // get the unremitted contributions for a PFC
  api.post(
    "/get-unremit-contribution",
    authenticate,
    validator.unremittedContributions,
    pfcController.unRemittedContributions
  );

  // get the batch contributions for a PFC or PFA
  api.post(
    "/get-batch-contribution",
    authenticate,
    validator.listBatchContributions,
    pfcController.listBatchContributions
  );

  // get the items in a contribution for a PFC or PFA
  api.post(
    "/get-item-contribution",
    authenticate,
    validator.listContributionItems,
    pfcController.listContributionItems
  );

  // download contributions for a PFC or PFA as excel
  api.post(
    "/download-contributions",
    authenticate,
    validator.listContributionItems,
    pfcController.downloadContributions
  );

  // transmit contributions from a PFC to PFA
  api.post(
    "/transmit-contributions",
    authenticate,
    validator.transmitContributions,
    pfcController.transmitContributions
  );

  return api;
};
