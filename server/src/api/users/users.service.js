import { User } from "../../models/index.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user;
  } catch (error) {
    logger.error("Failed to get user profile", { userId, error: error.message });
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const allowedUpdates = ["firstName", "lastName", "username", "email"];
    const filteredUpdates = {};

    // Filter only allowed fields
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    logger.info("User profile updated", { userId, updates: Object.keys(filteredUpdates) });

    return user;
  } catch (error) {
    logger.error("Failed to update user profile", { userId, error: error.message });
    throw error;
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    logger.info("User password changed", { userId });

    return true;
  } catch (error) {
    logger.error("Failed to change password", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get user login history
 */
export const getUserLoginHistory = async (userId) => {
  try {
    const user = await User.findById(userId).select("+loginHistory");

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    return user.loginHistory || [];
  } catch (error) {
    logger.error("Failed to get login history", { userId, error: error.message });
    throw error;
  }
};

/**
 * Deactivate user account
 */
export const deactivateAccount = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (!user.isActive) {
      throw ApiError.badRequest("Account is already deactivated");
    }

    user.isActive = false;
    user.refreshToken = null; // Invalidate sessions
    await user.save();

    logger.info("User account deactivated", { userId });

    return user;
  } catch (error) {
    logger.error("Failed to deactivate account", { userId, error: error.message });
    throw error;
  }
};

// Admin functions

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (filters = {}) => {
  try {
    const { page = 1, limit = 50, isActive, role, search } = filters;
    const skip = (page - 1) * limit;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total, page, limit };
  } catch (error) {
    logger.error("Failed to get all users", { error: error.message });
    throw error;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.role === newRole) {
      throw ApiError.badRequest(`User already has role: ${newRole}`);
    }

    user.role = newRole;
    await user.save();

    logger.info("User role updated", { userId, oldRole: user.role, newRole });

    return user;
  } catch (error) {
    logger.error("Failed to update user role", { userId, error: error.message });
    throw error;
  }
};

/**
 * Activate user account (admin only)
 */
export const activateUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (user.isActive) {
      throw ApiError.badRequest("User is already active");
    }

    user.isActive = true;
    await user.save();

    logger.info("User account activated", { userId });

    return user;
  } catch (error) {
    logger.error("Failed to activate user", { userId, error: error.message });
    throw error;
  }
};

/**
 * Soft delete user (admin only)
 */
export const softDeleteUser = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    user.isActive = false;
    user.refreshToken = null;
    await user.save();

    logger.info("User soft deleted", { userId });

    return user;
  } catch (error) {
    logger.error("Failed to soft delete user", { userId, error: error.message });
    throw error;
  }
};

/**
 * Hard delete user (admin only - permanent)
 */
export const hardDeleteUser = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw ApiError.notFound("User not found");
    }

    logger.warn("User permanently deleted", { 
      userId, 
      username: user.username,
      email: user.email 
    });

    return user;
  } catch (error) {
    logger.error("Failed to hard delete user", { userId, error: error.message });
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserLoginHistory,
  deactivateAccount,
  getAllUsers,
  updateUserRole,
  activateUser,
  softDeleteUser,
  hardDeleteUser,
};
