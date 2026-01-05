import { body, param } from "express-validator";
import { USER_ROLES } from "../../config/constants.js";
import { User } from "../../models/index.js";

export const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be 3-50 characters")
    .custom(async (username, { req }) => {
      if (await User.isUsernameTaken(username, req.user._id)) {
        throw new Error("Username already taken");
      }
      return true;
    }),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail()
    .custom(async (email, { req }) => {
      if (await User.isEmailTaken(email, req.user._id)) {
        throw new Error("Email already registered");
      }
      return true;
    }),
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("New password must contain at least one number")
    .matches(/[a-z]/)
    .withMessage("New password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase letter")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

export const updateUserRoleValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),

  body("role")
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(", ")}`),
];

export const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];
