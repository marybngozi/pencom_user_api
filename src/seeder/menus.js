const MainMenus = [
  {
    _id: "636b54c977cd215910d2dc66",
    name: "Account",
    slug: "account",
    icon: "fa fa-user",
  },
  {
    _id: "636b54c977cd215910d2dc67",
    name: "Schedule",
    slug: "schedule",
    icon: "fa fa-suitcase",
  },
];

const SubMenus = [
  {
    name: "Upload Schedule",
    path: "/schedule/upload",
    menuId: "636b54c977cd215910d2dc67",
    menuType: "company",
  },
  {
    name: "Uploaded Schedule Status",
    path: "/schedule/upload-status",
    menuId: "636b54c977cd215910d2dc67",
    menuType: "company",
  },
  {
    name: "Processed Schedules",
    path: "/schedule/view-processed",
    menuId: "636b54c977cd215910d2dc67",
    menuType: "company",
  },
  {
    name: "Sub-Admin Staff",
    path: "/account/list-staff",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "company",
  },
  {
    name: "Transaction",
    path: "/account/staff-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "staff",
  },
  {
    name: "Transaction",
    path: "/account/pfc-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
  },
  {
    name: "Transaction",
    path: "/account/pfa-transaction",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfa",
  },
  {
    name: "PFA Remit",
    path: "/account/pfa-remit",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "pfc",
  },
];

module.exports = { MainMenus, SubMenus };
