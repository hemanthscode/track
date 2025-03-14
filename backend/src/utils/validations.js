import { body, param, query } from "express-validator";
import Budget from "../models/Budget.js";

// Helper functions
const requiredIf = (condition) => (value) => !condition || !!value;
const optionalRule = (rule) => (optional) => optional ? rule.optional() : rule;

const commonCategories = [
  "food", "housing", "transport", "utilities",
  "entertainment", "health", "subscriptions", "miscellaneous"
];
const incomeCategories = ["salary", "freelance", "investment"];
const allCategories = [...incomeCategories, ...commonCategories];

// Shared validation rules
const mongoIdRule = () => param("id").isMongoId().withMessage("Invalid MongoDB ObjectId");
const typeRule = (types, msg) => body("type").exists({ checkFalsy: true }).isIn(types).withMessage(msg);
const amountRule = () => body("amount").exists({ checkFalsy: true }).isFloat({ min: 0 }).withMessage("Amount must be a positive number");
const optionalAmountRule = () => body("amount").optional().isFloat({ min: 0 }).withMessage("Amount must be a positive number");
const descriptionRule = () => body("description").optional().isString().isLength({ max: 200 }).trim().withMessage("Description max 200 characters");
const dateRule = (field) => body(field).optional().isISO8601().withMessage(`${field} must be ISO8601 (e.g., '2025-03-07')`);

export const idValidation = [mongoIdRule()];

export const transactionValidation = (optional = false) => {
  const rules = [
    optionalRule(body("type").if(requiredIf(!optional)).exists({ checkFalsy: true }).isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"))(optional),
    optional ? optionalAmountRule() : amountRule(),
    optionalRule(body("category").if(requiredIf(!optional)).exists({ checkFalsy: true }).isIn(allCategories).withMessage(`Category must be: ${allCategories.join(", ")}`))(optional),
    descriptionRule(),
    dateRule("date"),
    body("isRecurring").optional().isBoolean().withMessage("isRecurring must be boolean"),
    body("recurringDetails.frequency")
      .if(body("isRecurring").equals(true))
      .exists({ checkFalsy: true })
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("Frequency must be: daily, weekly, monthly, or yearly"),
    dateRule("recurringDetails.nextOccurrence"),
    dateRule("recurringDetails.endDate"),
    body("tags")
      .optional()
      .isArray()
      .withMessage("Tags must be an array")
      .custom(tags => tags.every(tag => typeof tag === "string" && tag.length <= 50))
      .withMessage("Tags must be strings, max 50 characters"),
    body("savingsGoalId")
      .optional()
      .isMongoId()
      .withMessage("Invalid savings goal ID")
      .custom(async (value, { req }) => {
        if (!req.user?._id) throw new Error("Authentication required");
        const goal = await Budget.findOne({ _id: value, userId: req.user._id, type: "savings" });
        if (!goal) throw new Error("Savings goal not found");
        return true;
      }),
  ];
  return rules;
};

export const recurringDetailsValidation = (optional = false) => [
  optionalRule(body("recurringDetails.frequency").isIn(["daily", "weekly", "monthly", "yearly"]).withMessage("Frequency must be: daily, weekly, monthly, or yearly"))(optional),
  ...["nextOccurrence", "endDate"].map(field => 
    optionalRule(dateRule(`recurringDetails.${field}`))(optional)
  ),
];

export const budgetValidation = (optional = false) => {
  const rules = [
    optionalRule(typeRule(["budget", "savings"], "Type must be 'budget' or 'savings'"))(optional),
    optional ? optionalAmountRule() : amountRule(),
    optionalRule(body("period").exists({ checkFalsy: true }).isIn(["weekly", "monthly", "yearly"]).withMessage("Period must be: weekly, monthly, or yearly"))(optional),
    body("category")
      .if(body("type").equals("budget"))
      .exists({ checkFalsy: true })
      .isIn(commonCategories)
      .withMessage(`Category must be: ${commonCategories.join(", ")}`),
    descriptionRule(),
    dateRule("startDate"),
    dateRule("endDate"),
    body("progress")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Progress must be a positive number")
      .custom(async (progress, { req }) => {
        if (typeof progress !== "number") return true; // Skip if not provided or invalid
        let amount = req.body.amount;
        if (typeof amount !== "number" && req.params?.id) {
          // Fetch existing amount if not in request body (for updates)
          const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id }).lean();
          if (!budget) throw new Error("Budget not found");
          amount = budget.amount;
        }
        if (typeof amount === "number" && progress > amount) {
          throw new Error("Progress cannot exceed the budget or savings amount");
        }
        return true;
      }),
    body("endDate")
      .optional()
      .custom((endDate, { req }) => {
        const startDate = req.body.startDate || new Date();
        if (endDate && new Date(endDate) < new Date(startDate)) {
          throw new Error("End date cannot be before start date");
        }
        return true;
      }),
  ];
  return rules;
};

export const queryValidation = {
  transactions: [
    query("type").optional().isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),
    query("category").optional().isIn(allCategories).withMessage(`Category must be: ${allCategories.join(", ")}`),
    query("startDate").optional().isISO8601().withMessage("Start date must be ISO8601"),
    query("endDate").optional().isISO8601().withMessage("End date must be ISO8601"),
  ],
  trends: [
    query("period").optional().isIn(["monthly", "yearly"]).withMessage("Period must be 'monthly' or 'yearly'"),
  ],
  monthlyReport: [
    query("month").optional().isISO8601().withMessage("Month must be ISO8601 (e.g., '2025-03')"),
  ],
  yearlyReport: [
    query("year").optional().isInt({ min: 2000, max: 2100 }).withMessage("Year must be 2000-2100"),
  ],
  comparisonReport: [
    query("startDate").exists({ checkFalsy: true }).isISO8601().withMessage("Start date required in ISO8601"),
    query("endDate").exists({ checkFalsy: true }).isISO8601().withMessage("End date required in ISO8601"),
  ],
  topCategories: [
    query("limit").optional().isInt({ min: 1, max: 20 }).withMessage("Limit must be 1-20"),
  ],
  search: [
    query("query").optional().isString().withMessage("Query must be a string"),
    query("type").optional().isIn(["income", "expense"]).withMessage("Type must be 'income' or 'expense'"),
    query("category").optional().isIn(allCategories).withMessage(`Category must be: ${allCategories.join(", ")}`),
    query("startDate").optional().isISO8601().withMessage("Start date must be ISO8601"),
    query("endDate").optional().isISO8601().withMessage("End date must be ISO8601"),
  ],
};