import * as BudgetService from "../../services/transactions/budgetService.js";
import { sendSuccess, sendError } from "../../utils/response.js";

const handleError = (res, error, status = 500) => {
  const code = error.message.includes("not found") ? 404 : status;
  sendError(res, code, error.message);
};

const getTypeLabel = (type) => (type === "budget" ? "Budget" : "Savings goal");

export const createBudget = async (req, res) => {
  try {
    const budget = await BudgetService.createBudget(req.user._id, req.body);
    sendSuccess(res, 201, budget, `${getTypeLabel(budget.type)} created`);
  } catch (error) {
    handleError(res, error, 400);
  }
};

export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await BudgetService.getAllBudgets(req.user._id);
    sendSuccess(res, 200, budgets, `${budgets.length} items retrieved`);
  } catch (error) {
    handleError(res, error);
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const budget = await BudgetService.getBudgetById(req.user._id, req.params.id);
    sendSuccess(res, 200, budget, `${getTypeLabel(budget.type)} retrieved`);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await BudgetService.updateBudget(req.user._id, req.params.id, req.body);
    sendSuccess(res, 200, budget, `${getTypeLabel(budget.type)} updated`);
  } catch (error) {
    handleError(res, error, 400);
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id, type } = await BudgetService.deleteBudget(req.user._id, req.params.id);
    sendSuccess(res, 200, null, `${getTypeLabel(type)} '${id}' deleted`);
  } catch (error) {
    handleError(res, error);
  }
};