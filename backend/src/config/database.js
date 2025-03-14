import mongoose from "mongoose";
import logger from "../utils/logger.js";
import dotenv from "dotenv";


dotenv.config();
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB connected", { host: mongoose.connection.host });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      message: error.message,
      stack: error.stack,
    });
    throw error; // Propagate error to server startup
  }
};

export default connectDB;
