import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendError } from "../utils/response.js";

export const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return sendError(res, 401, "Authentication required");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return sendError(res, 401, "Invalid or inactive user");
    req.user = user;
    next();
  } catch (error) {
    sendError(res, 401, "Invalid token");
  }
};