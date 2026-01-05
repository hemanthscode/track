import cron from "node-cron";
import { Budget, Transaction } from "../models/index.js";
import { sendBudgetAlertEmail } from "../services/external/email.service.js";
import logger from "../utils/logger.js";

/**
 * Check budgets and send alerts if threshold exceeded
 */
export const checkBudgetAlerts = async () => {
  try {
    const budgets = await Budget.find({
      type: "budget",
      alertSent: false,
      endDate: { $gte: new Date() },
    }).populate("userId", "email username firstName");

    if (budgets.length === 0) {
      return { checked: 0, alerts: 0, errors: 0 };
    }

    let checkedCount = 0;
    let alertsSent = 0;
    let errorCount = 0;

    for (const budget of budgets) {
      try {
        checkedCount++;

        // Calculate current spending
        const transactions = await Transaction.find({
          userId: budget.userId._id,
          type: "expense",
          category: budget.category,
          date: {
            $gte: budget.startDate,
            $lte: budget.endDate || new Date(),
          },
        });

        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Update progress
        budget.progress = totalSpent;
        await budget.save();

        // Check if alert threshold reached
        if (budget.shouldSendAlert()) {
          const percentage = budget.getProgressPercentage();

          // Send email alert
          try {
            await sendBudgetAlertEmail(
              budget.userId.email,
              budget.userId.username || budget.userId.firstName,
              {
                category: budget.category,
                spent: totalSpent,
                limit: budget.amount,
                percentage,
              }
            );

            budget.alertSent = true;
            await budget.save();
            alertsSent++;

            logger.info(`Budget alert sent: ${budget.category} (${percentage}%)`);
          } catch (emailError) {
            logger.error("Failed to send budget alert", {
              budgetId: budget._id,
              error: emailError.message,
            });
            errorCount++;
          }
        }
      } catch (error) {
        errorCount++;
        logger.error("Failed to check budget", {
          budgetId: budget._id,
          error: error.message,
        });
      }
    }

    if (alertsSent > 0) {
      logger.info(`Budget alerts: ${alertsSent} sent, ${errorCount} failed`);
    }

    return { checked: checkedCount, alerts: alertsSent, errors: errorCount };
  } catch (error) {
    logger.error("Budget alert job failed", { error: error.message });
    throw error;
  }
};

/**
 * Reset expired budgets for new period
 */
export const resetExpiredBudgets = async () => {
  try {
    const now = new Date();
    const expiredBudgets = await Budget.find({
      type: "budget",
      endDate: { $lt: now },
    });

    let resetCount = 0;

    for (const budget of expiredBudgets) {
      try {
        budget.startDate = now;
        budget.progress = 0;
        budget.alertSent = false;
        await budget.save();
        resetCount++;
      } catch (error) {
        logger.error("Failed to reset budget", {
          budgetId: budget._id,
          error: error.message,
        });
      }
    }

    if (resetCount > 0) {
      logger.info(`Reset ${resetCount} expired budgets`);
    }

    return { reset: resetCount };
  } catch (error) {
    logger.error("Budget reset job failed", { error: error.message });
    throw error;
  }
};

/**
 * Schedule budget alert job
 */
export const scheduleBudgetAlertJob = () => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    await checkBudgetAlerts();
  });

  // Run budget reset daily at 1:00 AM
  cron.schedule("0 1 * * *", async () => {
    await resetExpiredBudgets();
  });

  logger.info("⏰ Budget jobs scheduled");
};

export default { checkBudgetAlerts, resetExpiredBudgets, scheduleBudgetAlertJob };
