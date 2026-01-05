import { query } from "express-validator";
import { TRANSACTION_TYPES } from "../../config/constants.js";

export const getOverviewValidation = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format"),
];

export const getCategoryBreakdownValidation = [
  query("type")
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage("Type must be 'income' or 'expense'"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format"),
];

export const getTrendsValidation = [
  query("period")
    .optional()
    .isIn(["daily", "weekly", "monthly", "yearly"])
    .withMessage("Period must be: daily, weekly, monthly, or yearly"),

  query("type")
    .optional()
    .isIn(Object.values(TRANSACTION_TYPES))
    .withMessage("Type must be 'income' or 'expense'"),

  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format"),
];

export const getComparisonsValidation = [
  query("period")
    .optional()
    .isIn(["week", "month", "year"])
    .withMessage("Period must be: week, month, or year"),
];
