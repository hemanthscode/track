import * as TransactionService from "../../services/transactions/transactionService.js";

const sendResponse = (res, status, data, message) => {
  res.status(status).json({ success: true, message, data });
};

const handleError = (res, error, id = "") => {
  const status = error.message.includes("not found") ? 404 : 400;
  res.status(status).json({ success: false, message: `${id ? `Transaction '${id}': ` : ""}${error.message}` });
};

export const createTransaction = async (req, res) => {
  try {
    const transaction = await TransactionService.createTransaction(req.user._id, req.body);
    sendResponse(res, 201, transaction, `Transaction '${transaction._id}' (${transaction.type}) created`);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionService.getAllTransactions(req.user._id, req.query);
    sendResponse(res, 200, transactions, `${transactions.length} transactions retrieved`);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await TransactionService.getTransactionById(req.user._id, req.params.id);
    sendResponse(res, 200, transaction, `Transaction '${req.params.id}' retrieved`);
  } catch (error) {
    handleError(res, error, req.params.id);
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await TransactionService.updateTransaction(req.user._id, req.params.id, req.body);
    sendResponse(res, 200, transaction, `Transaction '${req.params.id}' updated`);
  } catch (error) {
    handleError(res, error, req.params.id);
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    await TransactionService.deleteTransaction(req.user._id, req.params.id);
    sendResponse(res, 200, null, `Transaction '${req.params.id}' deleted`);
  } catch (error) {
    handleError(res, error, req.params.id);
  }
};