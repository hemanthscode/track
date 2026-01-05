import { HTTP_STATUS } from "../config/constants.js";

/**
 * Send success response
 */
export const sendSuccess = (res, statusCode = HTTP_STATUS.OK, data = null, message = "Success") => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 */
export const sendError = (res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = "Internal Server Error", errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = (res, data, page, limit, total, message = "Success") => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
};
