import { Transaction } from "../../models/index.js";
import { categorizeTransaction } from "../../services/ai/categorization.service.js";
import {
  generateFinancialInsights,
  generateBudgetRecommendations,
  answerFinancialQuery,
} from "../../services/ai/insights.service.js";
import { getOverview, getCategoryBreakdown } from "../analytics/analytics.service.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * AI categorize transaction description
 */
export const aiCategorize = async (description, type = "expense") => {
  try {
    const category = await categorizeTransaction(description, type);

    logger.info("AI categorization completed", { description, category });

    return { category, confidence: 85 }; // Mock confidence score
  } catch (error) {
    logger.error("AI categorization failed", { error: error.message });
    throw ApiError.internal("Failed to categorize transaction");
  }
};

/**
 * Generate financial insights
 */
export const getFinancialInsights = async (userId, filters = {}) => {
  try {
    // Get user's financial data
    const overview = await getOverview(userId, filters);
    const categoryBreakdown = await getCategoryBreakdown(userId, {
      type: "expense",
      ...filters,
    });

    // Prepare data for AI
    const spendingData = {
      income: overview.income.total,
      expenses: overview.expenses.total,
      savings: overview.balance,
      savingsRate: overview.savingsRate,
      topCategories: categoryBreakdown.slice(0, 5).map((cat) => ({
        category: cat.category,
        amount: cat.amount,
        percentage: cat.percentage,
      })),
    };

    // Generate insights using AI
    const insights = await generateFinancialInsights(spendingData);

    logger.info("Financial insights generated", { userId });

    return {
      insights,
      data: spendingData,
    };
  } catch (error) {
    logger.error("Failed to generate insights", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get budget recommendations
 */
export const getBudgetRecommendations = async (userId, monthlyIncome) => {
  try {
    // Get current spending patterns
    const categoryBreakdown = await getCategoryBreakdown(userId, {
      type: "expense",
    });

    const spending = categoryBreakdown.map((cat) => ({
      category: cat.category,
      amount: cat.amount,
    }));

    // Generate recommendations
    const recommendations = await generateBudgetRecommendations({
      income: monthlyIncome,
      spending,
    });

    logger.info("Budget recommendations generated", { userId });

    return recommendations;
  } catch (error) {
    logger.error("Failed to generate budget recommendations", {
      userId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * AI chat - answer financial queries
 */
export const chatWithAI = async (userId, message) => {
  try {
    // Get user's financial context
    const overview = await getOverview(userId);
    const categoryBreakdown = await getCategoryBreakdown(userId, {
      type: "expense",
    });

    const userFinancialData = {
      income: overview.income.total,
      expenses: overview.expenses.total,
      balance: overview.balance,
      topCategories: categoryBreakdown
        .slice(0, 5)
        .map((cat) => cat.category),
    };

    // Get AI response
    const response = await answerFinancialQuery(message, userFinancialData);

    logger.info("AI chat response generated", { userId, messageLength: message.length });

    return {
      question: message,
      answer: response,
    };
  } catch (error) {
    logger.error("AI chat failed", { userId, error: error.message });
    throw ApiError.internal("Failed to process chat message");
  }
};

/**
 * Bulk categorize uncategorized transactions
 */
export const bulkCategorize = async (userId) => {
  try {
    // Find transactions without AI categorization
    const uncategorizedTransactions = await Transaction.find({
      userId,
      aiCategorized: false,
      description: { $exists: true, $ne: "" },
    }).limit(50); // Limit to 50 at a time

    if (uncategorizedTransactions.length === 0) {
      return { categorized: 0, message: "No transactions need categorization" };
    }

    let categorizedCount = 0;

    for (const transaction of uncategorizedTransactions) {
      try {
        const category = await categorizeTransaction(
          transaction.description,
          transaction.type
        );

        transaction.category = category;
        transaction.aiCategorized = true;
        await transaction.save();

        categorizedCount++;
      } catch (error) {
        logger.warn("Failed to categorize transaction", {
          transactionId: transaction._id,
          error: error.message,
        });
      }
    }

    logger.info("Bulk categorization completed", {
      userId,
      total: uncategorizedTransactions.length,
      categorized: categorizedCount,
    });

    return {
      total: uncategorizedTransactions.length,
      categorized: categorizedCount,
      message: `Successfully categorized ${categorizedCount} out of ${uncategorizedTransactions.length} transactions`,
    };
  } catch (error) {
    logger.error("Bulk categorization failed", { userId, error: error.message });
    throw error;
  }
};

export default {
  aiCategorize,
  getFinancialInsights,
  getBudgetRecommendations,
  chatWithAI,
  bulkCategorize,
};
