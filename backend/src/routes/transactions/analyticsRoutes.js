import express from "express";
import * as AnalyticsController from "../../controllers/transactions/analyticsController.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { queryValidation } from "../../utils/validations.js";

const router = express.Router();

// Dashboard - Base path: /api/transactions/dashboard/*
router.get("/dashboard/summary", authenticate, AnalyticsController.getDashboardSummary);
router.get("/dashboard/trends", authenticate, validate(queryValidation.trends), AnalyticsController.getTrends);
router.get("/dashboard/category-insights", authenticate, AnalyticsController.getCategoryInsights);
router.get("/dashboard/savings-progress", authenticate, AnalyticsController.getSavingsProgress);
router.get("/dashboard/budget-status", authenticate, AnalyticsController.getBudgetStatus);
router.get("/dashboard/upcoming", authenticate, AnalyticsController.getUpcomingTransactions);

// Reports - Base path: /api/transactions/reports/*
router.get("/reports/monthly", authenticate, validate(queryValidation.monthlyReport), AnalyticsController.getMonthlyReport);
router.get("/reports/yearly", authenticate, validate(queryValidation.yearlyReport), AnalyticsController.getYearlyReport);
router.get("/reports/comparison", authenticate, validate(queryValidation.comparisonReport), AnalyticsController.getComparisonReport);
router.get("/reports/top-categories", authenticate, validate(queryValidation.topCategories), AnalyticsController.getTopCategories);
router.get("/reports/cash-flow", authenticate, AnalyticsController.getCashFlow);
router.get("/reports/savings-history", authenticate, AnalyticsController.getSavingsHistory);

// Filtering & Export - Base path: /api/transactions/*
router.get("/search", authenticate, validate(queryValidation.search), AnalyticsController.searchTransactions);
router.get("/export/transactions", authenticate, AnalyticsController.exportTransactions);
router.get("/export/budgets", authenticate, AnalyticsController.exportBudgets);

export default router;