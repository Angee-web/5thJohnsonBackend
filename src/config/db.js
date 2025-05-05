const mongoose = require("mongoose");
const logger = require("../utils/logger");
const config = require("./config");

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    // Check if mongoURI is defined
    if (!config.mongoURI) {
      throw new Error(
        "MongoDB URI is not defined. Check your environment variables."
      );
    }

    logger.info(`Attempting to connect to MongoDB...`);

    // Connect to MongoDB
    const conn = await mongoose.connect(config.mongoURI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.info(
      `MongoDB URI format check: ${
        config.mongoURI ? "URI defined" : "URI NOT defined"
      }`
    );
    logger.info(
      `Hint: Make sure MongoDB Atlas IP whitelist includes your current IP address`
    );
    process.exit(1);
  }
};

module.exports = { connectDB };
