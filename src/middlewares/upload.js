const multer = require("multer");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb("Please upload only excel file.", false);
  }
};

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/uploads/schedule");
  },
  filename: (req, file, cb) => {
    console.log("Multer excel storage middleware", file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadExcel = multer({
  storage: uploadStorage,
  limits: { fileSize: 3000000 }, //(1000000 bytes = 1MB)
  fileFilter: excelFilter,
});

module.exports = { uploadExcel };
