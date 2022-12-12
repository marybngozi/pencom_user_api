const mongoose = require("mongoose");
const config = require("./config");
const logger = require("./utils/logger");

module.exports = () => {
  const mongoURI = config.MONGODB_URI;

  const options = {
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const db = mongoose.connect(mongoURI, options);

  mongoose.connection.on("connected", () => {
    logger.info("Mongoose default connection open to " + mongoURI);
  });

  // If the connection throws an error
  mongoose.connection.on("error", (err) => {
    logger.error("handle mongo errored connections: " + err);
  });

  // When the connection is disconnected
  mongoose.connection.on("disconnected", () => {
    logger.info("Mongoose default connection disconnected");
  });

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      logger.info("App terminated, closing mongo connections");
      process.exit(0);
    });
  });
};
