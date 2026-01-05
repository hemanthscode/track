import express from "express";
import * as usersController from "./users.controller.js";
import {
  updateProfileValidation,
  changePasswordValidation,
  updateUserRoleValidation,
  userIdValidation,
} from "./users.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/admin.middleware.js";

const router = express.Router();

// User routes
router.get("/profile", authenticate, usersController.getProfile);
router.put("/profile", authenticate, validate(updateProfileValidation), usersController.updateProfile);
router.put("/change-password", authenticate, validate(changePasswordValidation), usersController.changePassword);
router.get("/login-history", authenticate, usersController.getLoginHistory);
router.delete("/deactivate", authenticate, usersController.deactivateAccount);

// Admin routes
router.get("/", authenticate, requireAdmin, usersController.getAllUsers);
router.put("/:id/role", authenticate, requireAdmin, validate(updateUserRoleValidation), usersController.updateUserRole);
router.put("/:id/activate", authenticate, requireAdmin, validate(userIdValidation), usersController.activateUser);
router.delete("/:id", authenticate, requireAdmin, validate(userIdValidation), usersController.softDeleteUser);
router.delete("/:id/permanent", authenticate, requireAdmin, validate(userIdValidation), usersController.hardDeleteUser);

export default router;
