import express from "express";
import * as TransactionController from "../controllers/transactionController.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { body, param, query } from "express-validator";

const router = express.Router();

// Shared Validation Rules
const idValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid ID format. Must be a valid MongoDB ObjectId"),
];

const transactionValidation = [
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be either 'income' or 'expense'"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("category")
    .isIn([
      "salary",
      "freelance",
      "investment", // Income
      "food",
      "housing",
      "transport",
      "utilities",
      "entertainment",
      "health",
      "subscriptions",
      "miscellaneous", // Expenses
    ])
    .withMessage(
      "Category must be one of: salary, freelance, investment, food, housing, transport, utilities, entertainment, health, subscriptions, miscellaneous"
    ),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Description must be a string, maximum 200 characters"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO8601 format (e.g., '2025-03-07')"),
  body("isRecurring")
    .optional()
    .isBoolean()
    .withMessage("isRecurring must be a boolean value (true/false)"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array of strings")
    .custom((tags) =>
      tags.every((tag) => typeof tag === "string" && tag.length <= 50)
    )
    .withMessage("Each tag must be a string, maximum 50 characters"),
  body("savingsGoalId")
    .optional()
    .isMongoId()
    .withMessage("Savings goal ID must be a valid MongoDB ObjectId"),
];

const recurringDetailsValidation = [
  body("recurringDetails.frequency")
    .if(body("isRecurring").equals(true))
    .isIn(["daily", "weekly", "monthly", "yearly"])
    .withMessage("Frequency must be one of: daily, weekly, monthly, yearly"),
  body("recurringDetails.nextOccurrence")
    .optional()
    .isISO8601()
    .withMessage(
      "Next occurrence must be in ISO8601 format (e.g., '2025-03-07')"
    ),
  body("recurringDetails.endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO8601 format (e.g., '2025-03-07')"),
];

const budgetValidation = [
  body("type")
    .isIn(["budget", "savings"])
    .withMessage("Type must be either 'budget' or 'savings'"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a positive number"),
  body("period")
    .isIn(["weekly", "monthly", "yearly"])
    .withMessage("Period must be one of: weekly, monthly, yearly"),
  body("category")
    .if(body("type").equals("budget"))
    .isIn([
      "food",
      "housing",
      "transport",
      "utilities",
      "entertainment",
      "health",
      "subscriptions",
      "miscellaneous",
    ])
    .withMessage(
      "Category must be one of: food, housing, transport, utilities, entertainment, health, subscriptions, miscellaneous"
    ),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Description must be a string, maximum 200 characters"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO8601 format (e.g., '2025-03-07')"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO8601 format (e.g., '2025-03-07')"),
];

// Transaction CRUD
router.post(
  "/transactions",
  authenticate,
  validate(transactionValidation),
  TransactionController.createTransaction
);
router.get(
  "/transactions",
  authenticate,
  validate([
    query("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be 'income' or 'expense'"),
    query("category")
      .optional()
      .isIn([
        "salary",
        "freelance",
        "investment",
        "food",
        "housing",
        "transport",
        "utilities",
        "entertainment",
        "health",
        "subscriptions",
        "miscellaneous",
      ])
      .withMessage("Invalid category"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in ISO8601 format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be in ISO8601 format"),
  ]),
  TransactionController.getAllTransactions
);
router.get(
  "/transactions/:id",
  authenticate,
  validate(idValidation),
  TransactionController.getTransactionById
);
router.put(
  "/transactions/:id",
  authenticate,
  validate([
    ...idValidation,
    ...transactionValidation.map((v) => v.optional()),
  ]), // All fields optional for update
  TransactionController.updateTransaction
);
router.delete(
  "/transactions/:id",
  authenticate,
  validate(idValidation),
  TransactionController.deleteTransaction
);

// Recurring Transactions
router.post(
  "/recurring",
  authenticate,
  validate([...transactionValidation, ...recurringDetailsValidation]),
  TransactionController.createRecurringTransaction
);
router.get(
  "/recurring",
  authenticate,
  TransactionController.getAllRecurringTransactions
);
router.put(
  "/recurring/:id",
  authenticate,
  validate([
    ...idValidation,
    ...recurringDetailsValidation.map((v) => v.optional()),
  ]), // Partial updates
  TransactionController.updateRecurringTransaction
);
router.delete(
  "/recurring/:id",
  authenticate,
  validate(idValidation),
  TransactionController.cancelRecurringTransaction
);

// Budgets & Savings
router.post(
  "/budgets",
  authenticate,
  validate(budgetValidation),
  TransactionController.createBudget
);
router.get("/budgets", authenticate, TransactionController.getAllBudgets);
router.get(
  "/budgets/:id",
  authenticate,
  validate(idValidation),
  TransactionController.getBudgetById
);
router.put(
  "/budgets/:id",
  authenticate,
  validate([...idValidation, ...budgetValidation.map((v) => v.optional())]), // Partial updates
  TransactionController.updateBudget
);
router.delete(
  "/budgets/:id",
  authenticate,
  validate(idValidation),
  TransactionController.deleteBudget
);

// Dashboard Routes
router.get(
  "/dashboard/summary",
  authenticate,
  TransactionController.getDashboardSummary
);
router.get(
  "/dashboard/trends",
  authenticate,
  validate([
    query("period")
      .optional()
      .isIn(["monthly", "yearly"])
      .withMessage("Period must be 'monthly' or 'yearly'"),
  ]),
  TransactionController.getTrends
);
router.get(
  "/dashboard/category-insights",
  authenticate,
  TransactionController.getCategoryInsights
);
router.get(
  "/dashboard/savings-progress",
  authenticate,
  TransactionController.getSavingsProgress
);
router.get(
  "/dashboard/budget-status",
  authenticate,
  TransactionController.getBudgetStatus
);
router.get(
  "/dashboard/upcoming",
  authenticate,
  TransactionController.getUpcomingTransactions
);

// Reports & Analytics
router.get(
  "/reports/monthly",
  authenticate,
  validate([
    query("month")
      .optional()
      .isISO8601()
      .withMessage("Month must be in ISO8601 format (e.g., '2025-03')"),
  ]),
  TransactionController.getMonthlyReport
);
router.get(
  "/reports/yearly",
  authenticate,
  validate([
    query("year")
      .optional()
      .isInt({ min: 2000, max: 2100 })
      .withMessage("Year must be a number between 2000 and 2100"),
  ]),
  TransactionController.getYearlyReport
);
router.get(
  "/reports/comparison",
  authenticate,
  validate([
    query("startDate")
      .isISO8601()
      .withMessage("Start date must be in ISO8601 format (e.g., '2025-03-07')"),
    query("endDate")
      .isISO8601()
      .withMessage("End date must be in ISO8601 format (e.g., '2025-03-07')"),
  ]),
  TransactionController.getComparisonReport
);
router.get(
  "/reports/top-categories",
  authenticate,
  validate([
    query("limit")
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage("Limit must be an integer between 1 and 20"),
  ]),
  TransactionController.getTopCategories
);
router.get(
  "/reports/cash-flow",
  authenticate,
  TransactionController.getCashFlow
);
router.get(
  "/reports/savings-history",
  authenticate,
  TransactionController.getSavingsHistory
);

// Advanced Filtering & Export
router.get(
  "/transactions/search",
  authenticate,
  validate([
    query("query").optional().isString().withMessage("Query must be a string"),
    query("type")
      .optional()
      .isIn(["income", "expense"])
      .withMessage("Type must be 'income' or 'expense'"),
    query("category")
      .optional()
      .isIn([
        "salary",
        "freelance",
        "investment",
        "food",
        "housing",
        "transport",
        "utilities",
        "entertainment",
        "health",
        "subscriptions",
        "miscellaneous",
      ])
      .withMessage("Invalid category"),
    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in ISO8601 format"),
    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be in ISO8601 format"),
  ]),
  TransactionController.searchTransactions
);
router.get(
  "/export/transactions",
  authenticate,
  TransactionController.exportTransactions
);
router.get(
  "/export/budgets",
  authenticate,
  TransactionController.exportBudgets
);

export default router;
