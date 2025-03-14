import mongoose from "mongoose";
import Budget from "../../models/Budget.js";

const isValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid budget ID");
  }
  return id;
};

// Helper to validate progress vs amount
const validateProgress = (amount, progress) => {
  if (progress > amount) {
    throw new Error("Progress cannot exceed amount");
  }
};

export const createBudget = async (userId, budgetData) => {
  const budget = new Budget({ ...budgetData, userId });
  return budget.save().then((doc) => doc.toObject());
};

export const getAllBudgets = async (userId) => {
  return Budget.find({ userId }, "type category amount period startDate endDate progress description")
    .lean()
    .exec();
};

export const getBudgetById = async (userId, budgetId) => {
  const budget = await Budget.findOne(
    { _id: isValidId(budgetId), userId },
    "type category amount period startDate endDate progress description"
  )
    .lean()
    .exec();
  if (!budget) throw new Error("Budget not found");
  return budget;
};

export const updateBudget = async (userId, budgetId, updates) => {
  const budgetIdValid = isValidId(budgetId);
  const existingBudget = await Budget.findOne({ _id: budgetIdValid, userId }).lean();
  if (!existingBudget) throw new Error("Budget not found");

  const amount = updates.amount ?? existingBudget.amount;
  const progress = updates.progress ?? existingBudget.progress;
  validateProgress(amount, progress);

  const budget = await Budget.findOneAndUpdate(
    { _id: budgetIdValid, userId },
    { $set: updates },
    { new: true, runValidators: true, fields: "type category amount period startDate endDate progress description" }
  ).lean();
  if (!budget) throw new Error("Budget not found");
  return budget;
};

export const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({ _id: isValidId(budgetId), userId }).lean();
  if (!budget) throw new Error("Budget not found");
  return { id: budget._id, type: budget.type };
};