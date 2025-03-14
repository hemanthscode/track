import express from "express";
import * as BudgetController from "../../controllers/transactions/budgetController.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { idValidation, budgetValidation } from "../../utils/validations.js";

const router = express.Router();

// Base path: /api/transactions/budgets
router
  .route("/budgets")
  .post(authenticate, validate(budgetValidation()), BudgetController.createBudget)
  .get(authenticate, BudgetController.getAllBudgets);

router
  .route("/budgets/:id")
  .get(authenticate, validate(idValidation), BudgetController.getBudgetById)
  .put(authenticate, validate([...idValidation, ...budgetValidation(true)]), BudgetController.updateBudget)
  .delete(authenticate, validate(idValidation), BudgetController.deleteBudget);

export default router;