const { User } = require("../models/user");
const { MainMenu } = require("../models/mainMenu");
const { SubMenu } = require("../models/subMenu");
const { UserMenu } = require("../models/userMenu");
const userMenu = require("../models/userMenu");

const getUsersMenu = async (userType) => {
  const findObj = {
    deleted: false,
  };

  if (userType == 100) {
    findObj["menuType"] = "company";
  } else if (userType == 200) {
    findObj["menuType"] = "staff";
  } else if (userType == 400) {
    findObj["menuType"] = "pfc";
  } else if (userType == 500) {
    findObj["menuType"] = "pfa";
  }
  let menus = {
    mainMenus: [],
    subMenus: [],
  };

  let mainMenus = await MainMenu.find({
    deleted: false,
  });

  if (!mainMenus.length) return menus;

  const subMenus = await SubMenu.find(
    { ...findObj },
    {
      path: 1,
      name: 1,
      id: 1,
      menuType: 1,
      menuId: 1,
    }
  );

  if (!subMenus.length) return menus;

  const userMainMenusIds = subMenus.map((subMenu) => subMenu.menuId);
  mainMenus = mainMenus.filter((menu) => userMainMenusIds.indexOf(menu.id) < 0);

  if (!mainMenus.length) return menus;

  return {
    mainMenus,
    subMenus,
  };
};

const getMenuAdminStaff = async (agentId, companyCode) => {
  /* gets and builds the menu for login */
  let menus = [];

  const baseSubMenus = await SubMenu.find(
    {
      deleted: false,
      menuType: "adminStaff",
    },
    {
      id: 1,
      menuId: 1,
      name: 1,
      path: 1,
    }
  );

  const userMenus = await UserMenu.find(
    {
      deleted: false,
      userId: agentId,
      companyCode,
    },
    {
      menus: 1,
    }
  ).populate("menus");

  let allUserMenus = [...baseSubMenus];
  if (userMenus.length) {
    const userSubMenus = userMenus.menus;
    allUserMenus.push(...userSubMenus);
  }
  if (!allUserMenus.length) return menus;

  const mainMenus = await MainMenu.find({
    deleted: false,
  });

  if (!mainMenus.length) return menus;

  for (let i = 0; i < mainMenus.length; i++) {
    const menu = mainMenus[i];
    let subMenus = allUserMenus.filter((sub) => menu.id == sub.menuId);

    if (!subMenus.length) continue;

    menus.push({
      name: menu.name,
      icon: menu.icon,
      subMenus: subMenus,
    });
  }

  return menus;
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
