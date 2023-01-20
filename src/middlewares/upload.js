const path = require("path");
const multer = require("multer");
const logger = require("../utils/logger");
const { BadRequestError } = require("../utils/errors");

/* Excel Upload */
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

const uploadStorageExcel = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/uploads/schedule");
  },
  filename: (req, file, cb) => {
    logger.info("Multer excel storage middleware", file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadExcel = multer({
  storage: uploadStorageExcel,
  limits: { fileSize: 3000000 }, //(1000000 bytes = 1MB)
  fileFilter: excelFilter,
});

/* Logo image upload */
const imageFilter = (req, file, cb) => {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Please upload only png/jpeg/jpg file"));
  }
};

const uploadStorageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __basedir + "/public/logos");
  },
  filename: (req, file, cb) => {
    logger.info("Multer image storage middleware", file.originalname);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadImage = multer({
  storage: uploadStorageImage,
  limits: { fileSize: 3000000 }, //(1000000 bytes = 1MB)
  fileFilter: imageFilter,
});

module.exports = { uploadExcel, uploadImage };
