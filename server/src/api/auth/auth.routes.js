import express from "express";
import * as authController from "./auth.controller.js";
import {
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  verifyEmailValidation,
} from "./auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  authLimiter,
  passwordResetLimiter,
} from "../../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  authLimiter,
  validate(registerValidation),
  authController.register
);

router.post(
  "/login",
  authLimiter,
  validate(loginValidation),
  authController.login
);

router.post(
  "/refresh",
  validate(refreshTokenValidation),
  authController.refreshToken
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate(forgotPasswordValidation),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  authController.resetPassword
);

router.post(
  "/verify-email",
  validate(verifyEmailValidation),
  authController.verifyEmail
);

// Protected routes
router.get("/me", authenticate, authController.getCurrentUser);

router.post("/logout", authenticate, authController.logout);

export default router;
