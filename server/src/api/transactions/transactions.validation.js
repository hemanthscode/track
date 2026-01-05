import { body, param, query } from "express-validator";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
} from "../../config/constants.js";

const allCategories = [
  ...TRANSACTION_CATEGORIES.INCOME,
  ...TRANSACTION_CATEGORIES.EXPENSE,
];

export const createTransactionValidation = [
  body("type")
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage("Type must be 'income' or 'expense'"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("category")
    .isIn(allCategories)
    .withMessage(`Category must be one of: ${allCategories.join(", ")}`),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO 8601 format (YYYY-MM-DD)"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      return tags.every((tag) => typeof tag === "string" && tag.length <= 50);
    })
    .withMessage("Each tag must be a string with max 50 characters"),

  body("savingsGoalId")
    .optional()
    .isMongoId()
    .withMessage("Invalid savings goal ID"),

  body("metadata.merchant")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Merchant name cannot exceed 100 characters"),

  body("metadata.paymentMethod")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Payment method cannot exceed 50 characters"),

  body("metadata.notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters"),
];

export const updateTransactionValidation = [
  param("id").isMongoId().withMessage("Invalid transaction ID"),

  body("type")
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage("Type must be 'income' or 'expense'"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("category")
    .optional()
    .isIn(allCategories)
    .withMessage(`Category must be one of: ${allCategories.join(", ")}`),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO 8601 format (YYYY-MM-DD)"),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      return tags.every((tag) => typeof tag === "string" && tag.length <= 50);
    })
    .withMessage("Each tag must be a string with max 50 characters"),
];

export const getTransactionsValidation = [
  query("type")
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage("Type must be 'income' or 'expense'"),

  query("category")
    .optional()
    .isIn(allCategories)
    .withMessage(`Invalid category`),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format"),

  query("minAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum amount must be 0 or greater"),

  query("maxAmount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum amount must be 0 or greater"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["date", "amount", "createdAt"])
    .withMessage("Sort by must be: date, amount, or createdAt"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

export const transactionIdValidation = [
  param("id").isMongoId().withMessage("Invalid transaction ID"),
];

export const searchTransactionsValidation = [
  query("q")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Search query cannot be empty"),

  query("type")
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage("Type must be 'income' or 'expense'"),

  query("category")
    .optional()
    .isIn(allCategories)
    .withMessage(`Invalid category`),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format"),
];
