import { config } from "../config/env.js";
import { HTTP_STATUS } from "../config/constants.js";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 if not an ApiError
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = err.message || "Internal Server Error";
  }

  // Log error
  logger.error("Error occurred", {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    stack: err.stack,
    user: req.user?._id,
  });

  // Response object
  const response = {
    success: false,
    message,
    ...(config.env === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

/**
 * Handle 404 errors
 */
export const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  next(error);
};

export default errorHandler;
