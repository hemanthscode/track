import { sendSuccess, sendError } from "../utils/response.js";
import * as userService from "../services/userService.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await userService.getUserProfile(req.user._id);
    sendSuccess(
      res,
      200,
      profile,
      `Profile retrieved for '${profile.username}'`
    );
  } catch (error) {
    sendError(res, 404, error.message); // 404 for not found
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const profile = await userService.updateUserProfile(req.user._id, updates);
    sendSuccess(res, 200, profile, `Profile updated for '${profile.username}'`);
  } catch (error) {
    sendError(
      res,
      error.message.includes("not found") ? 404 : 400,
      error.message
    );
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await userService.changeUserPassword(
      req.user._id,
      oldPassword,
      newPassword
    );
    sendSuccess(
      res,
      200,
      null,
      `Password changed for user '${req.user.username}'`
    );
  } catch (error) {
    sendError(
      res,
      error.message.includes("not found") ? 404 : 400,
      error.message
    );
  }
};

export const getLoginHistory = async (req, res) => {
  try {
    const history = await userService.getUserLoginHistory(req.user._id);
    sendSuccess(
      res,
      200,
      history,
      `Login history retrieved for '${req.user.username}'`
    );
  } catch (error) {
    sendError(res, 404, error.message); // 404 for not found
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    const user = await userService.deactivateAccount(req.user._id);
    sendSuccess(res, 200, user, `Account '${user.username}' deactivated`);
  } catch (error) {
    sendError(
      res,
      error.message.includes("not found") ? 404 : 400,
      error.message
    );
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    sendSuccess(res, 200, users, `${users.length} users retrieved`);
  } catch (error) {
    sendError(res, 500, error.message); // Internal server error
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await userService.updateUserRole(id, role);
    sendSuccess(
      res,
      200,
      user,
      `Role updated to '${role}' for '${user.username}'`
    );
  } catch (error) {
    sendError(
      res,
      error.message.includes("not found") ? 404 : 400,
      error.message
    );
  }
};

export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.activateUser(id);
    sendSuccess(res, 200, user, `User '${user.username}' activated`);
  } catch (error) {
    sendError(
      res,
      error.message.includes("not found") ? 404 : 400,
      error.message
    );
  }
};

export const softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.softDeleteUser(id);
    sendSuccess(res, 200, user, `User '${user.username}' deactivated`);
  } catch (error) {
    sendError(
      res,
      error.message.includes("not found") ? 404 : 400,
      error.message
    );
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.hardDeleteUser(id);
    sendSuccess(res, 200, null, `User '${user.username}' permanently deleted`);
  } catch (error) {
    sendError(res, 404, error.message); // 404 for not found
  }
};

export const adminDashboard = (req, res) => {
  sendSuccess(
    res,
    200,
    null,
    `Welcome to the admin dashboard, ${req.user.username}`
  );
};
