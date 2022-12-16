const multer = require("multer");
const logger = require("../utils/logger");
const { BadRequestError } = require("../utils/errors");

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("spreadsheetml")
  ) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Please upload only excel file"));
  }
};

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/uploads/schedule");
  },
  filename: (req, file, cb) => {
    logger.info("Multer excel storage middleware", file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadExcel = multer({
  storage: uploadStorage,
  limits: { fileSize: 3000000 }, //(1000000 bytes = 1MB)
  fileFilter: excelFilter,
});

module.exports = { uploadExcel };
