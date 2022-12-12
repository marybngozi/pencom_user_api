const http = require("http");
const express = require("express");
// const morgan = require("morgan");
// const moment = require("moment");
const cors = require("cors");
// const fs = require("fs");
// const path = require("path");

const config = require("./config");
const initDB = require("./db");
const routes = require("./routes");
const morganMiddleware = require("./middlewares/morganLogger");
const logger = require("./utils/logger");
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

/* for logging purpose */

// You can set morgan to log differently depending on your environment
/* if (app.get("env") == "production") {
  // log only 5xx responses to console
  app.use(
    morgan("dev", {
      skip: function (req, res) {
        return res.statusCode < 500;
      },
    })
  );

  const logName = moment().format("DD_MMM_YYYY");
  app.use(
    morgan(
      ":remote-addr - :remote-user [:date[iso]] ':method :url HTTP/:http-version' :status :res[content-length] ':referrer' ':user-agent'",
      {
        stream: fs.createWriteStream(
          path.join(__dirname, `../logs/${logName}.log`),
          { flags: "a" }
        ),
      }
    )
  );
} else {
  app.use(morgan("dev"));
} */
// Add the morgan middleware
app.use(morganMiddleware);

//use public folder for assets and uploads etc.
app.use(express.static(__dirname + "/public"));

// api routes
app.use("/pencom", routes);

server.on("error", (e) => {
  logger.error("could not start server: ", e.message);
});
server.listen(config.PORT, () => {
  logger.info(`Server Running, Port: ${server.address().port}`);
});

module.exports = app;
