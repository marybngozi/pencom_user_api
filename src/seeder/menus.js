const MainMenus = [
  {
    _id: "636b54c977cd215910d2dc66",
    name: "Account",
    icon: "fa fa-user",
  },
  {
    _id: "636b54c977cd215910d2dc67",
    name: "Schedule",
    icon: "fa fa-suitcase",
  },
  /* {
    _id: "636e66ae8c142e6cc9c6b290",
    name: "Profile",
    icon: "fa fa-user",
  },
  {
    _id: "636e66ae8c142e6cc9c6b291",
    name: "Transactions",
    icon: "fa fa-user",
  }, */
];

const SubMenus = [
  {
    name: "Upload Schedule",
    path: "/upload-schedule",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "Uploaded Schedule Status",
    path: "/upload-status",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "Processed Schedules",
    path: "/view-processed",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "Sub-Admin Staff",
    path: "/sub-admin-staff",
    menuId: "636b54c977cd215910d2dc66",
  },
  {
    name: "Transaction",
    path: "/staff-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "staff",
  },
  {
    name: "Transaction",
    path: "/pfc-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
  },
  {
    name: "Transaction",
    path: "/pfa-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfa",
  },
  {
    name: "PFA Remit",
    path: "/pfa-remit",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
  },
];

module.exports = { MainMenus, SubMenus };
