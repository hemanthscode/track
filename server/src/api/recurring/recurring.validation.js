import { body, param } from "express-validator";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  RECURRING_FREQUENCIES,
} from "../../config/constants.js";

const allCategories = [
  ...TRANSACTION_CATEGORIES.INCOME,
  ...TRANSACTION_CATEGORIES.EXPENSE,
];

export const createRecurringValidation = [
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

  body("recurringDetails.frequency")
    .isIn(Object.values(RECURRING_FREQUENCIES))
    .withMessage(
      `Frequency must be one of: ${Object.values(RECURRING_FREQUENCIES).join(", ")}`
    ),

  body("recurringDetails.startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in ISO 8601 format"),

  body("recurringDetails.endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format")
    .custom((endDate, { req }) => {
      const startDate = req.body.recurringDetails?.startDate || new Date();
      if (new Date(endDate) <= new Date(startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      return tags.every((tag) => typeof tag === "string" && tag.length <= 50);
    })
    .withMessage("Each tag must be a string with max 50 characters"),
];

export const updateRecurringValidation = [
  param("id").isMongoId().withMessage("Invalid recurring transaction ID"),

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

  body("recurringDetails.frequency")
    .optional()
    .isIn(Object.values(RECURRING_FREQUENCIES))
    .withMessage(
      `Frequency must be one of: ${Object.values(RECURRING_FREQUENCIES).join(", ")}`
    ),

  body("recurringDetails.endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be in ISO 8601 format")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date()) {
        throw new Error("End date must be in the future");
      }
      return true;
    }),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
];

export const recurringIdValidation = [
  param("id").isMongoId().withMessage("Invalid recurring transaction ID"),
];
