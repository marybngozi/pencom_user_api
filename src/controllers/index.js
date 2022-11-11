const { Router } = require("express");

const api = Router();

const home = (req, res) => {
  try {
    res.status(200).json({
      message: "Welcome to Pencom User API",
      data: {
        projectName: "Pencom",
        author: "MaryBlessing Umeh",
      },
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
      links: {
        register: "/auth/company-register",
        register: "/auth/staff-register",
        login: "/auth/login",
      },
    });
  } catch (e) {
    console.log("indexController-home", e);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = () => {
  // "/" - home route
  api.get("/", home);

  return api;
};
