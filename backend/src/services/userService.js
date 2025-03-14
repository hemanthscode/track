import User from "../models/User.js";

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  return user;
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  return user;
};

export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  if (!(await user.comparePassword(oldPassword))) {
    throw new Error("Incorrect old password provided");
  }
  user.password = newPassword;
  await user.save();
  return true;
};

export const getUserLoginHistory = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  return user.loginHistory;
};

export const deactivateAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  if (!user.isActive)
    throw new Error(`User '${user.username}' is already deactivated`);
  user.isActive = false;
  await user.save();
  return user;
};

export const getAllUsers = async () => {
  return await User.find({}).select("-password");
};

export const updateUserRole = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  if (user.role === role)
    throw new Error(`User '${user.username}' already has role '${role}'`);
  user.role = role;
  await user.save();
  return user;
};

export const activateUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  if (user.isActive)
    throw new Error(`User '${user.username}' is already active`);
  user.isActive = true;
  await user.save();
  return user;
};

export const softDeleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  if (!user.isActive)
    throw new Error(`User '${user.username}' is already deactivated`);
  user.isActive = false;
  await user.save();
  return user;
};

export const hardDeleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error(`User with ID '${userId}' not found`);
  return user; // Return deleted user for confirmation
};
