const http = require("http");
const express = require("express");
// const morgan = require("morgan");
// const moment = require("moment");
const cors = require("cors");
// const fs = require("fs");
const path = require("path");

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

// Add the morgan middleware
app.use(morganMiddleware);

//use public folder for assets and uploads etc.
app.use(express.static(path.join(__dirname, "../public")));

// api routes
app.use("/pencom", routes);

server.on("error", (e) => {
  logger.error("could not start server: ", e.message);
});
server.listen(config.PORT, () => {
  logger.info(`Server Running, Port: ${server.address().port}`);
});

module.exports = app;
