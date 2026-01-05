import { USER_ROLES } from "../config/constants.js";
import ApiError from "../utils/ApiError.js";

/**
 * Check if authenticated user has admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required");
  }

  if (req.user.role !== USER_ROLES.ADMIN) {
    throw ApiError.forbidden("Admin access required");
  }

  next();
};

export default requireAdmin;
