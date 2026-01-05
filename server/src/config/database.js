import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { config } from "./env.js";

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(config.database.uri, options);

    logger.info("✅ MongoDB connected successfully");

    // Connection event handlers
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    // Graceful shutdown (Mongoose 8.x - no callback)
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
        process.exit(0);
      } catch (err) {
        logger.error("Error closing MongoDB", { error: err.message });
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error("MongoDB connection failed", { error: error.message });
    process.exit(1);
  }
};

export default connectDB;
