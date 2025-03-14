import mongoose from "mongoose";
import { isBefore, add } from "date-fns";

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDetails: {
      frequency: { type: String, default: null },
      nextOccurrence: { type: Date, default: null, index: true },
      endDate: { type: Date, default: null },
      recurrenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        default: null,
      },
    },
    receiptImage: {
      type: String,
      default: null,
    },
    savingsGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// Updated pre-save hook
TransactionSchema.pre("save", function (next) {
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

// Methods (unchanged)
TransactionSchema.methods.getNextOccurrence = function () {
  if (!this.isRecurring || !this.recurringDetails?.frequency) return null;
  const { frequency, nextOccurrence, endDate } = this.recurringDetails;
  const current = nextOccurrence || this.date;
  const intervals = {
    daily: { days: 1 },
    weekly: { weeks: 1 },
    monthly: { months: 1 },
    yearly: { years: 1 },
  };
  const next = add(current, intervals[frequency]);
  return endDate && isBefore(endDate, next) ? null : next;
};

TransactionSchema.methods.hasRecurringEnded = function () {
  return (
    this.isRecurring &&
    this.recurringDetails.endDate &&
    isBefore(this.recurringDetails.endDate, new Date())
  );
};

// Indexes (unchanged)
TransactionSchema.index({
  "recurringDetails.nextOccurrence": 1,
  isRecurring: 1,
});

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
