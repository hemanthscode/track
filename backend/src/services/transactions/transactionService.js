import mongoose from "mongoose";
import { add } from "date-fns";
import Transaction from "../../models/Transaction.js";

const recurringIntervals = {
  daily: { days: 1 },
  weekly: { weeks: 1 },
  monthly: { months: 1 },
  yearly: { years: 1 },
};

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid transaction ID");
  return id;
};

const ensureExists = (transaction, id) => {
  if (!transaction) throw new Error("Transaction not found");
  return transaction;
};

export const createTransaction = async (userId, { type, amount, category, date, isRecurring, recurringDetails, ...rest }) => {
  const transactionData = {
    userId,
    type,
    amount,
    category,
    date: date || new Date(),
    isRecurring: isRecurring || false,
    ...rest,
  };

  if (isRecurring) {
    if (!recurringDetails?.frequency) throw new Error("Frequency is required for recurring transactions");
    transactionData.recurringDetails = {
      ...recurringDetails,
      nextOccurrence: recurringDetails.nextOccurrence || add(new Date(date || Date.now()), recurringIntervals[recurringDetails.frequency]),
    };
  }

  const transaction = await Transaction.create(transactionData);
  if (isRecurring) {
    transaction.recurringDetails.recurrenceId = transaction._id;
    await transaction.save();
  }
  return transaction;
};

export const getAllTransactions = async (userId, { type, category, startDate, endDate } = {}) => {
  const query = { userId };
  if (type) query.type = type;
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  return await Transaction.find(query)
    .select("type amount category date isRecurring") 
    .sort({ date: -1 })
    .limit(100)
    .lean(); 
};

export const getTransactionById = async (userId, transactionId) => {
  return ensureExists(
    await Transaction.findOne({ _id: validateId(transactionId), userId })
      .select("-__v -userId") 
      .lean(),
    transactionId
  );
};

export const updateTransaction = async (userId, transactionId, updates) => {
  if (updates.amount < 0) throw new Error("Amount cannot be negative");
  if (updates.isRecurring && !updates.recurringDetails?.frequency) {
    throw new Error("Frequency is required for recurring transactions");
  }
  return ensureExists(
    await Transaction.findOneAndUpdate(
      { _id: validateId(transactionId), userId },
      { $set: updates },
      { new: true, runValidators: true, lean: true }
    ).select("-__v -userId"),
    transactionId
  );
};

export const deleteTransaction = async (userId, transactionId) => {
  return ensureExists(
    await Transaction.findOneAndDelete({ _id: validateId(transactionId), userId }).lean(),
    transactionId
  );
};