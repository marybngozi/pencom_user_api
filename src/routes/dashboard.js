const { Router } = require("express");

const api = Router();
const dashboardController = require("../controllers/dashboard");
const menuController = require("../controllers/menu");
const validator = require("../validators/dashboard");
const { authenticate } = require("../middlewares");

module.exports = () => {
  // ----------Dashboard specific routes --------------

  // get all items
  api.get("/items", authenticate, dashboardController.getItems);
  // count all items for month
  api.get("/items-month", authenticate, dashboardController.countItemMonth);
  // count all items for year
  api.get("/items-year", authenticate, dashboardController.countItemYear);
  // get all states
  api.get("/states", dashboardController.getStates);
  // sum all for months in year
  api.get("/year-months", authenticate, dashboardController.sumYearMonths);
  // get user menus
  api.get("/menus", authenticate, menuController.getMenus);
  // get all staff menus
  api.post(
    "/staff-menus",
    authenticate,
    validator.getStaffMenus,
    menuController.getStaffMenus
  );
  // update staff menus
  api.post(
    "/update-staff-menus",
    authenticate,
    validator.updateStaffMenu,
    menuController.updateStaffMenu
  );

  return api;
};
