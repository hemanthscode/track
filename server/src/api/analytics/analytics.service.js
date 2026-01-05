import { Transaction, Budget } from "../../models/index.js";
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subYears,
  format,
} from "date-fns";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Get financial overview
 */
export const getOverview = async (userId, filters = {}) => {
  try {
    const { startDate, endDate } = filters;

    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    const query = { userId };
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    // Aggregate income and expenses
    const summary = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
        },
      },
    ]);

    const income = summary.find((s) => s._id === "income") || {
      total: 0,
      count: 0,
      average: 0,
    };
    const expenses = summary.find((s) => s._id === "expense") || {
      total: 0,
      count: 0,
      average: 0,
    };

    const balance = income.total - expenses.total;
    const savingsRate =
      income.total > 0 ? ((balance / income.total) * 100).toFixed(2) : 0;

    // Get top spending categories
    const topCategories = await Transaction.aggregate([
      { $match: { ...query, type: "expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]);

    return {
      income: {
        total: income.total,
        count: income.count,
        average: Math.round(income.average),
      },
      expenses: {
        total: expenses.total,
        count: expenses.count,
        average: Math.round(expenses.average),
      },
      balance,
      savingsRate: parseFloat(savingsRate),
      topCategories: topCategories.map((cat) => ({
        category: cat._id,
        amount: cat.total,
        count: cat.count,
        percentage: ((cat.total / expenses.total) * 100).toFixed(2),
      })),
    };
  } catch (error) {
    logger.error("Failed to get overview", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get category breakdown
 */
export const getCategoryBreakdown = async (userId, filters = {}) => {
  try {
    const { type = "expense", startDate, endDate } = filters;

    const query = { userId, type };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const breakdown = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          average: { $avg: "$amount" },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalAmount = breakdown.reduce((sum, cat) => sum + cat.total, 0);

    return breakdown.map((cat) => ({
      category: cat._id,
      amount: cat.total,
      count: cat.count,
      average: Math.round(cat.average),
      percentage: totalAmount > 0 ? ((cat.total / totalAmount) * 100).toFixed(2) : 0,
    }));
  } catch (error) {
    logger.error("Failed to get category breakdown", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get spending trends over time
 */
export const getTrends = async (userId, filters = {}) => {
  try {
    const { period = "monthly", type, startDate, endDate } = filters;

    const query = { userId };
    if (type) query.type = type;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Group format based on period
    const groupFormats = {
      daily: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      weekly: {
        $dateToString: { format: "%Y-W%U", date: "$date" },
      },
      monthly: { $dateToString: { format: "%Y-%m", date: "$date" } },
      yearly: { $dateToString: { format: "%Y", date: "$date" } },
    };

    const trends = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupFormats[period],
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expenses: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return trends.map((trend) => ({
      period: trend._id,
      income: trend.income,
      expenses: trend.expenses,
      balance: trend.income - trend.expenses,
      count: trend.count,
    }));
  } catch (error) {
    logger.error("Failed to get trends", { userId, error: error.message });
    throw error;
  }
};

/**
 * Compare current period with previous period
 */
export const getComparisons = async (userId, period = "month") => {
  try {
    const now = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;

    if (period === "week") {
      currentStart = startOfDay(subWeeks(now, 1));
      currentEnd = endOfDay(now);
      previousStart = startOfDay(subWeeks(currentStart, 1));
      previousEnd = endOfDay(currentStart);
    } else if (period === "month") {
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      previousStart = startOfMonth(subMonths(now, 1));
      previousEnd = endOfMonth(subMonths(now, 1));
    } else if (period === "year") {
      currentStart = startOfYear(now);
      currentEnd = endOfYear(now);
      previousStart = startOfYear(subYears(now, 1));
      previousEnd = endOfYear(subYears(now, 1));
    }

    // Get current period data
    const currentData = await getOverview(userId, {
      startDate: currentStart,
      endDate: currentEnd,
    });

    // Get previous period data
    const previousData = await getOverview(userId, {
      startDate: previousStart,
      endDate: previousEnd,
    });

    // Calculate changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(2);
    };

    return {
      current: {
        period: `${format(currentStart, "MMM dd, yyyy")} - ${format(
          currentEnd,
          "MMM dd, yyyy"
        )}`,
        ...currentData,
      },
      previous: {
        period: `${format(previousStart, "MMM dd, yyyy")} - ${format(
          previousEnd,
          "MMM dd, yyyy"
        )}`,
        ...previousData,
      },
      changes: {
        income: parseFloat(
          calculateChange(currentData.income.total, previousData.income.total)
        ),
        expenses: parseFloat(
          calculateChange(currentData.expenses.total, previousData.expenses.total)
        ),
        balance: parseFloat(
          calculateChange(currentData.balance, previousData.balance)
        ),
        savingsRate: parseFloat(
          calculateChange(currentData.savingsRate, previousData.savingsRate)
        ),
      },
    };
  } catch (error) {
    logger.error("Failed to get comparisons", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get monthly summary
 */
export const getMonthlySummary = async (userId, year, month) => {
  try {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = endOfMonth(startDate);

    // Get overview
    const overview = await getOverview(userId, {
      startDate,
      endDate,
    });

    // Get budget vs actual
    const budgets = await Budget.find({
      userId,
      type: "budget",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    }).lean();

    const budgetComparison = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await Transaction.aggregate([
          {
            $match: {
              userId,
              type: "expense",
              category: budget.category,
              date: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const actualSpent = spent[0]?.total || 0;

        return {
          category: budget.category,
          budgeted: budget.amount,
          spent: actualSpent,
          remaining: budget.amount - actualSpent,
          percentage: ((actualSpent / budget.amount) * 100).toFixed(2),
        };
      })
    );

    // Get daily spending
    const dailySpending = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      month: format(startDate, "MMMM yyyy"),
      overview,
      budgetComparison,
      dailySpending: dailySpending.map((d) => ({
        day: d._id,
        amount: d.total,
      })),
    };
  } catch (error) {
    logger.error("Failed to get monthly summary", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get statistics
 */
export const getStatistics = async (userId) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = subMonths(now, 1);

    const transactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    });

    if (transactions.length === 0) {
      return {
        averageDailySpending: 0,
        largestExpense: null,
        largestIncome: null,
        mostFrequentCategory: null,
        transactionCount: 0,
      };
    }

    // Average daily spending
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const averageDailySpending = Math.round(totalExpenses / 30);

    // Largest expense and income
    const expenses = transactions.filter((t) => t.type === "expense");
    const incomes = transactions.filter((t) => t.type === "income");

    const largestExpense = expenses.length
      ? expenses.reduce((max, t) => (t.amount > max.amount ? t : max))
      : null;
    const largestIncome = incomes.length
      ? incomes.reduce((max, t) => (t.amount > max.amount ? t : max))
      : null;

    // Most frequent category
    const categoryCount = {};
    transactions.forEach((t) => {
      categoryCount[t.category] = (categoryCount[t.category] || 0) + 1;
    });

    const mostFrequentCategory = Object.keys(categoryCount).reduce((a, b) =>
      categoryCount[a] > categoryCount[b] ? a : b
    );

    return {
      averageDailySpending,
      largestExpense: largestExpense
        ? {
            amount: largestExpense.amount,
            description: largestExpense.description,
            date: largestExpense.date,
            category: largestExpense.category,
          }
        : null,
      largestIncome: largestIncome
        ? {
            amount: largestIncome.amount,
            description: largestIncome.description,
            date: largestIncome.date,
            category: largestIncome.category,
          }
        : null,
      mostFrequentCategory,
      transactionCount: transactions.length,
    };
  } catch (error) {
    logger.error("Failed to get statistics", { userId, error: error.message });
    throw error;
  }
};

export default {
  getOverview,
  getCategoryBreakdown,
  getTrends,
  getComparisons,
  getMonthlySummary,
  getStatistics,
};
