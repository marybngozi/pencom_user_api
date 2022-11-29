const Menu = require("../data/menu");
const User = require("../data/user");
const { BadRequestError } = require("../utils/errors");

const getMenus = async (req, res, next) => {
  try {
    // Get the token parameters
    let { userType, agentId, companyCode } = req.user;

    let menus = [];

    if (
      userType == 100 ||
      userType == 200 ||
      userType == 400 ||
      userType == 500
    ) {
      menus = await Menu.getMenuCS(userType);
    }

    if (userType == 300) {
      menus = await Menu.getMenuAdminStaff(agentId, companyCode);
    }

    return res.status(200).json({
      message: "Menus fetched successfully",
      data: menus,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("menuController-getMenus", e);
    next(e);
  }
};

const getStaffMenus = async (req, res, next) => {
  try {
    // Get the token parameters
    let { rsaPin, companyCode } = req.body;

    const staff = await User.getUser({ rsaPin: rsaPin });

    // if the user was not found
    if (!staff) throw new NotFoundError("Staff with RSA PIN was not found");

    const menus = await Menu.getMenuAdminStaffOnly(staff.id, companyCode);

    return res.status(200).json({
      message: "Staff Menus fetched successfully",
      data: menus,
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("menuController-getStaffMenus", e);
    next(e);
  }
};

const updateStaffMenu = async (req, res, next) => {
  try {
    // Get the token parameters
    let { companyCode } = req.user;

    let { userId, subMenuIds } = req.body;

    await Menu.addStaffAdminMenu({ userId, companyCode, subMenuIds });

    return res.status(200).json({
      message: "Staff Menus updated successfully",
      meta: {
        currentPage: 1,
        pageSize: 1,
        pageTotal: 1,
      },
    });
  } catch (e) {
    console.log("menuController-updateStaffMenu", e);
    next(e);
  }
};

module.exports = {
  getMenus,
  getStaffMenus,
  updateStaffMenu,
};
