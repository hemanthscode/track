import * as analyticsService from "./analytics.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   GET /api/analytics/overview
 * @desc    Get financial overview
 * @access  Private
 */
export const getOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsService.getOverview(req.user._id, req.query);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    overview,
    "Financial overview retrieved successfully"
  );
});

/**
 * @route   GET /api/analytics/category-breakdown
 * @desc    Get spending by category
 * @access  Private
 */
export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await analyticsService.getCategoryBreakdown(
    req.user._id,
    req.query
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { categories: breakdown, count: breakdown.length },
    `Category breakdown retrieved (${breakdown.length} categories)`
  );
});

/**
 * @route   GET /api/analytics/trends
 * @desc    Get spending trends over time
 * @access  Private
 */
export const getTrends = asyncHandler(async (req, res) => {
  const trends = await analyticsService.getTrends(req.user._id, req.query);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { trends, count: trends.length },
    `Trends retrieved (${trends.length} data points)`
  );
});

/**
 * @route   GET /api/analytics/comparisons
 * @desc    Compare current vs previous period
 * @access  Private
 */
export const getComparisons = asyncHandler(async (req, res) => {
  const comparison = await analyticsService.getComparisons(
    req.user._id,
    req.query.period
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    comparison,
    "Period comparison retrieved successfully"
  );
});

/**
 * @route   GET /api/analytics/monthly-summary
 * @desc    Get monthly summary
 * @access  Private
 */
export const getMonthlySummary = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const summary = await analyticsService.getMonthlySummary(
    req.user._id,
    year,
    month
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    summary,
    `Monthly summary for ${summary.month} retrieved`
  );
});

/**
 * @route   GET /api/analytics/statistics
 * @desc    Get user statistics
 * @access  Private
 */
export const getStatistics = asyncHandler(async (req, res) => {
  const statistics = await analyticsService.getStatistics(req.user._id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    statistics,
    "Statistics retrieved successfully"
  );
});

export default {
  getOverview,
  getCategoryBreakdown,
  getTrends,
  getComparisons,
  getMonthlySummary,
  getStatistics,
};
