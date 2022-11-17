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
  {
    _id: "636e66ae8c142e6cc9c6b290",
    name: "Profile",
    icon: "fa fa-user",
  },
  {
    _id: "636e66ae8c142e6cc9c6b291",
    name: "Transactions",
    icon: "fa fa-user",
  },
];

const SubMenus = [
  {
    name: "Upload Schedule",
    path: "/upload-schedule",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "View Pending Schedule",
    path: "/upload-status",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "List Uploaded Schedule",
    path: "/list-schedule",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "Process Schedule",
    path: "/process-schedule",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "View Processed Schedule",
    path: "/view-processed",
    menuId: "636b54c977cd215910d2dc67",
  },
  {
    name: "Validate Code",
    path: "/validate-company",
    menuId: "636b54c977cd215910d2dc66",
  },
  {
    name: "Create Admin Staff",
    path: "/create-staff",
    menuId: "636b54c977cd215910d2dc66",
  },
  {
    name: "List Admin Staff",
    path: "/list-staff",
    menuId: "636b54c977cd215910d2dc66",
  },
  {
    name: "Profile",
    path: "/view-profile",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "staff",
  },
  {
    name: "List Transaction",
    path: "/list-transaction",
    menuId: "636e66ae8c142e6cc9c6b291",
    menuType: "staff",
  },
  {
    name: "View Company",
    path: "/view-company",
    menuId: "636b54c977cd215910d2dc66",
    menuType: "adminStaff",
  },
];

module.exports = { MainMenus, SubMenus };
