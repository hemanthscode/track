import { User } from "../../models/index.js";
import {
  generateTokens,
  verifyToken,
  generateResetToken,
} from "../../utils/jwt.js";
import { getClientIP, getLocationFromIP } from "../../utils/geolocation.js";
import {
  sendPasswordResetEmail,
  sendEmailVerification,
} from "../../services/external/email.service.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Register new user
 */
export const registerUser = async (userData) => {
  try {
    const user = await User.create(userData);

    logger.info("User registered", {
      userId: user._id,
      username: user.username,
      email: user.email,
    });

    // Generate tokens
    const tokens = generateTokens(user._id, user.role);

    // Store refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  } catch (error) {
    logger.error("User registration failed", { error: error.message });
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (email, password, req) => {
  try {
    // Find user with password field
    const user = await User.findOne({ email }).select("+password +loginHistory");

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated. Please contact support.");
    }

    // Get client IP and location
    const ipAddress = getClientIP(req);
    const location = await getLocationFromIP(ipAddress);

    // Update login history
    user.loginHistory.push({
      loginAt: new Date(),
      ipAddress,
      device: req.headers["user-agent"] || "Unknown",
      location,
    });

    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    user.lastLogin = new Date();

    // Generate tokens
    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;

    await user.save();

    logger.info("User logged in", {
      userId: user._id,
      username: user.username,
      ipAddress,
      location,
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      tokens,
    };
  } catch (error) {
    logger.error("Login failed", { email, error: error.message });
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Find user with stored refresh token
    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (!user.isActive) {
      throw ApiError.forbidden("Account is deactivated");
    }

    // Generate new tokens
    const tokens = generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    logger.info("Access token refreshed", { userId: user._id });

    return tokens;
  } catch (error) {
    logger.error("Token refresh failed", { error: error.message });
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (user) {
      user.refreshToken = null;
      await user.save();

      logger.info("User logged out", { userId });
    }

    return true;
  } catch (error) {
    logger.error("Logout failed", { userId, error: error.message });
    throw error;
  }
};

/**
 * Forgot password - send reset email
 */
export const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      logger.warn("Password reset requested for non-existent email", { email });
      return true;
    }

    // Generate reset token
    const resetToken = generateResetToken(email);

    // Store token and expiry
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send email
    await sendPasswordResetEmail(email, user.username || user.firstName, resetToken);

    logger.info("Password reset email sent", { userId: user._id, email });

    return true;
  } catch (error) {
    logger.error("Forgot password failed", { email, error: error.message });
    throw ApiError.internal("Failed to send password reset email");
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (token, newPassword) => {
  try {
    // Verify token
    const decoded = verifyToken(token);

    // Find user with matching token
    const user = await User.findOne({
      email: decoded.email,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      throw ApiError.badRequest("Invalid or expired reset token");
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    logger.info("Password reset successful", { userId: user._id });

    return true;
  } catch (error) {
    logger.error("Password reset failed", { error: error.message });
    throw error;
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token) => {
  try {
    const decoded = verifyToken(token);

    const user = await User.findOne({
      email: decoded.email,
      emailVerificationToken: token,
    }).select("+emailVerificationToken");

    if (!user) {
      throw ApiError.badRequest("Invalid verification token");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    logger.info("Email verified", { userId: user._id, email: user.email });

    return true;
  } catch (error) {
    logger.error("Email verification failed", { error: error.message });
    throw error;
  }
};

export default {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
