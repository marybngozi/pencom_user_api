/* eslint-disable no-unused-vars */
/*
 * The Base paths of each API route is initialized here
 * The respective routes file for the base route is then required and passed
 * as a second argument to the base instance
 */

const express = require("express");
const middleware = require("../middlewares/index");
const indexController = require("../controllers/index");
const authRoutes = require("./auth");
const dashBoardRoutes = require("./dashboard");
const scheduleRoutes = require("./schedule");
const paymentRoutes = require("./payment");

const { ErrorHandler } = require("../utils/errors");

// Exposes the express router binding
const router = express();

// This calls the middleware(s) to be used on base routes
router.use(middleware.index());

// api routes
router.use("", indexController()); // Routes for index views
router.use("/auth", authRoutes()); // Routes for auth views
router.use("/stat", dashBoardRoutes()); // Routes for dashboard views
router.use("/schedule", scheduleRoutes()); // Routes for schedule views
router.use("/payment", paymentRoutes()); // Routes for payment views

// When route is not found, returns a json
router.use((req, res, next) => {
  const message = "Not Found";
  return res.status(404).json({
    errorCode: "E404",
    message,
  });
});

// Handles any error from catch block and return it well
router.use((error, req, res, next) => {
  const { errorCode, message, intCode } = ErrorHandler(error);

  return res.status(errorCode).json({
    errorCode: intCode,
    message,
  });
});

module.exports = router;
