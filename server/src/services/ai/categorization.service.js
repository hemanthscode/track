import { generateCompletion } from "./groq.service.js";
import { TRANSACTION_CATEGORIES, AI_PROMPTS } from "../../config/constants.js";
import logger from "../../utils/logger.js";

/**
 * Categorize transaction using AI
 */
export const categorizeTransaction = async (description, type = "expense") => {
  try {
    const categories =
      type === "income"
        ? TRANSACTION_CATEGORIES.INCOME
        : TRANSACTION_CATEGORIES.EXPENSE;

    const systemPrompt = `You are a financial transaction categorizer. Categorize the transaction into ONE of these categories: ${categories.join(", ")}. Respond with ONLY the category name in lowercase, nothing else.`;

    const userPrompt = `Transaction description: "${description}"`;

    const category = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.2,
      maxTokens: 50,
    });

    // Validate category
    const normalizedCategory = category.toLowerCase().trim();
    if (!categories.includes(normalizedCategory)) {
      logger.warn("AI returned invalid category", { category, description });
      return type === "income" ? "other" : "miscellaneous";
    }

    logger.info("Transaction categorized", { description, category: normalizedCategory });
    return normalizedCategory;
  } catch (error) {
    logger.error("Categorization failed", { error: error.message, description });
    return type === "income" ? "other" : "miscellaneous";
  }
};

/**
 * Bulk categorize transactions
 */
export const bulkCategorizeTransactions = async (transactions) => {
  try {
    const categorized = await Promise.all(
      transactions.map(async (transaction) => {
        const category = await categorizeTransaction(
          transaction.description,
          transaction.type
        );
        return {
          ...transaction,
          category,
          aiCategorized: true,
        };
      })
    );

    return categorized;
  } catch (error) {
    logger.error("Bulk categorization failed", { error: error.message });
    throw error;
  }
};

/**
 * Suggest category with confidence score
 */
export const suggestCategory = async (description, type = "expense") => {
  try {
    const categories =
      type === "income"
        ? TRANSACTION_CATEGORIES.INCOME
        : TRANSACTION_CATEGORIES.EXPENSE;

    const systemPrompt = `Analyze the transaction and suggest the most appropriate category from: ${categories.join(", ")}. Also provide a confidence score (0-100).`;

    const userPrompt = `Transaction: "${description}"\n\nRespond in JSON format: {"category": "...", "confidence": 85}`;

    const response = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.3,
    });

    const parsed = JSON.parse(response);
    return {
      category: parsed.category.toLowerCase(),
      confidence: parsed.confidence,
    };
  } catch (error) {
    logger.error("Category suggestion failed", { error: error.message });
    return {
      category: type === "income" ? "other" : "miscellaneous",
      confidence: 0,
    };
  }
};

export default { categorizeTransaction, bulkCategorizeTransactions, suggestCategory };
