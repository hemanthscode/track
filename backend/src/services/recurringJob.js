import cron from "node-cron";
import Transaction from "../models/Transaction.js";
import logger from "../utils/logger.js";

const processRecurringTransactions = async () => {
  try {
    const now = new Date();
    logger.info("Fetching active recurring transactions due for processing", {
      timestamp: now.toISOString(),
    });

    // Find recurring transactions due now, not yet ended
    const recurringTransactions = await Transaction.find({
      isRecurring: true,
      "recurringDetails.nextOccurrence": { $lte: now },
      $or: [
        { "recurringDetails.endDate": null },
        { "recurringDetails.endDate": { $gte: now } },
      ],
    }).select(
      "userId type amount category description recurringDetails receiptImage savingsGoalId tags"
    );

    if (!recurringTransactions.length) {
      logger.info("No recurring transactions due for processing");
      return;
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const transaction of recurringTransactions) {
      try {
        // Skip if already ended (double-check)
        if (transaction.hasRecurringEnded()) {
          logger.warn(
            `Recurring transaction '${transaction._id}' has ended, skipping`,
            {
              userId: transaction.userId,
              endDate: transaction.recurringDetails.endDate,
            }
          );
          continue;
        }

        // Create a new non-recurring instance
        const newTransaction = new Transaction({
          userId: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.recurringDetails.nextOccurrence,
          isRecurring: false,
          receiptImage: transaction.receiptImage,
          savingsGoalId: transaction.savingsGoalId,
          tags: transaction.tags,
        });

        await newTransaction.save();
        logger.info(
          `Created new transaction instance '${newTransaction._id}' from recurring ID '${transaction._id}'`,
          {
            userId: transaction.userId,
            date: newTransaction.date,
          }
        );

        // Update next occurrence
        const nextOccurrence = transaction.getNextOccurrence();
        if (!nextOccurrence) {
          transaction.recurringDetails.endDate = now; // End if no more occurrences
          logger.info(
            `Recurring transaction '${transaction._id}' has reached its end`,
            {
              userId: transaction.userId,
            }
          );
        } else {
          transaction.recurringDetails.nextOccurrence = nextOccurrence;
          logger.info(
            `Updated nextOccurrence for recurring ID '${transaction._id}' to '${nextOccurrence}'`,
            {
              userId: transaction.userId,
            }
          );
        }

        await transaction.save();
        processedCount++;
      } catch (error) {
        errorCount++;
        logger.error(
          `Failed to process recurring transaction '${transaction._id}': ${error.message}`,
          {
            userId: transaction.userId,
            stack: error.stack,
          }
        );
      }
    }

    logger.info(`Recurring transaction processing completed`, {
      totalProcessed: processedCount,
      totalErrors: errorCount,
      totalFound: recurringTransactions.length,
    });
  } catch (error) {
    logger.error(
      `Critical error in recurring transaction processing: ${error.message}`,
      {
        stack: error.stack,
      }
    );
  }
};

// Schedule the job to run every day at midnight (UTC)
cron.schedule("0 0 * * *", () => {
  logger.info("Starting recurring transaction processing job", {
    timestamp: new Date().toISOString(),
  });
  processRecurringTransactions();
});

// Export for testing or manual invocation
export default processRecurringTransactions;
