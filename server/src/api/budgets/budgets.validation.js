import { body, param, query } from "express-validator";
import {
  BUDGET_TYPES,
  BUDGET_PERIODS,
  TRANSACTION_CATEGORIES,
} from "../../config/constants.js";

export const createBudgetValidation = [
  body("type")
    .isIn(Object.values(BUDGET_TYPES))
    .withMessage(`Type must be one of: ${Object.values(BUDGET_TYPES).join(", ")}`),

  body("category")
    .if(body("type").equals("budget"))
    .isIn(TRANSACTION_CATEGORIES.EXPENSE)
    .withMessage(`Category must be one of: ${TRANSACTION_CATEGORIES.EXPENSE.join(", ")}`),

  body("category")
    .if(body("type").equals("savings"))
    .optional({ values: "null" }),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("period")
    .isIn(Object.values(BUDGET_PERIODS))
    .withMessage(`Period must be one of: ${Object.values(BUDGET_PERIODS).join(", ")}`),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("alertThreshold")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Alert threshold must be between 0 and 100"),
];

export const updateBudgetValidation = [
  param("id").isMongoId().withMessage("Invalid budget ID"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("period")
    .optional()
    .isIn(Object.values(BUDGET_PERIODS))
    .withMessage(`Period must be one of: ${Object.values(BUDGET_PERIODS).join(", ")}`),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("alertThreshold")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Alert threshold must be between 0 and 100"),
];

export const budgetIdValidation = [
  param("id").isMongoId().withMessage("Invalid budget ID"),
];

export const getBudgetsValidation = [
  query("type")
    .optional()
    .isIn(Object.values(BUDGET_TYPES))
    .withMessage(`Type must be one of: ${Object.values(BUDGET_TYPES).join(", ")}`),

  query("category")
    .optional()
    .isIn(TRANSACTION_CATEGORIES.EXPENSE)
    .withMessage(`Invalid category`),

  query("period")
    .optional()
    .isIn(Object.values(BUDGET_PERIODS))
    .withMessage(`Period must be one of: ${Object.values(BUDGET_PERIODS).join(", ")}`),

  query("status")
    .optional()
    .isIn(["active", "expired", "warning", "exceeded"])
    .withMessage("Status must be: active, expired, warning, or exceeded"),
];

export const addProgressValidation = [
  param("id").isMongoId().withMessage("Invalid budget ID"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
];
