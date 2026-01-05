import app from "./app.js";
import { config } from "./config/env.js";
import connectDB from "./config/database.js";
import { initializeCloudinary } from "./config/cloudinary.js";
import { initializeGroq } from "./config/groq.js";
import { initializeEmail } from "./config/email.js";
import { initializeJobs } from "./jobs/index.js";
import logger from "./utils/logger.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Initialize all services and start server
 */
const startServer = async () => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 EXPENSE TRACKER API - SERVER INITIALIZATION");
    console.log("=".repeat(60) + "\n");

    // Connect to MongoDB
    logger.info("📦 Connecting to MongoDB...");
    await connectDB();

    // Initialize external services
    logger.info("☁️  Initializing Cloudinary...");
    initializeCloudinary();

    logger.info("🤖 Initializing Groq AI...");
    initializeGroq();

    logger.info("📧 Initializing Email service...");
    initializeEmail();

    // Initialize background jobs (cron)
    if (config.env !== "test") {
      logger.info("⏰ Starting background jobs...");
      initializeJobs();
    }

    // Start server
    const PORT = config.port || 3000;
    const server = app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log("✅ SERVER STARTED SUCCESSFULLY!");
      console.log("=".repeat(60));
      console.log(`\n🌐 Environment:     ${config.env.toUpperCase()}`);
      console.log(`🚀 Server running:  http://localhost:${PORT}`);
      console.log(`📍 API Base:        http://localhost:${PORT}/api`);
      console.log(`💚 Health Check:    http://localhost:${PORT}/api/health`);
      console.log(`📬 Test with:       Postman`);
      console.log(`📝 Node Version:    ${process.version}`);
      console.log("\n" + "=".repeat(60) + "\n");

      logger.info("Server ready to accept requests");
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} signal received - Starting graceful shutdown`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          // Close database connection (Mongoose 8.x - no callback)
          await mongoose.connection.close();
          logger.info("MongoDB connection closed");
          console.log("\n👋 Server shutdown complete\n");
          process.exit(0);
        } catch (err) {
          logger.error("Error during shutdown", { error: err.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown - timeout exceeded");
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("\n" + "❌".repeat(30));
    console.error("❌ SERVER STARTUP FAILED!");
    console.error("❌".repeat(30));
    console.error("\nError:", error.message);
    console.error("\n" + "❌".repeat(30) + "\n");

    logger.error("Failed to start server", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the server
startServer();
