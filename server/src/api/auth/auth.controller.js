import * as authService from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.registerUser(req.body);

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    { user, tokens },
    `Welcome ${user.username}! Account created successfully`
  );
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.loginUser(email, password, req);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { user, tokens },
    `Welcome back, ${user.username}!`
  );
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);

  sendSuccess(res, HTTP_STATUS.OK, { tokens }, "Token refreshed successfully");
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    `Goodbye ${req.user.username}! Logged out successfully`
  );
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "If the email exists, a password reset link has been sent"
  );
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "Password reset successful. Please login with your new password"
  );
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  await authService.verifyEmail(token);

  sendSuccess(res, HTTP_STATUS.OK, null, "Email verified successfully");
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  sendSuccess(res, HTTP_STATUS.OK, { user: req.user }, "User data retrieved");
});

export default {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
};
