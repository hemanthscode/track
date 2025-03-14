import mongoose from "mongoose";
import Transaction from "../../models/Transaction.js";
import Budget from "../../models/Budget.js";
import { startOfMonth, endOfMonth, isBefore, startOfYear, endOfYear } from "date-fns";

// Constants
const MONTHS = Object.freeze([
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]);
const DEFAULT_TRENDS_PERIOD = "monthly";
const DEFAULT_TOP_CATEGORIES_LIMIT = 5;

// Utility Functions
const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const formatDate = (date) => date.toISOString().split("T")[0];
const validateDateRange = (start, end) => {
  if (!(start instanceof Date) || !(end instanceof Date) || isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    throw new Error("Invalid date range: Start must be a valid date before end");
  }
};

// Base Queries
const baseUserMatch = (userId) => ({ $match: { userId: toObjectId(userId) } });
const baseUserQuery = (userId) => ({ userId: toObjectId(userId) });

// Aggregation Helpers
const groupByType = () => ({ $group: { _id: "$type", total: { $sum: "$amount" } } });
const projectSummary = (fields = {}) => ({ $project: { _id: 0, ...fields } });

export const getDashboardSummary = async (userId) => {
  try {
    const userObjectId = toObjectId(userId);
    const [transactions, savingsGoals] = await Promise.all([
      Transaction.aggregate([{ $match: { userId: userObjectId } }, groupByType()]),
      Budget.find({ userId: userObjectId, type: "savings" }).select("progress").lean()
    ]);

    const income = transactions.find(t => t._id === "income")?.total || 0;
    const expenses = transactions.find(t => t._id === "expense")?.total || 0;

    return {
      balance: income - expenses,
      income,
      expenses,
      totalSavings: savingsGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0)
    };
  } catch (error) {
    throw new Error(`Failed to fetch dashboard summary: ${error.message}`);
  }
};

export const getTrends = async (userId, period = DEFAULT_TRENDS_PERIOD) => {
  try {
    const groupFields = period === "monthly"
      ? { month: { $month: "$date" }, year: { $year: "$date" } }
      : { year: { $year: "$date" } };

    return await Transaction.aggregate([
      baseUserMatch(userId),
      {
        $group: {
          _id: groupFields,
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: period === "monthly" ? { "_id.year": 1, "_id.month": 1 } : { "_id.year": 1 } },
      projectSummary({
        year: "$_id.year",
        ...(period === "monthly" && { month: { $arrayElemAt: [MONTHS, { $subtract: ["$_id.month", 1] }] } }),
        income: 1,
        expenses: 1,
        savings: { $subtract: ["$income", "$expenses"] }
      })
    ]);
  } catch (error) {
    throw new Error(`Failed to fetch financial trends: ${error.message}`);
  }
};

export const getCategoryInsights = async (userId) => {
  try {
    const insights = await Transaction.aggregate([
      baseUserMatch(userId),
      { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } }
    ]);

    const result = { income: [], expenses: [], summary: { totalIncome: 0, totalExpenses: 0, net: 0 } };
    insights.forEach(({ _id: { type, category }, total }) => {
      const entry = { category, total };
      if (type === "income") {
        result.income.push(entry);
        result.summary.totalIncome += total;
      } else if (type === "expense") {
        result.expenses.push(entry);
        result.summary.totalExpenses += total;
      }
    });
    result.summary.net = result.summary.totalIncome - result.summary.totalExpenses;

    return result;
  } catch (error) {
    throw new Error(`Failed to fetch category insights: ${error.message}`);
  }
};

export const getSavingsProgress = async (userId) => {
  try {
    const savings = await Budget.find({ userId: toObjectId(userId), type: "savings" })
      .select("amount progress startDate endDate description period")
      .lean();

    return savings.map(goal => {
      const progress = goal.progress || 0;
      return {
        id: goal._id.toString(),
        amount: goal.amount,
        progress,
        remaining: goal.amount - progress,
        progressPercentage: Math.round((progress / goal.amount) * 100),
        startDate: formatDate(goal.startDate),
        endDate: formatDate(goal.endDate),
        isExpired: goal.endDate && isBefore(new Date(goal.endDate), new Date()),
        description: goal.description || "",
        period: goal.period
      };
    });
  } catch (error) {
    throw new Error(`Failed to fetch savings progress: ${error.message}`);
  }
};

export const getBudgetStatus = async (userId) => {
  try {
    const userObjectId = toObjectId(userId);
    return await Budget.aggregate([
      { $match: { userId: userObjectId, type: "budget" } },
      {
        $lookup: {
          from: "transactions",
          let: { category: "$category", start: "$startDate", end: "$endDate" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", userObjectId] },
                    { $eq: ["$type", "expense"] },
                    { $eq: ["$category", "$$category"] },
                    { $gte: ["$date", "$$start"] },
                    { $lte: ["$date", { $ifNull: ["$$end", new Date()] }] }
                  ]
                }
              }
            },
            { $group: { _id: null, totalSpent: { $sum: "$amount" } } }
          ],
          as: "transactions"
        }
      },
      projectSummary({
        category: 1,
        amount: 1,
        period: 1,
        startDate: 1,
        endDate: 1,
        description: 1,
        spent: { $ifNull: [{ $arrayElemAt: ["$transactions.totalSpent", 0] }, 0] },
        remaining: { $subtract: ["$amount", { $ifNull: [{ $arrayElemAt: ["$transactions.totalSpent", 0] }, 0] }] },
        progressPercentage: {
          $multiply: [
            { $divide: [{ $ifNull: [{ $arrayElemAt: ["$transactions.totalSpent", 0] }, 0] }, "$amount"] },
            100
          ]
        },
        isExpired: { $cond: [{ $lt: ["$endDate", new Date()] }, true, false] }
      }),
      { $sort: { startDate: -1 } }
    ]);
  } catch (error) {
    throw new Error(`Failed to fetch budget status: ${error.message}`);
  }
};

export const getUpcomingTransactions = async (userId) => {
  try {
    const now = new Date();
    return await Transaction.find({
      userId: toObjectId(userId),
      isRecurring: true,
      "recurringDetails.nextOccurrence": { $gte: now },
      $or: [
        { "recurringDetails.endDate": null },
        { "recurringDetails.endDate": { $gte: now } }
      ]
    })
      .select("type amount category description recurringDetails")
      .sort({ "recurringDetails.nextOccurrence": 1 })
      .lean()
      .then(transactions => transactions.map(t => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description || "No description",
        nextOccurrence: t.recurringDetails.nextOccurrence,
        frequency: t.recurringDetails.frequency,
        endDate: t.recurringDetails.endDate
      })));
  } catch (error) {
    throw new Error(`Failed to fetch upcoming transactions: ${error.message}`);
  }
};

export const getMonthlyReport = async (userId, month = new Date()) => {
  try {
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const [result] = await Transaction.aggregate([
      baseUserMatch(userId),
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $facet: {
          byType: [groupByType()],
          byCategory: [
            { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } },
            { $group: { _id: "$_id.type", categories: { $push: { category: "$_id.category", total: "$total" } } } }
          ],
          transactions: [
            { $project: { id: "$_id", type: 1, amount: 1, category: 1, description: 1, date: 1, savingsGoalId: 1, _id: 0 } }
          ]
        }
      }
    ]);

    const summary = {
      income: result.byType.find(t => t._id === "income")?.total || 0,
      expense: result.byType.find(t => t._id === "expense")?.total || 0,
      net: 0
    };
    summary.net = summary.income - summary.expense;

    return {
      month: month.toISOString().slice(0, 7),
      summary,
      categories: {
        income: result.byCategory.find(c => c._id === "income")?.categories || [],
        expense: result.byCategory.find(c => c._id === "expense")?.categories || []
      },
      transactions: result.transactions
    };
  } catch (error) {
    throw new Error(`Failed to fetch monthly report: ${error.message}`);
  }
};

export const getYearlyReport = async (userId, year = new Date().getFullYear()) => {
  try {
    const reportYear = Number(year);
    if (!Number.isInteger(reportYear) || reportYear < 1970 || reportYear > 9999) {
      throw new Error("Invalid year: Must be a valid 4-digit year");
    }

    const start = startOfYear(new Date(reportYear, 0, 1));
    const end = endOfYear(new Date(reportYear, 0, 1));

    const report = await Transaction.aggregate([
      baseUserMatch(userId),
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: { month: { $month: "$date" }, type: "$type" }, total: { $sum: "$amount" } } },
      { $sort: { "_id.month": 1 } }
    ]);

    const monthlyReport = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const income = report.find(r => r._id.month === month && r._id.type === "income")?.total || 0;
      const expenses = report.find(r => r._id.month === month && r._id.type === "expense")?.total || 0;
      return income || expenses ? { month, income, expenses, net: income - expenses } : null;
    }).filter(Boolean);

    return monthlyReport;
  } catch (error) {
    throw new Error(`Failed to fetch yearly report: ${error.message}`);
  }
};

export const getComparisonReport = async (userId, startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    validateDateRange(start, end);

    const results = await Transaction.aggregate([
      baseUserMatch(userId),
      { $match: { date: { $gte: start, $lte: end } } },
      groupByType()
    ]);

    const summary = {
      income: results.find(r => r._id === "income")?.total || 0,
      expense: results.find(r => r._id === "expense")?.total || 0,
      net: 0
    };
    summary.net = summary.income - summary.expense;

    return { period: { start: startDate, end: endDate }, summary };
  } catch (error) {
    throw new Error(`Failed to fetch comparison report: ${error.message}`);
  }
};

export const getTopCategories = async ({ userId, startDate, endDate, limit = DEFAULT_TOP_CATEGORIES_LIMIT }) => {
  try {
    if (!Number.isInteger(limit) || limit <= 0) throw new Error("Limit must be a positive integer");

    const matchCriteria = { userId: toObjectId(userId), type: "expense" };
    if (startDate || endDate) {
      matchCriteria.date = {};
      if (startDate) matchCriteria.date.$gte = new Date(startDate);
      if (endDate) matchCriteria.date.$lte = new Date(endDate);
    }

    return await Transaction.aggregate([
      { $match: matchCriteria },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: limit },
      projectSummary({ category: "$_id", total: 1 })
    ]);
  } catch (error) {
    throw new Error(`Failed to fetch top categories: ${error.message}`);
  }
};

export const getCashFlow = async (userId) => {
  try {
    const rawData = await Transaction.aggregate([
      baseUserMatch(userId),
      { $group: { _id: { month: { $month: "$date" }, year: { $year: "$date" }, type: "$type" }, total: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const periods = [];
    const totals = { income: 0, expenses: 0, net: 0 };
    const periodMap = new Map();

    rawData.forEach(({ _id, total }) => {
      const key = `${_id.year}-${_id.month}`;
      let period = periodMap.get(key);
      if (!period) {
        period = { month: _id.month, year: _id.year, income: 0, expenses: 0 };
        periodMap.set(key, period);
        periods.push(period);
      }
      if (_id.type === "income") {
        period.income = total;
        totals.income += total;
      } else if (_id.type === "expense") {
        period.expenses = total;
        totals.expenses += total;
      }
    });

    periods.forEach(p => p.net = p.income - p.expenses);
    totals.net = totals.income - totals.expenses;

    return { periods, totals };
  } catch (error) {
    throw new Error(`Failed to fetch cash flow: ${error.message}`);
  }
};

export const getSavingsHistory = async (userId) => {
  try {
    return await Transaction.aggregate([
      baseUserMatch(userId),
      { $match: { savingsGoalId: { $ne: null } } },
      { $group: { _id: { month: { $month: "$date" }, year: { $year: "$date" } }, total: { $sum: "$amount" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      projectSummary({ month: "$_id.month", year: "$_id.year", total: 1 })
    ]);
  } catch (error) {
    throw new Error(`Failed to fetch savings history: ${error.message}`);
  }
};

export const searchTransactions = async (userId, filters = {}) => {
  try {
    const query = baseUserQuery(userId);
    if (filters.type) query.type = filters.type;
    if (filters.category) query.category = filters.category;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }
    if (filters.query) {
      query.$or = [
        { description: { $regex: filters.query, $options: "i" } },
        { tags: { $regex: filters.query, $options: "i" } }
      ];
    }

    return await Transaction.find(query)
      .select("type amount category description date isRecurring recurringDetails tags createdAt")
      .sort({ date: -1 })
      .lean()
      .then(transactions => transactions.map(t => ({
        id: t._id.toString(),
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description || null,
        date: t.date,
        isRecurring: t.isRecurring,
        ...(t.isRecurring && {
          recurring: {
            frequency: t.recurringDetails.frequency,
            nextOccurrence: t.recurringDetails.nextOccurrence,
            endDate: t.recurringDetails.endDate
          }
        }),
        tags: t.tags?.length ? t.tags : undefined,
        createdAt: t.createdAt
      })));
  } catch (error) {
    throw new Error(`Failed to search transactions: ${error.message}`);
  }
};

export const exportTransactions = async (userId) => {
  try {
    return await Transaction.find({ userId: toObjectId(userId) })
      .select("type amount category date description")
      .lean()
      .then(transactions => transactions.map(t => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: formatDate(t.date),
        description: t.description || "N/A"
      })));
  } catch (error) {
    throw new Error(`Failed to export transactions: ${error.message}`);
  }
};

export const exportBudgets = async (userId) => {
  try {
    return await Budget.find({ userId: toObjectId(userId) })
      .select("type category amount period progress")
      .lean()
      .then(budgets => budgets.map(b => ({
        type: b.type,
        category: b.category || "",
        amount: b.amount,
        period: b.period,
        progress: b.progress
      })));
  } catch (error) {
    throw new Error(`Failed to export budgets: ${error.message}`);
  }
};