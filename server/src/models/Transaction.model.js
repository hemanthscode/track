import mongoose from "mongoose";
import { add, isBefore } from "date-fns";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  RECURRING_FREQUENCIES,
} from "../config/constants.js";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: Object.values(TRANSACTION_TYPES),
      index: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      validate: {
        validator: function (value) {
          const allCategories = [
            ...TRANSACTION_CATEGORIES.INCOME,
            ...TRANSACTION_CATEGORIES.EXPENSE,
          ];
          return allCategories.includes(value);
        },
        message: "Invalid category",
      },
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
      required: [true, "Date is required"],
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
      index: true,
    },
    recurringDetails: {
      frequency: {
        type: String,
        enum: [...Object.values(RECURRING_FREQUENCIES), null],
        default: null,
      },
      nextOccurrence: {
        type: Date,
        default: null,
        index: true,
      },
      endDate: {
        type: Date,
        default: null,
      },
      recurrenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        default: null,
      },
    },
    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
      default: null,
    },
    savingsGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.every((tag) => tag.length <= 50);
        },
        message: "Each tag cannot exceed 50 characters",
      },
    },
    aiCategorized: {
      type: Boolean,
      default: false,
    },
    metadata: {
      merchant: { type: String, trim: true },
      paymentMethod: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validate recurring transaction has frequency
TransactionSchema.pre("save", function (next) {
  if (this.isRecurring && !this.recurringDetails?.frequency) {
    return next(new Error("Recurring transaction must have a frequency"));
  }

  if (!this.isRecurring) {
    this.recurringDetails = {
      frequency: null,
      nextOccurrence: null,
      endDate: null,
      recurrenceId: null,
    };
  }

  next();
});

// Calculate next occurrence
TransactionSchema.methods.getNextOccurrence = function () {
  if (!this.isRecurring || !this.recurringDetails?.frequency) {
    return null;
  }

  const { frequency, nextOccurrence, endDate } = this.recurringDetails;
  const current = nextOccurrence || this.date;

  const intervals = {
    daily: { days: 1 },
    weekly: { weeks: 1 },
    monthly: { months: 1 },
    yearly: { years: 1 },
  };

  const next = add(current, intervals[frequency]);

  if (endDate && isBefore(endDate, next)) {
    return null;
  }

  return next;
};

// Check if recurring has ended
TransactionSchema.methods.hasRecurringEnded = function () {
  return (
    this.isRecurring &&
    this.recurringDetails?.endDate &&
    isBefore(this.recurringDetails.endDate, new Date())
  );
};

// Compound indexes for performance
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1, date: -1 });
TransactionSchema.index({ userId: 1, isRecurring: 1, "recurringDetails.nextOccurrence": 1 });
TransactionSchema.index({ userId: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;
