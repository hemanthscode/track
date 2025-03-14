import * as RecurringService from "../../services/transactions/recurringService.js";
import { sendSuccess, sendError } from "../../utils/response.js";

const handleError = (res, error) => {
  const status = error.message.includes("not found") ? 404 : 400;
  sendError(res, status, error.message);
};

export const createRecurringTransaction = async (req, res) => {
  try {
    const transaction = await RecurringService.createRecurringTransaction(
      req.user._id,
      req.body
    );
    sendSuccess(res, 201, {
      id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      nextOccurrence: transaction.recurringDetails.nextOccurrence,
    }, "Recurring transaction created successfully");
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllRecurringTransactions = async (req, res) => {
  try {
    const transactions = await RecurringService.getAllRecurringTransactions(req.user._id);
    const simplified = transactions.map(t => ({
      id: t._id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      frequency: t.recurringDetails.frequency,
      nextOccurrence: t.recurringDetails.nextOccurrence,
      active: !t.recurringDetails.endDate || new Date(t.recurringDetails.endDate) > new Date()
    }));
    sendSuccess(res, 200, simplified, `${simplified.length} recurring transactions found`);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateRecurringTransaction = async (req, res) => {
  try {
    const transaction = await RecurringService.updateRecurringTransaction(
      req.user._id,
      req.params.id,
      req.body
    );
    sendSuccess(res, 200, {
      id: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      nextOccurrence: transaction.recurringDetails.nextOccurrence,
    }, "Recurring transaction updated successfully");
  } catch (error) {
    handleError(res, error);
  }
};

export const cancelRecurringTransaction = async (req, res) => {
  try {
    const transaction = await RecurringService.cancelRecurringTransaction(
      req.user._id,
      req.params.id
    );
    sendSuccess(res, 200, { id: transaction._id }, "Recurring transaction canceled successfully");
  } catch (error) {
    handleError(res, error);
  }
};