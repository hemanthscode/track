import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getLoginHistory,
  deactivateAccount,
  getAllUsers,
  updateUserRole,
  activateUser,
  softDeleteUser,
  deleteUser,
  adminDashboard,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/auth.js";
import { adminAuth } from "../middlewares/adminAuth.js";
import { validate } from "../middlewares/validate.js";
import { body, param } from "express-validator";

const router = express.Router();

// Validation Rules
const updateProfileValidation = [
  body("firstName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),
  body("lastName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
];

const changePasswordValidation = [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
];

const updateUserRoleValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
  body("role")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid user ID format"),
];

// User Routes
router.get("/profile", authenticate, getProfile);
router.put(
  "/profile",
  authenticate,
  validate(updateProfileValidation),
  updateProfile
);
router.put(
  "/change-password",
  authenticate,
  validate(changePasswordValidation),
  changePassword
);
router.get("/login-history", authenticate, getLoginHistory);
router.delete("/deactivate", authenticate, deactivateAccount);

// Admin Routes
router.get("/admin-dashboard", authenticate, adminAuth, adminDashboard);
router.get("/users", authenticate, adminAuth, getAllUsers);
router.put(
  "/users/:id/role",
  authenticate,
  adminAuth,
  validate(updateUserRoleValidation),
  updateUserRole
);
router.put(
  "/users/:id/activate",
  authenticate,
  adminAuth,
  validate(idValidation),
  activateUser
);
router.delete(
  "/users/:id",
  authenticate,
  adminAuth,
  validate(idValidation),
  softDeleteUser
);
router.delete(
  "/users/:id/hard-delete",
  authenticate,
  adminAuth,
  validate(idValidation),
  deleteUser
);

export default router;
