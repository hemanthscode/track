import * as transactionService from "../services/transactionService.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { parse } from "json2csv";

// Transaction CRUD
export const createTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.createTransaction(req.user._id, req.body);
    sendSuccess(res, 201, transaction, `Transaction '${transaction._id}' (${transaction.type}) created`);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllTransactions(req.user._id, req.query);
    sendSuccess(res, 200, transactions, `${transactions.length} transactions retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve transactions: ${error.message}`);
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.user._id, req.params.id);
    if (!transaction) return sendError(res, 404, `Transaction with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, transaction, `Transaction '${transaction._id}' retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve transaction '${req.params.id}': ${error.message}`);
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(req.user._id, req.params.id, req.body);
    if (!transaction) return sendError(res, 404, `Transaction with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, transaction, `Transaction '${transaction._id}' updated`);
  } catch (error) {
    sendError(res, error.message.includes("not found") ? 404 : 400, error.message);
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.deleteTransaction(req.user._id, req.params.id);
    if (!transaction) return sendError(res, 404, `Transaction with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, null, `Transaction '${req.params.id}' deleted`);
  } catch (error) {
    sendError(res, 500, `Failed to delete transaction '${req.params.id}': ${error.message}`);
  }
};

// Recurring Transactions
export const createRecurringTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.createRecurringTransaction(req.user._id, req.body);
    sendSuccess(res, 201, transaction, `Recurring transaction '${transaction._id}' (${transaction.type}) created`);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const getAllRecurringTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getAllRecurringTransactions(req.user._id);
    sendSuccess(res, 200, transactions, `${transactions.length} recurring transactions retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve recurring transactions: ${error.message}`);
  }
};

export const updateRecurringTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateRecurringTransaction(req.user._id, req.params.id, req.body);
    if (!transaction) return sendError(res, 404, `Recurring transaction with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, transaction, `Recurring transaction '${transaction._id}' updated`);
  } catch (error) {
    sendError(res, error.message.includes("not found") ? 404 : 400, error.message);
  }
};

export const cancelRecurringTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.cancelRecurringTransaction(req.user._id, req.params.id);
    if (!transaction) return sendError(res, 404, `Recurring transaction with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, transaction, `Recurring transaction '${transaction._id}' canceled`);
  } catch (error) {
    sendError(res, 500, `Failed to cancel recurring transaction '${req.params.id}': ${error.message}`);
  }
};

// Budgets & Savings
export const createBudget = async (req, res) => {
  try {
    const budget = await transactionService.createBudget(req.user._id, req.body);
    sendSuccess(res, 201, budget, `${budget.type === "budget" ? "Budget" : "Savings goal"} '${budget._id}' created${budget.category ? ` for '${budget.category}'` : ""}`);
  } catch (error) {
    sendError(res, 400, error.message);
  }
};

export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await transactionService.getAllBudgets(req.user._id);
    sendSuccess(res, 200, budgets, `${budgets.length} budgets and savings goals retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve budgets: ${error.message}`);
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await transactionService.getBudgetById(req.user._id, req.params.id);
    if (!budget) return sendError(res, 404, `Budget or savings goal with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, budget, `${budget.type === "budget" ? "Budget" : "Savings goal"} '${budget._id}' retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve budget '${req.params.id}': ${error.message}`);
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await transactionService.updateBudget(req.user._id, req.params.id, req.body);
    if (!budget) return sendError(res, 404, `Budget or savings goal with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, budget, `${budget.type === "budget" ? "Budget" : "Savings goal"} '${budget._id}' updated`);
  } catch (error) {
    sendError(res, error.message.includes("not found") ? 404 : 400, error.message);
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await transactionService.deleteBudget(req.user._id, req.params.id);
    if (!budget) return sendError(res, 404, `Budget or savings goal with ID '${req.params.id}' not found`);
    sendSuccess(res, 200, null, `${budget.type === "budget" ? "Budget" : "Savings goal"} '${req.params.id}' deleted`);
  } catch (error) {
    sendError(res, 500, `Failed to delete budget '${req.params.id}': ${error.message}`);
  }
};

// Dashboard Insights
export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await transactionService.getDashboardSummary(req.user._id);
    sendSuccess(res, 200, summary, `Dashboard summary retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve dashboard summary: ${error.message}`);
  }
};

export const getTrends = async (req, res) => {
  try {
    const { period } = req.query;
    const trends = await transactionService.getTrends(req.user._id, period);
    sendSuccess(res, 200, trends, `Trends for '${period || "default"}' period retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve trends: ${error.message}`);
  }
};

export const getCategoryInsights = async (req, res) => {
  try {
    const insights = await transactionService.getCategoryInsights(req.user._id);
    sendSuccess(res, 200, insights, `Category insights retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve category insights: ${error.message}`);
  }
};

export const getSavingsProgress = async (req, res) => {
  try {
    const progress = await transactionService.getSavingsProgress(req.user._id);
    sendSuccess(res, 200, progress, `Savings progress retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve savings progress: ${error.message}`);
  }
};

export const getBudgetStatus = async (req, res) => {
  try {
    const status = await transactionService.getBudgetStatus(req.user._id);
    sendSuccess(res, 200, status, `Budget status retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve budget status: ${error.message}`);
  }
};

export const getUpcomingTransactions = async (req, res) => {
  try {
    const upcoming = await transactionService.getUpcomingTransactions(req.user._id);
    sendSuccess(res, 200, upcoming, `${upcoming.length} upcoming transactions retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve upcoming transactions: ${error.message}`);
  }
};

// Reports & Analytics
export const getMonthlyReport = async (req, res) => {
  try {
    const { month } = req.query; // "YYYY-MM"
    const date = month ? new Date(month) : new Date();
    const report = await transactionService.getMonthlyReport(req.user._id, date);
    sendSuccess(res, 200, report, `Monthly report for '${date.toISOString().slice(0, 7)}' retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve monthly report: ${error.message}`);
  }
};

export const getYearlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const reportYear = year ? parseInt(year) : new Date().getFullYear();
    const report = await transactionService.getYearlyReport(req.user._id, reportYear);
    sendSuccess(res, 200, report, `Yearly report for '${reportYear}' retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve yearly report: ${error.message}`);
  }
};

export const getComparisonReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await transactionService.getComparisonReport(req.user._id, startDate, endDate);
    sendSuccess(res, 200, report, `Comparison report from '${startDate}' to '${endDate}' retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve comparison report: ${error.message}`);
  }
};

export const getTopCategories = async (req, res) => {
  try {
    const { limit } = req.query;
    const top = await transactionService.getTopCategories(req.user._id, parseInt(limit) || 5);
    sendSuccess(res, 200, top, `Top ${top.length} categories retrieved`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve top categories: ${error.message}`);
  }
};

export const getCashFlow = async (req, res) => {
  try {
    const cashFlow = await transactionService.getCashFlow(req.user._id);
    sendSuccess(res, 200, cashFlow, `Cash flow retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve cash flow: ${error.message}`);
  }
};

export const getSavingsHistory = async (req, res) => {
  try {
    const history = await transactionService.getSavingsHistory(req.user._id);
    sendSuccess(res, 200, history, `Savings history retrieved for user '${req.user.username}'`);
  } catch (error) {
    sendError(res, 500, `Failed to retrieve savings history: ${error.message}`);
  }
};

// Advanced Filtering & Export
export const searchTransactions = async (req, res) => {
  try {
    const filters = req.query;
    const transactions = await transactionService.searchTransactions(req.user._id, filters);
    sendSuccess(res, 200, transactions, `${transactions.length} transactions found with applied filters`);
  } catch (error) {
    sendError(res, 500, `Failed to search transactions: ${error.message}`);
  }
};

export const exportTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.exportTransactions(req.user._id);
    if (!transactions.length) return sendError(res, 404, "No transactions available to export");
    const csv = parse(transactions, {
      fields: ["type", "amount", "category", "date", "description"],
    });
    res.header("Content-Type", "text/csv");
    res.attachment(`transactions_${req.user.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    sendError(res, 500, `Failed to export transactions: ${error.message}`);
  }
};

export const exportBudgets = async (req, res) => {
  try {
    const budgets = await transactionService.exportBudgets(req.user._id);
    if (!budgets.length) return sendError(res, 404, "No budgets or savings goals available to export");
    const csv = parse(budgets, {
      fields: ["type", "category", "amount", "period", "progress"],
    });
    res.header("Content-Type", "text/csv");
    res.attachment(`budgets_${req.user.username}_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(csv);
  } catch (error) {
    sendError(res, 500, `Failed to export budgets: ${error.message}`);
  }
};