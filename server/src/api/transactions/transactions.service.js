import { Transaction, Budget } from "../../models/index.js";
import { categorizeTransaction } from "../../services/ai/categorization.service.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";
import { getPaginationParams, applyPagination } from "../../utils/pagination.js";

/**
 * Create new transaction
 */
export const createTransaction = async (userId, transactionData) => {
  try {
    // AI categorization if no category provided
    if (!transactionData.category && transactionData.description) {
      const aiCategory = await categorizeTransaction(
        transactionData.description,
        transactionData.type
      );
      transactionData.category = aiCategory;
      transactionData.aiCategorized = true;
    }

    const transaction = await Transaction.create({
      ...transactionData,
      userId,
    });

    // Update budget progress if expense
    if (transaction.type === "expense") {
      await updateBudgetProgress(userId, transaction);
    }

    // Update savings goal progress if linked
    if (transaction.savingsGoalId) {
      await updateSavingsGoalProgress(transaction.savingsGoalId, transaction.amount);
    }

    logger.info("Transaction created", {
      userId,
      transactionId: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
    });

    return transaction;
  } catch (error) {
    logger.error("Failed to create transaction", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get all transactions with filters and pagination
 */
export const getAllTransactions = async (userId, filters = {}) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = "date",
      sortOrder = "desc",
    } = filters;

    const { page, limit, skip } = getPaginationParams(filters);

    // Build query
    const query = { userId };

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // Execute query
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("receiptId", "imageUrl thumbnailUrl")
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return { transactions, total, page, limit };
  } catch (error) {
    logger.error("Failed to get transactions", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (userId, transactionId) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    })
      .populate("receiptId", "imageUrl thumbnailUrl ocrData")
      .populate("savingsGoalId", "type amount progress");

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    return transaction;
  } catch (error) {
    logger.error("Failed to get transaction", { transactionId, error: error.message });
    throw error;
  }
};

/**
 * Update transaction
 */
export const updateTransaction = async (userId, transactionId, updates) => {
  try {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    // Store old values for budget adjustment
    const oldAmount = transaction.amount;
    const oldCategory = transaction.category;
    const oldType = transaction.type;

    // Update transaction
    Object.assign(transaction, updates);
    await transaction.save();

    // Adjust budget if expense and category/amount changed
    if (
      transaction.type === "expense" &&
      (oldAmount !== transaction.amount || oldCategory !== transaction.category)
    ) {
      // Revert old budget progress
      if (oldType === "expense") {
        await updateBudgetProgress(userId, { category: oldCategory, amount: -oldAmount });
      }
      // Apply new budget progress
      await updateBudgetProgress(userId, transaction);
    }

    logger.info("Transaction updated", {
      userId,
      transactionId,
      changes: Object.keys(updates),
    });

    return transaction;
  } catch (error) {
    logger.error("Failed to update transaction", { transactionId, error: error.message });
    throw error;
  }
};

/**
 * Delete transaction
 */
export const deleteTransaction = async (userId, transactionId) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    // Revert budget progress if expense
    if (transaction.type === "expense") {
      await updateBudgetProgress(userId, {
        category: transaction.category,
        amount: -transaction.amount,
      });
    }

    logger.info("Transaction deleted", { userId, transactionId });

    return transaction;
  } catch (error) {
    logger.error("Failed to delete transaction", { transactionId, error: error.message });
    throw error;
  }
};

/**
 * Search transactions
 */
export const searchTransactions = async (userId, searchParams) => {
  try {
    const { q, type, category, startDate, endDate } = searchParams;

    const query = { userId };

    // Text search in description, tags, merchant
    if (q) {
      query.$or = [
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { "metadata.merchant": { $regex: q, $options: "i" } },
      ];
    }

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(50)
      .lean();

    return transactions;
  } catch (error) {
    logger.error("Failed to search transactions", { error: error.message });
    throw error;
  }
};

// Helper functions

/**
 * Update budget progress for a transaction
 */
const updateBudgetProgress = async (userId, transaction) => {
  try {
    const budget = await Budget.findOne({
      userId,
      type: "budget",
      category: transaction.category,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (budget) {
      budget.progress += transaction.amount;
      await budget.save();
    }
  } catch (error) {
    logger.warn("Failed to update budget progress", { error: error.message });
  }
};

/**
 * Update savings goal progress
 */
const updateSavingsGoalProgress = async (savingsGoalId, amount) => {
  try {
    const savingsGoal = await Budget.findById(savingsGoalId);

    if (savingsGoal && savingsGoal.type === "savings") {
      savingsGoal.progress += amount;
      await savingsGoal.save();
    }
  } catch (error) {
    logger.warn("Failed to update savings goal progress", { error: error.message });
  }
};

export default {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  searchTransactions,
};
