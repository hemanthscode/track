import { scheduleRecurringTransactionJob } from "./recurringTransactions.job.js";
import { scheduleBudgetAlertJob } from "./budgetAlerts.job.js";
import logger from "../utils/logger.js";

/**
 * Initialize all background jobs
 */
export const initializeJobs = () => {
  try {
    scheduleRecurringTransactionJob();
    scheduleBudgetAlertJob();
    logger.info("✅ Background jobs started");
  } catch (error) {
    logger.error("Failed to initialize jobs", { error: error.message });
    throw error;
  }
};

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
