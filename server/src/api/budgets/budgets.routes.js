import express from "express";
import * as budgetsController from "./budgets.controller.js";
import {
  createBudgetValidation,
  updateBudgetValidation,
  budgetIdValidation,
  getBudgetsValidation,
  addProgressValidation,
} from "./budgets.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, validate(createBudgetValidation), budgetsController.createBudget);
router.get("/", authenticate, validate(getBudgetsValidation), budgetsController.getAllBudgets);
router.get("/summary", authenticate, budgetsController.getBudgetSummary);
router.get("/:id", authenticate, validate(budgetIdValidation), budgetsController.getBudgetById);
router.put("/:id", authenticate, validate(updateBudgetValidation), budgetsController.updateBudget);
router.delete("/:id", authenticate, validate(budgetIdValidation), budgetsController.deleteBudget);
router.post("/:id/progress", authenticate, validate(addProgressValidation), budgetsController.addProgress);

export default router;
