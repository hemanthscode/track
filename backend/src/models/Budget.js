import mongoose from "mongoose";
import { isBefore, add } from "date-fns";

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true, // Enum moved to routes
    },
    category: {
      type: String,
      required: function () {
        return this.type === "budget";
      }, // Conditional still needed
    },
    amount: {
      type: Number,
      required: true, // Min moved to routes
    },
    period: {
      type: String,
      required: true, // Enum moved to routes
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
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook (still useful)
BudgetSchema.pre("save", function (next) {
  if (this.endDate && isBefore(this.endDate, this.startDate)) {
    return next(new Error("End date cannot be before start date"));
  }
  if (this.progress > this.amount) {
    return next(
      new Error("Progress cannot exceed the budget or savings amount")
    );
  }
  next();
});

// Methods (unchanged)
BudgetSchema.methods.isExpired = function () {
  return this.endDate && isBefore(this.endDate, new Date());
};

BudgetSchema.methods.getRemaining = function () {
  return this.type === "budget"
    ? this.amount - this.progress
    : this.amount - this.progress;
};

BudgetSchema.index({ userId: 1, period: 1, startDate: 1 });

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);
