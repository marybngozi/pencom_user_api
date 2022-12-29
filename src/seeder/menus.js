const MainMenus = [
  {
    _id: "636b54c977cd215910d2dc66",
    name: "Account",
    slug: "account",
    icon: "fa fa-user",
    pindex: 1,
  },
  {
    _id: "636b54c977cd215910d2dc67",
    name: "Schedule",
    slug: "schedule",
    icon: "fa fa-suitcase",
    pindex: 2,
  },
];

const SubMenus = [
  {
    name: "Upload Schedule",
    path: "/schedule/upload",
    menuId: "636b54c977cd215910d2dc67",
    menuType: "company",
    pindex: 1,
  },
  {
    name: "Uploaded Schedule Status",
    path: "/schedule/upload-status",
    menuId: "636b54c977cd215910d2dc67",
    menuType: "company",
    pindex: 2,
  },
  {
    name: "Processed Schedules",
    path: "/schedule/view-processed",
    menuId: "636b54c977cd215910d2dc67",
    menuType: "company",
    pindex: 3,
  },
  {
    name: "Profile",
    path: "/account/profile",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "all",
    pindex: 4,
  },
  {
    name: "Sub-Admin Staff",
    path: "/account/company-staff",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "company",
    pindex: 5,
  },
  {
    name: "Transaction",
    path: "/account/staff-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "staff",
    pindex: 6,
  },
  {
    name: "PFA Remit",
    path: "/account/pfa-remit",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
    pindex: 7,
  },
  {
    name: "Transaction",
    path: "/account/pfc-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
    pindex: 8,
  },
  {
    name: "Sub-Admin Staff",
    path: "/account/pfc-staff",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
    pindex: 9,
  },
  {
    name: "Transaction",
    path: "/account/pfa-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfa",
    pindex: 10,
  },
];

module.exports = { MainMenus, SubMenus };
