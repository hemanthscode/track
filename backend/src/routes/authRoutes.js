import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { body } from "express-validator";

const router = express.Router();

// Validation Rules
const registerValidation = [
  body("username")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username must be 3-50 characters"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("First name must be max 50 characters"),
  body("lastName")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Last name must be max 50 characters"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be 'user' or 'admin'"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.post("/logout", authenticate, logout);

export default router;
