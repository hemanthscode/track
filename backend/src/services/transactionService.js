import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

// Transaction CRUD
export const createTransaction = async (userId, transactionData) => {
  const transaction = new Transaction({ ...transactionData, userId });
  if (transaction.isRecurring && !transaction.recurringDetails?.frequency) {
    throw new Error("Frequency is required for recurring transactions");
  }
  return await transaction.save();
};

export const getAllTransactions = async (userId, filters = {}) => {
  const query = { userId: new mongoose.Types.ObjectId(userId), ...filters };
  const transactions = await Transaction.find(query).sort({ date: -1 });
  return transactions;
};

export const getTransactionById = async (userId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error(`Invalid transaction ID format: '${transactionId}'`);
  }
  const transaction = await Transaction.findOne({ _id: transactionId, userId });
  return transaction; // Null if not found, handled in controller
};

export const updateTransaction = async (userId, transactionId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error(`Invalid transaction ID format: '${transactionId}'`);
  }
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!transaction) {
    throw new Error(`Transaction with ID '${transactionId}' not found for user`);
  }
  return transaction;
};

export const deleteTransaction = async (userId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error(`Invalid transaction ID format: '${transactionId}'`);
  }
  const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });
  if (!transaction) {
    throw new Error(`Transaction with ID '${transactionId}' not found for user`);
  }
  return transaction; // Return deleted transaction for confirmation
};

// Recurring Transactions
export const createRecurringTransaction = async (userId, recurringData) => {
  const transaction = await createTransaction(userId, {
    ...recurringData,
    isRecurring: true,
  });
  return transaction;
};

export const getAllRecurringTransactions = async (userId) => {
  const transactions = await Transaction.find({ userId, isRecurring: true });
  return transactions;
};

export const updateRecurringTransaction = async (userId, transactionId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error(`Invalid transaction ID format: '${transactionId}'`);
  }
  const transaction = await Transaction.findOne({ _id: transactionId, userId, isRecurring: true });
  if (!transaction) {
    throw new Error(`Recurring transaction with ID '${transactionId}' not found for user`);
  }
  const updated = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    updates,
    { new: true, runValidators: true }
  );
  return updated;
};

export const cancelRecurringTransaction = async (userId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new Error(`Invalid transaction ID format: '${transactionId}'`);
  }
  const transaction = await Transaction.findOne({ _id: transactionId, userId, isRecurring: true });
  if (!transaction) {
    throw new Error(`Recurring transaction with ID '${transactionId}' not found for user`);
  }
  if (transaction.hasRecurringEnded()) {
    throw new Error(`Recurring transaction '${transactionId}' has already ended`);
  }
  transaction.recurringDetails.endDate = new Date();
  return await transaction.save();
};

// Budgets & Savings
export const createBudget = async (userId, budgetData) => {
  const budget = new Budget({ ...budgetData, userId });
  return await budget.save();
};

export const getAllBudgets = async (userId) => {
  return await Budget.find({ userId });
};

export const getBudgetById = async (userId, budgetId) => {
  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new Error(`Invalid budget ID format: '${budgetId}'`);
  }
  const budget = await Budget.findOne({ _id: budgetId, userId });
  return budget; // Null if not found
};

export const updateBudget = async (userId, budgetId, updates) => {
  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new Error(`Invalid budget ID format: '${budgetId}'`);
  }
  const budget = await Budget.findOneAndUpdate(
    { _id: budgetId, userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!budget) {
    throw new Error(`Budget or savings goal with ID '${budgetId}' not found for user`);
  }
  return budget;
};

export const deleteBudget = async (userId, budgetId) => {
  if (!mongoose.Types.ObjectId.isValid(budgetId)) {
    throw new Error(`Invalid budget ID format: '${budgetId}'`);
  }
  const budget = await Budget.findOneAndDelete({ _id: budgetId, userId });
  if (!budget) {
    throw new Error(`Budget or savings goal with ID '${budgetId}' not found for user`);
  }
  return budget;
};

// Dashboard Insights
export const getDashboardSummary = async (userId) => {
  const transactions = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const income = transactions.find((t) => t._id === "income")?.total || 0;
  const expenses = transactions.find((t) => t._id === "expense")?.total || 0;
  const balance = income - expenses;

  const savingsGoals = await Budget.find({ userId, type: "savings" });
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);

  return { balance, income, expenses, totalSavings };
};

export const getTrends = async (userId, period = "monthly") => {
  const dateField = period === "monthly" ? { $month: "$date" } : { $year: "$date" };
  const trends = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: { period: dateField, type: "$type" }, total: { $sum: "$amount" } } },
    { $sort: { "_id.period": 1 } },
  ]);
  return trends;
};

export const getCategoryInsights = async (userId) => {
  const insights = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } },
  ]);
  return insights;
};

export const getSavingsProgress = async (userId) => {
  const savings = await Budget.find({ userId, type: "savings" });
  return savings.map((goal) => ({
    ...goal.toObject(),
    remaining: goal.getRemaining(),
    isExpired: goal.isExpired(),
  }));
};

export const getBudgetStatus = async (userId) => {
  const budgets = await Budget.find({ userId, type: "budget" });
  const transactions = await Transaction.find({ userId, type: "expense" });

  return budgets.map((budget) => {
    const spent = transactions
      .filter((t) => 
        t.category === budget.category &&
        t.date >= budget.startDate &&
        (!budget.endDate || t.date <= budget.endDate)
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      ...budget.toObject(),
      spent,
      remaining: budget.amount - spent,
      isExpired: budget.isExpired(),
    };
  });
};

export const getUpcomingTransactions = async (userId) => {
  const upcoming = await Transaction.find({
    userId,
    isRecurring: true,
    "recurringDetails.nextOccurrence": { $gte: new Date() },
    $or: [
      { "recurringDetails.endDate": null },
      { "recurringDetails.endDate": { $gte: new Date() } },
    ],
  }).sort({ "recurringDetails.nextOccurrence": 1 });
  return upcoming.map((t) => ({
    ...t.toObject(),
    nextOccurrence: t.getNextOccurrence(),
  }));
};

// Reports & Analytics
export const getMonthlyReport = async (userId, month = new Date()) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const report = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
    { $group: { _id: "$type", total: { $sum: "$amount" }, transactions: { $push: "$$ROOT" } } },
  ]);
  return report;
};

export const getYearlyReport = async (userId, year = new Date().getFullYear()) => {
  const report = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), $expr: { $eq: [{ $year: "$date" }, year] } } },
    { $group: { _id: { month: { $month: "$date" }, type: "$type" }, total: { $sum: "$amount" } } },
    { $sort: { "_id.month": 1 } },
  ]);
  return report;
};

export const getComparisonReport = async (userId, startDate, endDate) => {
  if (!startDate || !endDate) {
    throw new Error("Start date and end date are required for comparison report");
  }
  const report = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: new Date(startDate), $lte: new Date(endDate) },
      },
    },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  return report;
};

export const getTopCategories = async (userId, limit = 5) => {
  if (limit <= 0) throw new Error("Limit must be a positive number");
  const top = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type: "expense" } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
    { $limit: limit },
  ]);
  return top;
};

export const getCashFlow = async (userId) => {
  const cashFlow = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { month: { $month: "$date" }, year: { $year: "$date" }, type: "$type" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  return cashFlow;
};

export const getSavingsHistory = async (userId) => {
  const history = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), savingsGoalId: { $ne: null } } },
    { $group: { _id: { month: { $month: "$date" }, year: { $year: "$date" } }, total: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);
  return history;
};

// Advanced Filtering & Export
export const searchTransactions = async (userId, { query, type, category, startDate, endDate } = {}) => {
  const filters = { userId: new mongoose.Types.ObjectId(userId) };
  if (type) filters.type = type;
  if (category) filters.category = category;
  if (startDate || endDate) filters.date = {};
  if (startDate) filters.date.$gte = new Date(startDate);
  if (endDate) filters.date.$lte = new Date(endDate);
  if (query) {
    filters.$or = [
      { description: new RegExp(query, "i") },
      { tags: new RegExp(query, "i") },
    ];
  }
  return await Transaction.find(filters).sort({ date: -1 });
};

export const exportTransactions = async (userId) => {
  const transactions = await Transaction.find({ userId });
  return transactions.map(t => t.toObject()); // Ensure plain JS objects for CSV
};

export const exportBudgets = async (userId) => {
  const budgets = await Budget.find({ userId });
  return budgets.map(b => b.toObject());
};