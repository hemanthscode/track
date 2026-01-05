import { scheduleRecurringTransactionJob } from "./recurringTransactions.job.js";
import { scheduleBudgetAlertJob } from "./budgetAlerts.job.js";
import logger from "../utils/logger.js";

/**
 * Initialize all background jobs
 */
export const initializeJobs = () => {
  try {
    logger.info("Initializing background jobs...");

    // Schedule recurring transactions job
    scheduleRecurringTransactionJob();

    // Schedule budget alerts job
    scheduleBudgetAlertJob();

    logger.info("All background jobs initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize background jobs", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Export individual job functions for manual testing
export {
  processRecurringTransactions,
  scheduleRecurringTransactionJob,
} from "./recurringTransactions.job.js";

export {
  checkBudgetAlerts,
  resetExpiredBudgets,
  scheduleBudgetAlertJob,
} from "./budgetAlerts.job.js";

export default { initializeJobs };
