import User from "../models/User.model.js";
import { verifyToken } from "../utils/jwt.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw ApiError.unauthorized("Authentication required");
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw ApiError.unauthorized("User not found");
  }

  if (!user.isActive) {
    throw ApiError.forbidden("Account is deactivated");
  }

  req.user = user;
  next();
});

export default authenticate;
