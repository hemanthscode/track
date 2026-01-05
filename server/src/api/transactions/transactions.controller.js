import * as transactionsService from "./transactions.service.js";
import { sendSuccess, sendPaginatedResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   POST /api/transactions
 * @desc    Create new transaction
 * @access  Private
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionsService.createTransaction(
    req.user._id,
    req.body
  );

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    { transaction },
    `${transaction.type === "income" ? "Income" : "Expense"} of ₹${transaction.amount} recorded`
  );
});

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with filters
 * @access  Private
 */
export const getAllTransactions = asyncHandler(async (req, res) => {
  const { transactions, total, page, limit } =
    await transactionsService.getAllTransactions(req.user._id, req.query);

  sendPaginatedResponse(
    res,
    { transactions },
    page,
    limit,
    total,
    `Retrieved ${transactions.length} transactions`
  );
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
export const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await transactionsService.getTransactionById(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transaction },
    "Transaction retrieved successfully"
  );
});

/**
 * @route   PUT /api/transactions/:id
 * @desc    Update transaction
 * @access  Private
 */
export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionsService.updateTransaction(
    req.user._id,
    req.params.id,
    req.body
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transaction },
    "Transaction updated successfully"
  );
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete transaction
 * @access  Private
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
  await transactionsService.deleteTransaction(req.user._id, req.params.id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "Transaction deleted successfully"
  );
});

/**
 * @route   GET /api/transactions/search
 * @desc    Search transactions
 * @access  Private
 */
export const searchTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionsService.searchTransactions(
    req.user._id,
    req.query
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transactions, count: transactions.length },
    `Found ${transactions.length} matching transactions`
  );
});

export default {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  searchTransactions,
};
