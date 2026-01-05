import * as recurringService from "./recurring.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   POST /api/recurring
 * @desc    Create recurring transaction
 * @access  Private
 */
export const createRecurringTransaction = asyncHandler(async (req, res) => {
  const transaction = await recurringService.createRecurringTransaction(
    req.user._id,
    req.body
  );

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    { transaction },
    `Recurring ${transaction.type} of ₹${transaction.amount} (${transaction.recurringDetails.frequency}) created`
  );
});

/**
 * @route   GET /api/recurring
 * @desc    Get all recurring transactions
 * @access  Private
 */
export const getAllRecurringTransactions = asyncHandler(async (req, res) => {
  const transactions = await recurringService.getAllRecurringTransactions(
    req.user._id,
    req.query
  );

  const activeCount = transactions.filter((t) => t.isActive).length;

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transactions, total: transactions.length, active: activeCount },
    `Retrieved ${transactions.length} recurring transactions (${activeCount} active)`
  );
});

/**
 * @route   GET /api/recurring/:id
 * @desc    Get recurring transaction by ID
 * @access  Private
 */
export const getRecurringTransactionById = asyncHandler(async (req, res) => {
  const transaction = await recurringService.getRecurringTransactionById(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transaction },
    "Recurring transaction retrieved successfully"
  );
});

/**
 * @route   PUT /api/recurring/:id
 * @desc    Update recurring transaction
 * @access  Private
 */
export const updateRecurringTransaction = asyncHandler(async (req, res) => {
  const transaction = await recurringService.updateRecurringTransaction(
    req.user._id,
    req.params.id,
    req.body
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transaction },
    "Recurring transaction updated successfully"
  );
});

/**
 * @route   POST /api/recurring/:id/cancel
 * @desc    Cancel recurring transaction
 * @access  Private
 */
export const cancelRecurringTransaction = asyncHandler(async (req, res) => {
  const transaction = await recurringService.cancelRecurringTransaction(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { transaction },
    "Recurring transaction canceled. No more instances will be created."
  );
});

/**
 * @route   DELETE /api/recurring/:id
 * @desc    Delete recurring transaction
 * @access  Private
 */
export const deleteRecurringTransaction = asyncHandler(async (req, res) => {
  await recurringService.deleteRecurringTransaction(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    null,
    "Recurring transaction deleted successfully"
  );
});

/**
 * @route   GET /api/recurring/:id/upcoming
 * @desc    Get upcoming instances of recurring transaction
 * @access  Private
 */
export const getUpcomingInstances = asyncHandler(async (req, res) => {
  const count = parseInt(req.query.count) || 5;
  const instances = await recurringService.getUpcomingInstances(
    req.user._id,
    req.params.id,
    count
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { instances, count: instances.length },
    `Next ${instances.length} occurrences retrieved`
  );
});

export default {
  createRecurringTransaction,
  getAllRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  cancelRecurringTransaction,
  deleteRecurringTransaction,
  getUpcomingInstances,
};
