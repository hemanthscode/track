import dotenv from "dotenv";
import connectDB from "./config/database.js";
import app from "./app.js";
import "./services/recurringJob.js"; // Start cron job
import logger from "./utils/logger.js";

// Load environment variables once at the entry point
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.prod" : ".env",
});

// Constants
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Start server with graceful shutdown
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        env: NODE_ENV,
      });
    });

    // Handle graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        mongoose.connection.close(false, () => {
          logger.info("MongoDB connection closed");
          process.exit(0);
        });
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT")); // Ctrl+C
    process.on("SIGTERM", () => shutdown("SIGTERM")); // Termination signal
  } catch (error) {
    logger.error("Server failed to start", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Initiate server startup
startServer();
