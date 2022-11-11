const { Router } = require("express");

const api = Router();
const paymentController = require("../controllers/payment");
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

  return api;
};
