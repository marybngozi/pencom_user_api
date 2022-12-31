const { Router } = require("express");

const api = Router();
const dashboardController = require("../controllers/dashboard");
const menuController = require("../controllers/menu");
const validator = require("../validators/dashboard");
const { authenticate } = require("../middlewares");

module.exports = () => {
  // ----------Dashboard specific routes --------------

  /* get the data for the blue-box */
  api.post("/blue-box", authenticate, dashboardController.blueBox);
  /* get the data for the pink-box */
  api.post("/pink-box", authenticate, dashboardController.pinkBox);
  /* get the data for the gray-box */
  api.post("/gray-box", authenticate, dashboardController.grayBox);
  /* get the data for the graph-box */
  api.post("/graph-box", authenticate, dashboardController.graphBox);
  /* get the data for the graph-box */
  api.post("/graph-box", authenticate, dashboardController.graphBox);
  /* get the data for the table-box */
  api.post("/table-box", authenticate, dashboardController.tableBox);
  /* get all items */
  api.get("/items", authenticate, dashboardController.getItems);
  /* get all states */
  api.get("/states", dashboardController.getStates);
  /* get user menus */
  api.get("/menus", authenticate, menuController.getMenus);
  /* get all staff menus */
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
  //TODO: update staff menus
  api.post("/send-email", dashboardController.testTemplates);

  return api;
};
