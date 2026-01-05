import express from "express";
import * as aiController from "./ai.controller.js";
import {
  categorizationValidation,
  insightsValidation,
  chatValidation,
  budgetRecommendationValidation,
} from "./ai.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/categorize", authenticate, validate(categorizationValidation), aiController.categorize);
router.post("/insights", authenticate, validate(insightsValidation), aiController.getInsights);
router.post("/budget-recommendations", authenticate, validate(budgetRecommendationValidation), aiController.getBudgetRecommendations);
router.post("/chat", authenticate, validate(chatValidation), aiController.chat);
router.post("/bulk-categorize", authenticate, aiController.bulkCategorize);

export default router;
