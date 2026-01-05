import * as budgetsService from "./budgets.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   POST /api/budgets
 * @desc    Create new budget or savings goal
 * @access  Private
 */
export const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetsService.createBudget(req.user._id, req.body);

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    { budget },
    `${budget.type === "budget" ? "Budget" : "Savings goal"} created for ${
      budget.category || "savings"
    } (₹${budget.amount})`
  );
});

/**
 * @route   GET /api/budgets
 * @desc    Get all budgets with filters
 * @access  Private
 */
export const getAllBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetsService.getAllBudgets(req.user._id, req.query);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { budgets, count: budgets.length },
    `Retrieved ${budgets.length} budgets/goals`
  );
});

/**
 * @route   GET /api/budgets/summary
 * @desc    Get budget summary
 * @access  Private
 */
export const getBudgetSummary = asyncHandler(async (req, res) => {
  const summary = await budgetsService.getBudgetSummary(req.user._id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    summary,
    "Budget summary retrieved successfully"
  );
});

/**
 * @route   GET /api/budgets/:id
 * @desc    Get budget by ID
 * @access  Private
 */
export const getBudgetById = asyncHandler(async (req, res) => {
  const budget = await budgetsService.getBudgetById(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { budget },
    "Budget retrieved successfully"
  );
});

/**
 * @route   PUT /api/budgets/:id
 * @desc    Update budget
 * @access  Private
 */
export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await budgetsService.updateBudget(
    req.user._id,
    req.params.id,
    req.body
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { budget },
    "Budget updated successfully"
  );
});

/**
 * @route   DELETE /api/budgets/:id
 * @desc    Delete budget
 * @access  Private
 */
export const deleteBudget = asyncHandler(async (req, res) => {
  await budgetsService.deleteBudget(req.user._id, req.params.id);

  sendSuccess(res, HTTP_STATUS.OK, null, "Budget deleted successfully");
});

/**
 * @route   POST /api/budgets/:id/progress
 * @desc    Add progress to budget manually
 * @access  Private
 */
export const addProgress = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const budget = await budgetsService.addProgressToBudget(
    req.user._id,
    req.params.id,
    amount
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { budget },
    `Progress updated: ₹${amount} added (Total: ₹${budget.progress}/${budget.amount})`
  );
});

export default {
  createBudget,
  getAllBudgets,
  getBudgetSummary,
  getBudgetById,
  updateBudget,
  deleteBudget,
  addProgress,
};
