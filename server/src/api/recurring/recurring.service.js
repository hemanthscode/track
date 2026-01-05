import { Transaction } from "../../models/index.js";
import { add } from "date-fns";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

const recurringIntervals = {
  daily: { days: 1 },
  weekly: { weeks: 1 },
  monthly: { months: 1 },
  yearly: { years: 1 },
};

/**
 * Create recurring transaction
 */
export const createRecurringTransaction = async (userId, recurringData) => {
  try {
    const { recurringDetails, ...transactionData } = recurringData;

    if (!recurringDetails?.frequency) {
      throw ApiError.badRequest("Frequency is required for recurring transactions");
    }

    // Calculate first occurrence
    const startDate = recurringDetails.startDate
      ? new Date(recurringDetails.startDate)
      : new Date();

    const nextOccurrence = add(startDate, recurringIntervals[recurringDetails.frequency]);

    const transaction = await Transaction.create({
      ...transactionData,
      userId,
      date: startDate,
      isRecurring: true,
      recurringDetails: {
        frequency: recurringDetails.frequency,
        nextOccurrence,
        endDate: recurringDetails.endDate || null,
        recurrenceId: null,
      },
    });

    // Set self as recurrence ID
    transaction.recurringDetails.recurrenceId = transaction._id;
    await transaction.save();

    logger.info("Recurring transaction created", {
      userId,
      transactionId: transaction._id,
      frequency: recurringDetails.frequency,
      nextOccurrence,
    });

    return transaction;
  } catch (error) {
    logger.error("Failed to create recurring transaction", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get all recurring transactions
 */
export const getAllRecurringTransactions = async (userId, filters = {}) => {
  try {
    const { status = "all" } = filters;

    const query = {
      userId,
      isRecurring: true,
    };

    const now = new Date();

    // Filter by status
    if (status === "active") {
      query.$or = [
        { "recurringDetails.endDate": null },
        { "recurringDetails.endDate": { $gte: now } },
      ];
    } else if (status === "ended") {
      query["recurringDetails.endDate"] = { $lt: now };
    }

    const transactions = await Transaction.find(query)
      .sort({ "recurringDetails.nextOccurrence": 1 })
      .lean();

    // Add computed fields
    const enrichedTransactions = transactions.map((t) => ({
      ...t,
      isActive:
        !t.recurringDetails.endDate ||
        new Date(t.recurringDetails.endDate) >= now,
      occurrencesRemaining: calculateOccurrencesRemaining(t.recurringDetails),
    }));

    return enrichedTransactions;
  } catch (error) {
    logger.error("Failed to get recurring transactions", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get recurring transaction by ID
 */
export const getRecurringTransactionById = async (userId, transactionId) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      isRecurring: true,
    }).lean();

    if (!transaction) {
      throw ApiError.notFound("Recurring transaction not found");
    }

    // Add computed fields
    const now = new Date();
    return {
      ...transaction,
      isActive:
        !transaction.recurringDetails.endDate ||
        new Date(transaction.recurringDetails.endDate) >= now,
      occurrencesRemaining: calculateOccurrencesRemaining(
        transaction.recurringDetails
      ),
    };
  } catch (error) {
    logger.error("Failed to get recurring transaction", {
      transactionId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Update recurring transaction
 */
export const updateRecurringTransaction = async (
  userId,
  transactionId,
  updates
) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      isRecurring: true,
    });

    if (!transaction) {
      throw ApiError.notFound("Recurring transaction not found");
    }

    // Check if already ended
    if (transaction.hasRecurringEnded()) {
      throw ApiError.badRequest("Cannot update an ended recurring transaction");
    }

    // Update frequency - recalculate next occurrence
    if (updates.recurringDetails?.frequency) {
      const newFrequency = updates.recurringDetails.frequency;
      updates.recurringDetails.nextOccurrence = add(
        new Date(),
        recurringIntervals[newFrequency]
      );
    }

    // Apply updates
    Object.assign(transaction, updates);
    await transaction.save();

    logger.info("Recurring transaction updated", {
      userId,
      transactionId,
      changes: Object.keys(updates),
    });

    return transaction;
  } catch (error) {
    logger.error("Failed to update recurring transaction", {
      transactionId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Cancel recurring transaction
 */
export const cancelRecurringTransaction = async (userId, transactionId) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      isRecurring: true,
    });

    if (!transaction) {
      throw ApiError.notFound("Recurring transaction not found");
    }

    if (transaction.hasRecurringEnded()) {
      throw ApiError.badRequest("Recurring transaction is already ended");
    }

    // Set end date to now
    transaction.recurringDetails.endDate = new Date();
    transaction.recurringDetails.nextOccurrence = null;
    await transaction.save();

    logger.info("Recurring transaction canceled", { userId, transactionId });

    return transaction;
  } catch (error) {
    logger.error("Failed to cancel recurring transaction", {
      transactionId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Delete recurring transaction (and all future occurrences)
 */
export const deleteRecurringTransaction = async (userId, transactionId) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      isRecurring: true,
    });

    if (!transaction) {
      throw ApiError.notFound("Recurring transaction not found");
    }

    // Delete the recurring template
    await Transaction.deleteOne({ _id: transactionId });

    // Optionally delete all future generated instances
    // (You can decide if you want to keep past instances)
    await Transaction.deleteMany({
      userId,
      isRecurring: false,
      "recurringDetails.recurrenceId": transactionId,
      date: { $gte: new Date() },
    });

    logger.info("Recurring transaction deleted", { userId, transactionId });

    return true;
  } catch (error) {
    logger.error("Failed to delete recurring transaction", {
      transactionId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get upcoming recurring transaction instances
 */
export const getUpcomingInstances = async (userId, transactionId, count = 5) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
      isRecurring: true,
    });

    if (!transaction) {
      throw ApiError.notFound("Recurring transaction not found");
    }

    if (transaction.hasRecurringEnded()) {
      return [];
    }

    const instances = [];
    let currentDate = transaction.recurringDetails.nextOccurrence || new Date();
    const endDate = transaction.recurringDetails.endDate;
    const frequency = transaction.recurringDetails.frequency;

    for (let i = 0; i < count; i++) {
      if (endDate && currentDate > endDate) {
        break;
      }

      instances.push({
        date: new Date(currentDate),
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
      });

      currentDate = add(currentDate, recurringIntervals[frequency]);
    }

    return instances;
  } catch (error) {
    logger.error("Failed to get upcoming instances", {
      transactionId,
      error: error.message,
    });
    throw error;
  }
};

// Helper functions

/**
 * Calculate remaining occurrences
 */
const calculateOccurrencesRemaining = (recurringDetails) => {
  if (!recurringDetails.endDate) {
    return "Unlimited";
  }

  const now = new Date();
  const endDate = new Date(recurringDetails.endDate);

  if (endDate <= now) {
    return 0;
  }

  const nextOccurrence = recurringDetails.nextOccurrence || now;
  const frequency = recurringDetails.frequency;
  const interval = recurringIntervals[frequency];

  let count = 0;
  let currentDate = new Date(nextOccurrence);

  while (currentDate <= endDate && count < 1000) {
    count++;
    currentDate = add(currentDate, interval);
  }

  return count;
};

export default {
  createRecurringTransaction,
  getAllRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  cancelRecurringTransaction,
  deleteRecurringTransaction,
  getUpcomingInstances,
};
