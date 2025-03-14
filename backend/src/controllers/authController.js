import { sendSuccess, sendError } from "../utils/response.js";
import { registerUser, loginUser } from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    sendSuccess(
      res,
      201,
      user,
      `User '${user.username}' registered successfully`
    );
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password, req);
    sendSuccess(
      res,
      200,
      { user, token },
      `User '${user.username}' logged in successfully`
    );
  } catch (error) {
    const status =
      error.message.includes("Incorrect password") ||
      error.message.includes("No account found")
        ? 401
        : 403;
    sendError(res, status, error.message);
  }
};

export const logout = async (req, res) => {
  try {
    sendSuccess(
      res,
      200,
      null,
      `User '${req.user.username}' logged out successfully`
    );
  } catch (error) {
    sendError(res, 500, "Failed to process logout");
  }
};
