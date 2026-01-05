import { generateCompletion } from "./groq.service.js";
import logger from "../../utils/logger.js";

/**
 * Generate financial insights from spending data
 */
export const generateFinancialInsights = async (spendingData) => {
  try {
    const systemPrompt = `You are a financial advisor. Analyze spending patterns and provide 3-5 actionable insights to improve financial health. Be specific and practical.`;

    const userPrompt = `
Analyze this financial data and provide insights:

Total Income: ₹${spendingData.income}
Total Expenses: ₹${spendingData.expenses}
Net Savings: ₹${spendingData.savings}
Savings Rate: ${spendingData.savingsRate}%

Top Expense Categories:
${spendingData.topCategories.map((cat) => `- ${cat.category}: ₹${cat.amount} (${cat.percentage}%)`).join("\n")}

Provide insights in this format:
1. [Insight title]: [Detailed explanation]
2. [Insight title]: [Detailed explanation]
...
`;

    const insights = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.7,
      maxTokens: 800,
    });

    logger.info("Financial insights generated");
    return insights;
  } catch (error) {
    logger.error("Insights generation failed", { error: error.message });
    throw error;
  }
};

/**
 * Generate budget recommendations
 */
export const generateBudgetRecommendations = async (userData) => {
  try {
    const systemPrompt = `You are a budget planning expert. Suggest realistic monthly budget limits for each spending category based on income and current spending patterns.`;

    const userPrompt = `
Monthly Income: ₹${userData.income}
Current Spending by Category:
${userData.spending.map((cat) => `- ${cat.category}: ₹${cat.amount}`).join("\n")}

Suggest budget limits for each category in JSON format:
{
  "food": 8000,
  "transport": 5000,
  ...
}
`;

    const recommendations = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.5,
      maxTokens: 500,
    });

    return JSON.parse(recommendations);
  } catch (error) {
    logger.error("Budget recommendations failed", { error: error.message });
    throw error;
  }
};

/**
 * Detect unusual spending patterns
 */
export const detectAnomalies = async (recentTransactions, historicalAverage) => {
  try {
    const systemPrompt = `You are a fraud detection system. Identify unusual transactions that deviate significantly from historical patterns. Flag potential issues.`;

    const userPrompt = `
Historical Average Daily Spending: ₹${historicalAverage}

Recent Transactions:
${recentTransactions.map((t) => `- ${t.description}: ₹${t.amount} on ${t.date}`).join("\n")}

Identify any anomalies and respond in JSON:
{
  "anomalies": [
    {
      "transactionId": "...",
      "reason": "...",
      "severity": "low|medium|high"
    }
  ]
}
`;

    const result = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.3,
    });

    return JSON.parse(result);
  } catch (error) {
    logger.error("Anomaly detection failed", { error: error.message });
    return { anomalies: [] };
  }
};

/**
 * Answer natural language queries about finances
 */
export const answerFinancialQuery = async (query, userFinancialData) => {
  try {
    const systemPrompt = `You are a helpful financial assistant. Answer questions about the user's finances based on provided data. Be concise and accurate.`;

    const userPrompt = `
User's Financial Data:
- Total Income: ₹${userFinancialData.income}
- Total Expenses: ₹${userFinancialData.expenses}
- Balance: ₹${userFinancialData.balance}
- Top Categories: ${userFinancialData.topCategories.join(", ")}

User Question: "${query}"

Answer:`;

    const answer = await generateCompletion(systemPrompt, userPrompt, {
      temperature: 0.6,
      maxTokens: 300,
    });

    return answer;
  } catch (error) {
    logger.error("Query answering failed", { error: error.message });
    throw error;
  }
};

export default {
  generateFinancialInsights,
  generateBudgetRecommendations,
  detectAnomalies,
  answerFinancialQuery,
};
