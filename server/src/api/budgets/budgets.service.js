import { Budget, Transaction } from "../../models/index.js";
import { sendBudgetAlertEmail } from "../../services/external/email.service.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Create new budget or savings goal
 */
export const createBudget = async (userId, budgetData) => {
  try {
    // Check if budget already exists for category and period
    if (budgetData.type === "budget") {
      const existingBudget = await Budget.findOne({
        userId,
        type: "budget",
        category: budgetData.category,
        period: budgetData.period,
        endDate: { $gte: new Date() },
      });

      if (existingBudget) {
        throw ApiError.conflict(
          `Active budget already exists for ${budgetData.category} (${budgetData.period})`
        );
      }
    }

    const budget = await Budget.create({
      ...budgetData,
      userId,
    });

    logger.info("Budget created", {
      userId,
      budgetId: budget._id,
      type: budget.type,
      category: budget.category,
      amount: budget.amount,
    });

    return budget;
  } catch (error) {
    logger.error("Failed to create budget", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get all budgets with filters
 */
export const getAllBudgets = async (userId, filters = {}) => {
  try {
    const { type, category, period, status } = filters;

    const query = { userId };
    const now = new Date();

    if (type) query.type = type;
    if (category) query.category = category;
    if (period) query.period = period;

    // Filter by status
    if (status === "active") {
      query.endDate = { $gte: now };
    } else if (status === "expired") {
      query.endDate = { $lt: now };
    }

    let budgets = await Budget.find(query).sort({ createdAt: -1 }).lean();

    // Add computed status and filter by warning/exceeded if needed
    budgets = budgets.map((budget) => {
      const percentage = Math.round((budget.progress / budget.amount) * 100);
      const isExpired = budget.endDate && new Date(budget.endDate) < now;

      let computedStatus = "active";
      if (isExpired) {
        computedStatus = "expired";
      } else if (percentage >= 100) {
        computedStatus = "exceeded";
      } else if (percentage >= budget.alertThreshold) {
        computedStatus = "warning";
      }

      return {
        ...budget,
        percentage,
        remaining: Math.max(0, budget.amount - budget.progress),
        status: computedStatus,
      };
    });

    // Apply status filter if needed
    if (status === "warning") {
      budgets = budgets.filter((b) => b.status === "warning");
    } else if (status === "exceeded") {
      budgets = budgets.filter((b) => b.status === "exceeded");
    }

    return budgets;
  } catch (error) {
    logger.error("Failed to get budgets", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get budget by ID
 */
export const getBudgetById = async (userId, budgetId) => {
  try {
    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    }).lean();

    if (!budget) {
      throw ApiError.notFound("Budget not found");
    }

    // Add computed fields
    const percentage = budget.getProgressPercentage
      ? budget.getProgressPercentage()
      : Math.round((budget.progress / budget.amount) * 100);

    const remaining = Math.max(0, budget.amount - budget.progress);

    // Get related transactions if budget type
    let transactions = [];
    if (budget.type === "budget") {
      transactions = await Transaction.find({
        userId,
        type: "expense",
        category: budget.category,
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate || new Date(),
        },
      })
        .sort({ date: -1 })
        .limit(10)
        .lean();
    }

    return {
      ...budget,
      percentage,
      remaining,
      transactions,
    };
  } catch (error) {
    logger.error("Failed to get budget", { budgetId, error: error.message });
    throw error;
  }
};

/**
 * Update budget
 */
export const updateBudget = async (userId, budgetId, updates) => {
  try {
    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      throw ApiError.notFound("Budget not found");
    }

    // Don't allow updating expired budgets
    if (budget.isExpired()) {
      throw ApiError.badRequest("Cannot update expired budget");
    }

    // Apply updates
    Object.assign(budget, updates);
    await budget.save();

    logger.info("Budget updated", {
      userId,
      budgetId,
      changes: Object.keys(updates),
    });

    return budget;
  } catch (error) {
    logger.error("Failed to update budget", { budgetId, error: error.message });
    throw error;
  }
};

/**
 * Delete budget
 */
export const deleteBudget = async (userId, budgetId) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      throw ApiError.notFound("Budget not found");
    }

    logger.info("Budget deleted", { userId, budgetId, type: budget.type });

    return budget;
  } catch (error) {
    logger.error("Failed to delete budget", { budgetId, error: error.message });
    throw error;
  }
};

/**
 * Add progress to budget manually
 */
export const addProgressToBudget = async (userId, budgetId, amount) => {
  try {
    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      throw ApiError.notFound("Budget not found");
    }

    if (budget.isExpired()) {
      throw ApiError.badRequest("Cannot add progress to expired budget");
    }

    // Add progress
    budget.progress += amount;
    await budget.save();

    // Check if alert should be sent
    if (budget.shouldSendAlert()) {
      await sendBudgetAlert(userId, budget);
    }

    logger.info("Progress added to budget", {
      userId,
      budgetId,
      amount,
      newProgress: budget.progress,
    });

    return budget;
  } catch (error) {
    logger.error("Failed to add progress", { budgetId, error: error.message });
    throw error;
  }
};

/**
 * Get budget summary
 */
export const getBudgetSummary = async (userId) => {
  try {
    const now = new Date();

    const budgets = await Budget.find({
      userId,
      type: "budget",
      endDate: { $gte: now },
    }).lean();

    const savingsGoals = await Budget.find({
      userId,
      type: "savings",
      endDate: { $gte: now },
    }).lean();

    // Calculate totals
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.progress, 0);
    const totalSavingsGoal = savingsGoals.reduce((sum, s) => sum + s.amount, 0);
    const totalSavingsProgress = savingsGoals.reduce((sum, s) => sum + s.progress, 0);

    // Count by status
    const budgetsByStatus = {
      active: 0,
      warning: 0,
      exceeded: 0,
    };

    budgets.forEach((budget) => {
      const percentage = Math.round((budget.progress / budget.amount) * 100);
      if (percentage >= 100) {
        budgetsByStatus.exceeded++;
      } else if (percentage >= budget.alertThreshold) {
        budgetsByStatus.warning++;
      } else {
        budgetsByStatus.active++;
      }
    });

    return {
      budgets: {
        total: budgets.length,
        totalBudgeted,
        totalSpent,
        remaining: totalBudgeted - totalSpent,
        byStatus: budgetsByStatus,
      },
      savings: {
        total: savingsGoals.length,
        totalGoal: totalSavingsGoal,
        totalProgress: totalSavingsProgress,
        remaining: totalSavingsGoal - totalSavingsProgress,
      },
    };
  } catch (error) {
    logger.error("Failed to get budget summary", { userId, error: error.message });
    throw error;
  }
};

// Helper functions

/**
 * Send budget alert email
 */
const sendBudgetAlert = async (userId, budget) => {
  try {
    const user = await Budget.findById(userId).populate(
      "userId",
      "email username firstName"
    );

    if (!user) return;

    await sendBudgetAlertEmail(user.email, user.username || user.firstName, {
      category: budget.category,
      spent: budget.progress,
      limit: budget.amount,
    });

    budget.alertSent = true;
    await budget.save();

    logger.info("Budget alert email sent", {
      userId,
      budgetId: budget._id,
      category: budget.category,
    });
  } catch (error) {
    logger.error("Failed to send budget alert", {
      userId,
      budgetId: budget._id,
      error: error.message,
    });
  }
};

export default {
  createBudget,
  getAllBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  addProgressToBudget,
  getBudgetSummary,
};
