import cron from "node-cron";
import { Transaction } from "../models/index.js";
import logger from "../utils/logger.js";

/**
 * Process recurring transactions due for execution
 */
export const processRecurringTransactions = async () => {
  const now = new Date();

  try {
    // Find all due recurring transactions
    const dueTransactions = await Transaction.find({
      isRecurring: true,
      "recurringDetails.nextOccurrence": { $lte: now },
      $or: [
        { "recurringDetails.endDate": null },
        { "recurringDetails.endDate": { $gte: now } },
      ],
    }).select(
      "userId type amount category description recurringDetails receiptId savingsGoalId tags metadata"
    );

    if (dueTransactions.length === 0) {
      return { processed: 0, errors: 0 };
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const recurring of dueTransactions) {
      try {
        // Check if already ended
        if (recurring.hasRecurringEnded()) {
          continue;
        }

        // Create new transaction instance
        await Transaction.create({
          userId: recurring.userId,
          type: recurring.type,
          amount: recurring.amount,
          category: recurring.category,
          description: recurring.description,
          date: recurring.recurringDetails.nextOccurrence,
          isRecurring: false,
          receiptId: recurring.receiptId,
          savingsGoalId: recurring.savingsGoalId,
          tags: [...recurring.tags],
          metadata: { ...recurring.metadata },
        });

        // Calculate next occurrence
        const nextOccurrence = recurring.getNextOccurrence();

        if (!nextOccurrence) {
          // Series ended
          recurring.recurringDetails.endDate = now;
          await recurring.save();
        } else {
          // Update next occurrence
          recurring.recurringDetails.nextOccurrence = nextOccurrence;
          await recurring.save();
        }

        processedCount++;
      } catch (error) {
        errorCount++;
        logger.error("Failed to process recurring transaction", {
          recurringId: recurring._id,
          error: error.message,
        });
      }
    }

    if (processedCount > 0) {
      logger.info(`Recurring: ${processedCount} processed, ${errorCount} failed`);
    }

    return { processed: processedCount, errors: errorCount };
  } catch (error) {
    logger.error("Recurring transaction job failed", { error: error.message });
    throw error;
  }
};

/**
 * Schedule recurring transaction job
 */
export const scheduleRecurringTransactionJob = () => {
  // Run daily at 00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    await processRecurringTransactions();
  });

  logger.info("⏰ Recurring job scheduled (daily 00:00)");
};

export default { processRecurringTransactions, scheduleRecurringTransactionJob };
