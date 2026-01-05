import express from "express";
import * as analyticsController from "./analytics.controller.js";
import {
  getOverviewValidation,
  getCategoryBreakdownValidation,
  getTrendsValidation,
  getComparisonsValidation,
} from "./analytics.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/overview", authenticate, validate(getOverviewValidation), analyticsController.getOverview);
router.get("/category-breakdown", authenticate, validate(getCategoryBreakdownValidation), analyticsController.getCategoryBreakdown);
router.get("/trends", authenticate, validate(getTrendsValidation), analyticsController.getTrends);
router.get("/comparisons", authenticate, validate(getComparisonsValidation), analyticsController.getComparisons);
router.get("/monthly-summary", authenticate, analyticsController.getMonthlySummary);
router.get("/statistics", authenticate, analyticsController.getStatistics);

export default router;
