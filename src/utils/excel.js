const fs = require("fs");
const XLSX = require("xlsx");
const logger = require("./logger");
const { BadRequestError, ServerError } = require("./errors");

const parseExcel = async (path) => {
  const workbook = XLSX.readFile(path);
  const sheet_name_list = workbook.SheetNames;

  const jsonData = XLSX.utils.sheet_to_json(
    workbook.Sheets[sheet_name_list[0]]
  );

  if (jsonData.length === 0) {
    fs.unlink(path, () => {
      logger.info(`empty excel upload: file ${path} deleted`);
    });
    throw new BadRequestError(
      "Excel File has no Data, review file and upload."
    );
  }

  return jsonData;
};

const createExcel = async (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Output");

  XLSX.writeFile(workbook, fileName, { compression: true });
};

module.exports = { parseExcel, createExcel };
