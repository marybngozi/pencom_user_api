const http = require("http");
const express = require("express");
const morgan = require("morgan");
const moment = require("moment");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const initDB = require("./db");
const routes = require("./routes");
const app = express();
const server = http.createServer(app);

// Defaults
global.__basedir = __dirname;
app.use(
  express.json({
    limit: config.BODY_LIMIT,
  })
);

// app headers
app.use(cors());

// connect to db
initDB();

// for logging purpose
// You can set morgan to log differently depending on your environment
if (app.get("env") == "production") {
  const logName = moment().format("MMM Do YYYY");
  app.use(
    morgan("combined", {
      stream: fs.createWriteStream(
        path.join(__dirname, `../logs/${logName}.log`),
        { flags: "a" }
      ),
    })
  );

  app.use(morgan("common"));
} else {
  app.use(morgan("dev"));
}

//use public folder for assets and uploads etc.
app.use(express.static(__dirname + "/public"));

// api routes
app.use("/pencom", routes);

server.on("error", (e) => {
  console.log("could not start server: ", e.message);
});
server.listen(config.PORT, () => {
  console.log([
    "---------------------------",
    "Server Running, for good",
    "---------------------------",
    `Port: ${server.address().port}`,
    "---------------------------",
  ]);
});

module.exports = app;
