import cron from "node-cron";
import { Transaction } from "../models/index.js";
import logger from "../utils/logger.js";

/**
 * Process recurring transactions due today
 */
const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    logger.info("Starting recurring transaction processing", {
      timestamp: now.toISOString(),
    });

    // Find recurring transactions due now
    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      "recurringDetails.nextOccurrence": { $lte: now },
      $or: [
        { "recurringDetails.endDate": null },
        { "recurringDetails.endDate": { $gte: now } },
      ],
    });

    if (!recurringTransactions.length) {
      logger.info("No recurring transactions due for processing");
      return;
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const transaction of recurringTransactions) {
      try {
        // Check if already ended
        if (transaction.hasRecurringEnded()) {
          logger.warn("Skipping ended recurring transaction", {
            transactionId: transaction._id,
          });
          continue;
        }

        // Create new transaction instance
        const newTransaction = new Transaction({
          userId: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.recurringDetails.nextOccurrence,
          isRecurring: false,
          receiptId: transaction.receiptId,
          savingsGoalId: transaction.savingsGoalId,
          tags: transaction.tags,
          metadata: transaction.metadata,
        });

        await newTransaction.save();

        logger.info("Created transaction instance", {
          originalId: transaction._id,
          newId: newTransaction._id,
          amount: newTransaction.amount,
        });

        // Update next occurrence
        const nextOccurrence = transaction.getNextOccurrence();

        if (!nextOccurrence) {
          transaction.recurringDetails.endDate = now;
          logger.info("Recurring transaction ended", {
            transactionId: transaction._id,
          });
        } else {
          transaction.recurringDetails.nextOccurrence = nextOccurrence;
          logger.debug("Updated next occurrence", {
            transactionId: transaction._id,
            nextOccurrence,
          });
        }

        await transaction.save();
        processedCount++;
      } catch (error) {
        errorCount++;
        logger.error("Failed to process recurring transaction", {
          transactionId: transaction._id,
          error: error.message,
          stack: error.stack,
        });
      }
    }

    logger.info("Recurring transaction processing completed", {
      totalFound: recurringTransactions.length,
      processed: processedCount,
      errors: errorCount,
    });
  } catch (error) {
    logger.error("Critical error in recurring job", {
      error: error.message,
      stack: error.stack,
    });
  }
};

/**
 * Schedule cron job - runs daily at midnight
 */
export const startRecurringJob = () => {
  cron.schedule("0 0 * * *", () => {
    logger.info("Recurring transaction job triggered");
    processRecurringTransactions();
  });

  logger.info("Recurring transaction job scheduled (daily at midnight)");
};

// Export for manual testing
export { processRecurringTransactions };

export default { startRecurringJob, processRecurringTransactions };
