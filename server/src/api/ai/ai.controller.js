import * as aiService from "./ai.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   POST /api/ai/categorize
 * @desc    AI categorize transaction
 * @access  Private
 */
export const categorize = asyncHandler(async (req, res) => {
  const { description, type } = req.body;
  const result = await aiService.aiCategorize(description, type);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    result,
    `AI suggests category: "${result.category}"`
  );
});

/**
 * @route   POST /api/ai/insights
 * @desc    Get financial insights
 * @access  Private
 */
export const getInsights = asyncHandler(async (req, res) => {
  const insights = await aiService.getFinancialInsights(
    req.user._id,
    req.body
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    insights,
    "Financial insights generated successfully"
  );
});

/**
 * @route   POST /api/ai/budget-recommendations
 * @desc    Get budget recommendations
 * @access  Private
 */
export const getBudgetRecommendations = asyncHandler(async (req, res) => {
  const { monthlyIncome } = req.body;
  const recommendations = await aiService.getBudgetRecommendations(
    req.user._id,
    monthlyIncome
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { recommendations },
    "Budget recommendations generated"
  );
});

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI financial assistant
 * @access  Private
 */
export const chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const response = await aiService.chatWithAI(req.user._id, message);

  sendSuccess(res, HTTP_STATUS.OK, response, "AI response generated");
});

/**
 * @route   POST /api/ai/bulk-categorize
 * @desc    Bulk categorize uncategorized transactions
 * @access  Private
 */
export const bulkCategorize = asyncHandler(async (req, res) => {
  const result = await aiService.bulkCategorize(req.user._id);

  sendSuccess(res, HTTP_STATUS.OK, result, result.message);
});

export default {
  categorize,
  getInsights,
  getBudgetRecommendations,
  chat,
  bulkCategorize,
};
