import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import ApiError from "./ApiError.js";

/**
 * Generate access token
 */
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiry }
  );
};

/**
 * Generate both tokens
 */
export const generateTokens = (userId, role) => {
  return {
    accessToken: generateAccessToken(userId, role),
    refreshToken: generateRefreshToken(userId),
  };
};

/**
 * Verify token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token expired");
    }
    throw ApiError.unauthorized("Invalid token");
  }
};

/**
 * Generate password reset token (short-lived)
 */
export const generateResetToken = (email) => {
  return jwt.sign({ email }, config.jwt.secret, { expiresIn: "1h" });
};
