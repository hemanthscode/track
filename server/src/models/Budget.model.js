import mongoose from "mongoose";
import { isBefore, add } from "date-fns";
import {
  BUDGET_TYPES,
  BUDGET_PERIODS,
  TRANSACTION_CATEGORIES,
} from "../config/constants.js";

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Budget type is required"],
      enum: Object.values(BUDGET_TYPES),
    },
    category: {
      type: String,
      required: function () {
        return this.type === BUDGET_TYPES.BUDGET;
      },
      validate: {
        validator: function (value) {
          if (this.type === BUDGET_TYPES.SAVINGS) {
            return true;
          }
          return TRANSACTION_CATEGORIES.EXPENSE.includes(value);
        },
        message: "Invalid category for budget",
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    period: {
      type: String,
      required: [true, "Period is required"],
      enum: Object.values(BUDGET_PERIODS),
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    endDate: {
      type: Date,
      default: function () {
        const intervals = {
          weekly: { weeks: 1 },
          monthly: { months: 1 },
          yearly: { years: 1 },
        };
        return add(this.startDate || Date.now(), intervals[this.period]);
      },
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [0, "Threshold cannot be negative"],
      max: [100, "Threshold cannot exceed 100"],
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validate endDate is after startDate
BudgetSchema.pre("save", function (next) {
  if (this.endDate && isBefore(this.endDate, this.startDate)) {
    return next(new Error("End date cannot be before start date"));
  }

  if (this.progress > this.amount) {
    return next(new Error("Progress cannot exceed the budget amount"));
  }

  next();
});

// Check if budget has expired
BudgetSchema.methods.isExpired = function () {
  return this.endDate && isBefore(this.endDate, new Date());
};

// Get remaining amount
BudgetSchema.methods.getRemaining = function () {
  return Math.max(0, this.amount - this.progress);
};

// Get progress percentage
BudgetSchema.methods.getProgressPercentage = function () {
  return Math.round((this.progress / this.amount) * 100);
};

// Check if alert threshold reached
BudgetSchema.methods.shouldSendAlert = function () {
  return (
    !this.alertSent &&
    this.getProgressPercentage() >= this.alertThreshold &&
    !this.isExpired()
  );
};

// Virtual for status
BudgetSchema.virtual("status").get(function () {
  if (this.isExpired()) {
    return "expired";
  }
  const percentage = this.getProgressPercentage();
  if (percentage >= 100) {
    return "exceeded";
  }
  if (percentage >= this.alertThreshold) {
    return "warning";
  }
  return "active";
});

// Indexes
BudgetSchema.index({ userId: 1, type: 1, period: 1 });
BudgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

const Budget = mongoose.model("Budget", BudgetSchema);

export default Budget;
