import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

export const registerUser = async (userData) => {
  const { email, username } = userData;
  if (await User.isEmailTaken(email)) {
    throw new Error(`Email '${email}' is already registered`);
  }
  // Optional: Check username uniqueness explicitly (schema handles it, but explicit message is nicer)
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error(`Username '${username}' is already taken`);
  }
  return await User.create(userData);
};

export const loginUser = async (email, password, req) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`No account found with email '${email}'`);
  }
  if (!(await user.comparePassword(password))) {
    throw new Error("Incorrect password");
  }
  if (!user.isActive) {
    throw new Error(`Account with email '${email}' is deactivated`);
  }

  user.loginHistory.push({
    ipAddress: req.ip,
    device: req.headers["user-agent"],
    location: "Unknown",
  });
  user.lastLogin = Date.now();
  await user.save();

  const token = generateToken(user);
  return { user, token };
};