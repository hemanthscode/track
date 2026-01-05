import express from "express";
import * as recurringController from "./recurring.controller.js";
import {
  createRecurringValidation,
  updateRecurringValidation,
  recurringIdValidation,
} from "./recurring.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, validate(createRecurringValidation), recurringController.createRecurringTransaction);
router.get("/", authenticate, recurringController.getAllRecurringTransactions);
router.get("/:id", authenticate, validate(recurringIdValidation), recurringController.getRecurringTransactionById);
router.put("/:id", authenticate, validate(updateRecurringValidation), recurringController.updateRecurringTransaction);
router.post("/:id/cancel", authenticate, validate(recurringIdValidation), recurringController.cancelRecurringTransaction);
router.delete("/:id", authenticate, validate(recurringIdValidation), recurringController.deleteRecurringTransaction);
router.get("/:id/upcoming", authenticate, validate(recurringIdValidation), recurringController.getUpcomingInstances);

export default router;
