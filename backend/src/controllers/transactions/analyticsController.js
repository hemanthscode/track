import * as AnalyticsService from "../../services/transactions/analyticsService.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { parse } from "json2csv";
import { isValid } from "date-fns";

// Constants
const DEFAULT_CURRENCY = "INR";
const DEFAULT_TOP_CATEGORIES_LIMIT = 3;

// Helper Functions
const validateDateRange = (start, end) => {
  if (start && end && start > end) throw new Error("Start date must be before end date");
};

const handleApiError = (res, error, defaultMessage, status = 500) => {
  console.error(`${defaultMessage}:`, error);
  sendError(res, status, `${defaultMessage}: ${error.message || "Internal server error"}`);
};

const handleSuccess = (res, data, message, status = 200) => {
  sendSuccess(res, status, data, message);
};

export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await AnalyticsService.getDashboardSummary(req.user._id);
    const message = summary.income || summary.expenses 
      ? `Here's your financial summary, ${req.user.username}`
      : `No transactions recorded yet for ${req.user.username}`;
    handleSuccess(res, summary, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch dashboard summary");
  }
};

export const getTrends = async (req, res) => {
  try {
    const { period = "monthly" } = req.query;
    const trends = await AnalyticsService.getTrends(req.user._id, period);
    const summary = {
      totalIncome: trends.reduce((sum, t) => sum + t.income, 0),
      totalExpenses: trends.reduce((sum, t) => sum + t.expenses, 0),
      totalSavings: 0,
      currency: DEFAULT_CURRENCY,
      periodsCovered: trends.length
    };
    summary.totalSavings = summary.totalIncome - summary.totalExpenses;

    const message = trends.length 
      ? `Your ${period} financial trends are ready`
      : `No ${period} trends available yet`;
    handleSuccess(res, { trends, summary }, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch financial trends");
  }
};

export const getCategoryInsights = async (req, res) => {
  try {
    const insights = await AnalyticsService.getCategoryInsights(req.user._id);
    const message = insights.income.length || insights.expenses.length
      ? `Here are your category insights, ${req.user.username}`
      : `No category insights available yet for ${req.user.username}`;
    handleSuccess(res, insights, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch category insights");
  }
};

export const getSavingsProgress = async (req, res) => {
  try {
    const progress = await AnalyticsService.getSavingsProgress(req.user._id);
    const message = progress.length 
      ? `Your savings goals progress is updated`
      : `No savings goals set yet`;
    handleSuccess(res, progress, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch savings progress");
  }
};

export const getBudgetStatus = async (req, res) => {
  try {
    if (!req.user?._id) throw new Error("User not authenticated");
    const budgetStatus = await AnalyticsService.getBudgetStatus(req.user._id);
    const message = budgetStatus.length 
      ? `Your budget status is ready, ${req.user.username}`
      : `No active budgets found for ${req.user.username}`;
    handleSuccess(res, budgetStatus, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch budget status", error.message.includes("authenticated") ? 401 : 500);
  }
};

export const getUpcomingTransactions = async (req, res) => {
  try {
    const transactions = await AnalyticsService.getUpcomingTransactions(req.user._id);
    const message = transactions.length 
      ? `You have ${transactions.length} upcoming transaction${transactions.length > 1 ? 's' : ''}`
      : `No upcoming transactions scheduled`;
    handleSuccess(res, transactions, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch upcoming transactions");
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query;
    const date = month ? new Date(month) : new Date();
    if (!isValid(date) || isNaN(date.getTime())) throw new Error("Invalid month format. Use YYYY-MM.");

    const report = await AnalyticsService.getMonthlyReport(req.user._id, date);
    const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
    const message = report.summary.income || report.summary.expense 
      ? `Your ${monthName} report is ready`
      : `No transactions found for ${monthName}`;
    handleSuccess(res, report, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch monthly report", error.message.includes("format") ? 400 : 500);
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const reportYear = year || new Date().getFullYear();
    const report = await AnalyticsService.getYearlyReport(req.user._id, reportYear);
    const message = report.length 
      ? `Your ${reportYear} yearly report is ready`
      : `No transactions recorded for ${reportYear}`;
    handleSuccess(res, { year: reportYear, months: report }, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch yearly report", error.message.includes("Invalid year") ? 400 : 500);
  }
};

export const getComparisonReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) throw new Error("Start date and end date are required");

    const report = await AnalyticsService.getComparisonReport(req.user._id, startDate, endDate);
    const message = report.summary.income || report.summary.expense
      ? `Comparison report from ${startDate} to ${endDate} is ready`
      : `No transactions found between ${startDate} and ${endDate}`;
    handleSuccess(res, report, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch comparison report", error.message.includes("required") ? 400 : 500);
  }
};

export const getTopCategories = async (req, res) => {
  try {
    const { startDate, endDate, limit = DEFAULT_TOP_CATEGORIES_LIMIT } = req.query;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    validateDateRange(start, end);

    const topCategories = await AnalyticsService.getTopCategories({
      userId: req.user._id,
      startDate: start,
      endDate: end,
      limit: parseInt(limit)
    });
    const message = topCategories.length 
      ? `Here are your top ${topCategories.length} spending categories`
      : `No spending categories found`;
    handleSuccess(res, { categories: topCategories }, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch top categories", error.message.includes("date") ? 400 : 500);
  }
};

export const getCashFlow = async (req, res) => {
  try {
    const cashFlow = await AnalyticsService.getCashFlow(req.user._id);
    const message = cashFlow.periods.length 
      ? `Your cash flow overview is ready`
      : `No cash flow data available yet`;
    handleSuccess(res, cashFlow, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch cash flow");
  }
};

export const getSavingsHistory = async (req, res) => {
  try {
    const history = await AnalyticsService.getSavingsHistory(req.user._id);
    const message = history.length 
      ? `Your savings history is ready, ${req.user.username}`
      : `No savings history recorded yet for ${req.user.username}`;
    handleSuccess(res, history, message);
  } catch (error) {
    handleApiError(res, error, "Failed to fetch savings history");
  }
};

export const searchTransactions = async (req, res) => {
  try {
    const transactions = await AnalyticsService.searchTransactions(req.user._id, req.query);
    const message = transactions.length 
      ? `Found ${transactions.length} matching transaction${transactions.length > 1 ? 's' : ''}`
      : `No transactions match your search`;
    handleSuccess(res, transactions, message);
  } catch (error) {
    handleApiError(res, error, "Failed to search transactions");
  }
};

export const exportTransactions = async (req, res) => {
  try {
    const transactions = await AnalyticsService.exportTransactions(req.user._id);
    if (!transactions.length) {
      return handleSuccess(res, [], "No transactions available to export");
    }

    const csvFields = ["type", "amount", "category", "date", "description"];
    const csv = parse(transactions, { fields: csvFields });
    const filename = `transactions_${req.user.username}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    handleApiError(res, error, "Failed to export transactions");
  }
};

export const exportBudgets = async (req, res) => {
  try {
    const budgets = await AnalyticsService.exportBudgets(req.user._id);
    if (!budgets.length) {
      return handleSuccess(res, [], "No budgets or savings goals available to export");
    }

    const csvFields = ["type", "category", "amount", "period", "progress"];
    const csv = parse(budgets, { fields: csvFields });
    const filename = `budgets_${req.user.username}_${new Date().toISOString().slice(0, 10)}.csv`;

    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    handleApiError(res, error, "Failed to export budgets");
  }
};