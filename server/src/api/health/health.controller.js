import mongoose from "mongoose";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";
import { config } from "../../config/env.js";

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
export const healthCheck = asyncHandler(async (req, res) => {
  sendSuccess(
    res,
    HTTP_STATUS.OK,
    {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    },
    "Server is healthy"
  );
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with database status
 * @access  Public
 */
export const detailedHealthCheck = asyncHandler(async (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  const health = {
    status: dbStatus === "connected" ? "OK" : "ERROR",
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: process.uptime(),
    database: {
      status: dbStatus,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
    },
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };

  const statusCode =
    health.status === "OK" ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

  res.status(statusCode).json({
    success: health.status === "OK",
    message: health.status === "OK" ? "All systems operational" : "System error",
    data: health,
  });
});

export default { healthCheck, detailedHealthCheck };
