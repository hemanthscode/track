import { body } from "express-validator";

export const categorizationValidation = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("type")
    .optional()
    .isIn(["income", "expense"])
    .withMessage("Type must be 'income' or 'expense'"),
];

export const insightsValidation = [
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format"),
];

export const chatValidation = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];

export const budgetRecommendationValidation = [
  body("monthlyIncome")
    .isFloat({ min: 0 })
    .withMessage("Monthly income must be a positive number"),
];
