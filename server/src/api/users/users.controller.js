import * as usersService from "./users.service.js";
import { sendSuccess, sendPaginatedResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await usersService.getUserProfile(req.user._id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user: profile },
    "Profile retrieved successfully"
  );
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await usersService.updateUserProfile(req.user._id, req.body);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user: profile },
    "Profile updated successfully"
  );
});

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await usersService.changeUserPassword(req.user._id, currentPassword, newPassword);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "Password changed successfully. Please login again."
  );
});

/**
 * @route   GET /api/users/login-history
 * @desc    Get user login history
 * @access  Private
 */
export const getLoginHistory = asyncHandler(async (req, res) => {
  const history = await usersService.getUserLoginHistory(req.user._id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { loginHistory: history },
    "Login history retrieved successfully"
  );
});

/**
 * @route   DELETE /api/users/deactivate
 * @desc    Deactivate user account
 * @access  Private
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await usersService.deactivateAccount(req.user._id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user },
    "Account deactivated successfully"
  );
});

// Admin routes

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { users, total, page, limit } = await usersService.getAllUsers(req.query);

  sendPaginatedResponse(
    res,
    { users },
    page,
    limit,
    total,
    `Retrieved ${users.length} users`
  );
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const user = await usersService.updateUserRole(id, role);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user },
    `User role updated to '${role}'`
  );
});

/**
 * @route   PUT /api/users/:id/activate
 * @desc    Activate user account (admin only)
 * @access  Private/Admin
 */
export const activateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await usersService.activateUser(id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user },
    "User account activated"
  );
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user (admin only)
 * @access  Private/Admin
 */
export const softDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await usersService.softDeleteUser(id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user },
    "User account deactivated"
  );
});

/**
 * @route   DELETE /api/users/:id/permanent
 * @desc    Hard delete user (admin only)
 * @access  Private/Admin
 */
export const hardDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await usersService.hardDeleteUser(id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "User permanently deleted"
  );
});

export default {
  getProfile,
  updateProfile,
  changePassword,
  getLoginHistory,
  deactivateAccount,
  getAllUsers,
  updateUserRole,
  activateUser,
  softDeleteUser,
  hardDeleteUser,
};
