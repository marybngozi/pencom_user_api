const { User } = require("../models/user");
const { MainMenu } = require("../models/mainMenu");
const { SubMenu } = require("../models/subMenu");
const { UserMenu } = require("../models/userMenu");

const getMenuCS = async (userType) => {
  const findObj = {
    deleted: false,
  };

  if (userType == 100) {
    findObj["menuType"] = "company";
  } else if (userType == 200) {
    findObj["menuType"] = "staff";
  }
  let menus = [];

  const mainMenus = await MainMenu.find({
    deleted: false,
  });

  if (!mainMenus.length) return menus;

  for (let i = 0; i < mainMenus.length; i++) {
    const menu = mainMenus[i];
    let subMenus = await SubMenu.find(
      { ...findObj, menuId: menu.id },
      {
        createdAt: 0,
        updatedAt: 0,
        updatedAt: 0,
        deleted: 0,
        menuType: 0,
        menuId: 0,
      }
    );

    if (!subMenus.length) continue;

    menus.push({
      name: menu.name,
      icon: menu.icon,
      subMenus: subMenus,
    });
  }

  return menus;
};

const getMenuAdminStaff = async (agentId, companyCode) => {
  let menus = [];

  const userMenus = await UserMenu.find(
    {
      deleted: false,
      userId: agentId,
      companyCode,
    },
    {
      createdAt: 0,
      updatedAt: 0,
      updatedAt: 0,
      deleted: 0,
      userId: 0,
    }
  ).populate("menuId");

  if (!userMenus.length) return menus;

  const mainMenus = await MainMenu.find({
    deleted: false,
  });

  if (!mainMenus.length) return menus;

  for (let i = 0; i < mainMenus.length; i++) {
    const menu = mainMenus[i];
    let subMenus = userMenus.filter((sub) => menu.id == sub.menuId.menuId);

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
  const userMenus = await UserMenu.find(
    {
      deleted: false,
      userId: agentId,
      companyCode,
    },
    {
      createdAt: 0,
      updatedAt: 0,
      updatedAt: 0,
      deleted: 0,
      userId: 0,
    }
  ).populate("menuId");

  return userMenus;
};

module.exports = {
  getMenuCS,
  getMenuAdminStaff,
  getMenuAdminStaffOnly,
};
