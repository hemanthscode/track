import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config/env.js";
import logger from "./utils/logger.js";

// Import middlewares
import {
  apiLimiter,
  sanitizeData,
  preventXSS,
  errorHandler,
  notFound,
} from "./middlewares/index.js";

// Import routes
import { authRoutes } from "./api/auth/index.js";
import { usersRoutes } from "./api/users/index.js";
import { transactionsRoutes } from "./api/transactions/index.js";
import { recurringRoutes } from "./api/recurring/index.js";
import { budgetsRoutes } from "./api/budgets/index.js";
import { analyticsRoutes } from "./api/analytics/index.js";
import { receiptsRoutes } from "./api/receipts/index.js";
import { aiRoutes } from "./api/ai/index.js";
import { healthRoutes } from "./api/health/index.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression
app.use(compression());

// Sanitization
app.use(sanitizeData);
app.use(preventXSS);

// Rate limiting
app.use("/api", apiLimiter);

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Expense Tracker API v2.0",
    version: "2.0.0",
    environment: config.env,
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      transactions: "/api/transactions",
      recurring: "/api/recurring",
      budgets: "/api/budgets",
      analytics: "/api/analytics",
      receipts: "/api/receipts",
      ai: "/api/ai",
    },
    documentation: "Import postman_collection.json in Postman for API testing",
  });
});

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/receipts", receiptsRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

// Uncaught exception
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

export default app;
