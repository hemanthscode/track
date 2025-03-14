import { sendError } from "../utils/response.js";

export const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") return sendError(res, 403, "Admin access required");
  next();
};