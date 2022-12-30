const { User } = require("../models/user");
const { MainMenu } = require("../models/mainMenu");
const { SubMenu } = require("../models/subMenu");
const { UserMenu } = require("../models/userMenu");
const userMenu = require("../models/userMenu");

const getUsersMenu = async (userType) => {
  const findObj = {
    deleted: false,
  };

  let menuType = "";

  if (userType == 100) {
    menuType = "company";
  } else if (userType == 200) {
    menuType = "staff";
  } else if (userType == 400) {
    menuType = "pfc";
  } else if (userType == 500) {
    menuType = "pfa";
  }
  let menus = {
    mainMenus: [],
    subMenus: [],
  };

  let mainMenus = await MainMenu.find({
    deleted: false,
  }).sort({ pindex: 1 });

  if (!mainMenus.length) return menus;

  const subMenus = await SubMenu.find(
    { deleted: false, $or: [{ menuType: menuType }, { menuType: "all" }] },
    {
      path: 1,
      name: 1,
      id: 1,
      menuType: 1,
      menuId: 1,
    }
  ).sort({ pindex: 1 });

  if (!subMenus.length) return menus;

  const userMainMenusIds = subMenus.map((subMenu) => subMenu.menuId);

  // filter the mainMenu
  mainMenus = mainMenus.filter((menu) => {
    for (const umiD of userMainMenusIds) {
      if (umiD.equals(menu.id)) return true;
    }
    return false;
  });

  if (!mainMenus.length) return menus;

  return {
    mainMenus,
    subMenus,
  };
};

const getMenuAdminStaff = async (agentId, companyCode) => {
  /* gets and builds the menu for login */
  let menus = [];

  let mainMenus = await MainMenu.find({
    deleted: false,
  }).sort({ pindex: 1 });

  if (!mainMenus.length) return menus;

  const baseSubMenus = await SubMenu.find(
    {
      deleted: false,
      $or: [
        { menuType: "staff" },
        { menuType: "all" },
        { menuType: "adminStaff" },
      ],
    },
    {
      path: 1,
      name: 1,
      id: 1,
      menuType: 1,
      menuId: 1,
    }
  ).sort({ pindex: 1 });

  const userSubMenus = await UserMenu.find(
    {
      deleted: false,
      userId: agentId,
      companyCode,
    },
    {
      menus: 1,
    }
  ).populate("menus");

  let allUserSubMenus = [...baseSubMenus];
  if (userSubMenus.length) {
    const userSubMenus = userSubMenus.menus;
    allUserSubMenus.push(...userSubMenus);
  }
  if (!allUserSubMenus.length) return menus;

  const userMainMenusIds = allUserSubMenus.map((subMenu) => subMenu.menuId);

  // filter the mainMenu
  mainMenus = mainMenus.filter((menu) => {
    for (const umiD of userMainMenusIds) {
      if (umiD.equals(menu.id)) return true;
    }
    return false;
  });

  if (!mainMenus.length) return menus;

  return {
    mainMenus,
    subMenus: allUserSubMenus,
  };
};

const getMenuAdminStaffOnly = async (agentId, companyCode) => {
  // gets only the menus list for further assigning
  const userMenus = await UserMenu.findOne(
    {
      deleted: false,
      userId: agentId,
      companyCode,
    },
    {
      menus: 1,
    }
  );

  return userMenus ? userMenus.menus : [];
};

const createBaseAdminStaffMenu = async ({ userId, companyCode }) => {
  // check if there is an existing menu for that staff for that company
  const menuExists = await UserMenu.findOne({
    userId,
    companyCode,
  });

  if (menuExists) return;

  const baseSubMenus = await SubMenu.find(
    {
      deleted: false,
      menuType: "adminStaff",
    },
    {
      id: 1,
    }
  );

  if (!baseSubMenus.length) return;

  const baseMenuids = baseSubMenus.map((baseMenu) => baseMenu.id);

  // create the base menu
  const staffMenu = new UserMenu({
    userId,
    companyCode,
    menus: baseMenuids,
  });
  await staffMenu.save();
};

const addStaffAdminMenu = async ({ userId, companyCode, subMenuIds }) => {
  // check if there is an existing menu for that staff for that company
  const menuExists = await UserMenu.findOne({
    userId,
    companyCode,
  });

  if (!menuExists) {
    // create the base menu
    const staffMenu = new UserMenu({
      userId,
      companyCode,
      menus: subMenuIds,
    });
    return await staffMenu.save();
  }

  return await UserMenu.updateOne(
    {
      companyCode,
      userId,
    },
    {
      menus: subMenuIds,
    }
  );
};

module.exports = {
  getUsersMenu,
  getMenuAdminStaff,
  getMenuAdminStaffOnly,
  addStaffAdminMenu,
  createBaseAdminStaffMenu,
};
