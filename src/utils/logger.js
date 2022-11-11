const fs = require("fs");
const moment = require("moment");

const file = moment().format("YYYY-MM-DD") + ".log";

async function log(message, type = "INFO") {
  // Check if the file exists in the current directory, and if it is readable.
  const checkfile = fs.existsSync("./logs/" + file);

  const time = moment().format("h:mm:ss a");
  const data = `${type}: ${time}: ${message}`;
  if (!checkfile) {
    fs.writeFileSync("./logs/" + file, data);
  } else {
    fs.appendFileSync("./logs/" + file, data);
  }
}

module.exports = {
  log,
};
