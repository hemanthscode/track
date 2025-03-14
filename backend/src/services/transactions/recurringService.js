import mongoose from "mongoose";
import { add, isBefore } from "date-fns";
import Transaction from "../../models/Transaction.js";
import { createTransaction } from "./transactionService.js";

const recurringIntervals = {
  daily: { days: 1 },
  weekly: { weeks: 1 },
  monthly: { months: 1 },
  yearly: { years: 1 },
};

const validateId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error(`Invalid transaction ID: ${id}`);
  return id;
};

const findTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: validateId(transactionId),
    userId,
    isRecurring: true,
  }).lean();
  if (!transaction) throw new Error(`Recurring transaction ${transactionId} not found`);
  return transaction;
};

export const createRecurringTransaction = async (userId, recurringData) => {
  const { frequency } = recurringData.recurringDetails || {};
  if (!frequency || !recurringIntervals[frequency]) {
    throw new Error("Invalid or missing frequency for recurring transaction");
  }

  const transactionData = {
    ...recurringData,
    userId,
    isRecurring: true,
    recurringDetails: {
      ...recurringData.recurringDetails,
      nextOccurrence: add(new Date(), recurringIntervals[frequency]),
    },
  };

  const transaction = await createTransaction(userId, transactionData);
  transaction.recurringDetails.recurrenceId = transaction._id;
  return transaction.save();
};

export const getAllRecurringTransactions = async (userId) => {
  return Transaction.find({ userId, isRecurring: true })
    .select("type amount category recurringDetails")
    .lean();
};

export const updateRecurringTransaction = async (userId, transactionId, updates) => {
  await findTransaction(userId, transactionId);

  if (updates.recurringDetails?.frequency) {
    if (!recurringIntervals[updates.recurringDetails.frequency]) {
      throw new Error("Invalid frequency provided");
    }
    updates.recurringDetails.nextOccurrence = add(
      new Date(),
      recurringIntervals[updates.recurringDetails.frequency]
    );
  }

  return Transaction.findOneAndUpdate(
    { _id: transactionId, userId, isRecurring: true },
    { $set: updates },
    { new: true, runValidators: true, select: "type amount recurringDetails" }
  ).lean();
};

export const cancelRecurringTransaction = async (userId, transactionId) => {
  const transaction = await findTransaction(userId, transactionId);
  
  if (transaction.recurringDetails?.endDate && isBefore(transaction.recurringDetails.endDate, new Date())) {
    throw new Error("Cannot cancel an already ended recurring transaction");
  }

  return Transaction.findOneAndUpdate(
    { _id: transactionId, userId, isRecurring: true },
    {
      $set: {
        isRecurring: false,
        "recurringDetails.endDate": new Date(),
        "recurringDetails.nextOccurrence": null,
      },
    },
    { new: true, select: "_id" }
  ).lean();
};