const XLSX = require("xlsx");
const { BadRequestError, ServerError } = require("./errors");

const parseExcel = async (path) => {
  try {
    const workbook = XLSX.readFile(path);
    const sheet_name_list = workbook.SheetNames;

    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    if (jsonData.length === 0) {
      throw new BadRequestError("Excel has no Data");
    }

    return jsonData;
  } catch (err) {
    console.log("utlis-parseExcel", err);
    throw new ServerError("Error Parsing Excel file");
  }
};

const createExcel = async (data, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Output");

  XLSX.writeFile(workbook, fileName, { compression: true });
};

module.exports = { parseExcel, createExcel };
