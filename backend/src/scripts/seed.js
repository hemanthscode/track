import connectDB from "../config/database.js";
import Transaction from "../models/Transaction.js";
import Budget from "../models/Budget.js";
import {
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";

(async () => {
  try {
    await connectDB();

    // Replace with an existing user ID from your database
    const userId = "67cbc505b811a6685e1b0b5c"; // Example user ID (ensure this exists in your DB)

    // Clear existing data
    await Promise.all([
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
    ]);
    console.log("Existing data cleared");

    // Budgets Data (Spending Limits and Savings Goals)
    const budgets = [
      {
        userId,
        type: "budget",
        category: "food",
        amount: 200,
        period: "monthly",
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        progress: 95, // Within limit
        description: "Monthly food budget",
      },
      {
        userId,
        type: "budget",
        category: "entertainment",
        amount: 100,
        period: "monthly",
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        progress: 40,
        description: "Entertainment budget",
      },
      {
        userId,
        type: "budget",
        category: "utilities",
        amount: 150,
        period: "monthly",
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        progress: 130,
        description: "Utilities budget",
      },
      {
        userId,
        type: "savings",
        amount: 1000,
        period: "yearly",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        progress: 300, // Partial progress
        description: "Vacation savings goal",
      },
      {
        userId,
        type: "savings",
        amount: 500,
        period: "monthly",
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        progress: 150,
        description: "Emergency fund",
      },
    ];

    // Insert Budgets First (to get IDs for savingsGoalId)
    const insertedBudgets = await Budget.insertMany(budgets);
    console.log(`${insertedBudgets.length} budgets seeded`);

    const vacationGoalId = insertedBudgets.find(
      (b) => b.description === "Vacation savings goal"
    )._id;
    const emergencyFundId = insertedBudgets.find(
      (b) => b.description === "Emergency fund"
    )._id;

    // Transactions Data
    const transactions = [
      // Income Transactions
      {
        userId,
        type: "income",
        amount: 3000,
        category: "salary",
        description: "Monthly salary",
        date: startOfMonth(new Date()),
      },
      {
        userId,
        type: "income",
        amount: 500,
        category: "freelance",
        description: "Freelance project payment",
        date: subMonths(new Date(), 1),
      },
      {
        userId,
        type: "income",
        amount: 200,
        category: "investment",
        description: "Dividend payout",
        date: new Date(),
      },
      {
        userId,
        type: "income",
        amount: 2800,
        category: "salary",
        description: "Previous month salary",
        date: subMonths(startOfMonth(new Date()), 1),
      },
      {
        userId,
        type: "income",
        amount: 300,
        category: "freelance",
        description: "Side gig payment",
        date: subMonths(new Date(), 2),
      },

      // Expense Transactions
      {
        userId,
        type: "expense",
        amount: 800,
        category: "housing",
        description: "Rent payment",
        date: startOfMonth(new Date()),
      },
      {
        userId,
        type: "expense",
        amount: 50,
        category: "food",
        description: "Grocery shopping",
        date: subMonths(new Date(), 2),
      },
      {
        userId,
        type: "expense",
        amount: 30,
        category: "transport",
        description: "Bus fare",
        date: new Date(),
      },
      {
        userId,
        type: "expense",
        amount: 120,
        category: "utilities",
        description: "Electricity bill",
        date: subMonths(new Date(), 1),
      },
      {
        userId,
        type: "expense",
        amount: 15,
        category: "entertainment",
        description: "Movie ticket",
        date: addDays(new Date(), -5),
      },
      {
        userId,
        type: "expense",
        amount: 60,
        category: "health",
        description: "Pharmacy purchase",
        date: subMonths(new Date(), 3),
      },
      {
        userId,
        type: "expense",
        amount: 10,
        category: "miscellaneous",
        description: "Coffee",
        date: addDays(new Date(), -2),
      },
      {
        userId,
        type: "expense",
        amount: 45,
        category: "food",
        description: "Dinner out",
        date: subMonths(new Date(), 1),
      },
      {
        userId,
        type: "expense",
        amount: 25,
        category: "entertainment",
        description: "Concert ticket",
        date: subMonths(new Date(), 2),
      },
      {
        userId,
        type: "expense",
        amount: 90,
        category: "utilities",
        description: "Water bill",
        date: subMonths(new Date(), 1),
      },
      {
        userId,
        type: "expense",
        amount: 150,
        category: "housing",
        description: "Maintenance fee",
        date: subMonths(new Date(), 2),
      },
      {
        userId,
        type: "expense",
        amount: 40,
        category: "miscellaneous",
        description: "Gift purchase",
        date: addDays(new Date(), -10),
      },

      // Recurring Transactions
      {
        userId,
        type: "expense",
        amount: 100,
        category: "subscriptions",
        description: "Netflix subscription",
        isRecurring: true,
        recurringDetails: {
          frequency: "monthly",
          nextOccurrence: addDays(new Date(), 25),
          endDate: addMonths(new Date(), 6), // Active for 6 months
        },
        date: startOfMonth(new Date()),
      },
      {
        userId,
        type: "expense",
        amount: 50,
        category: "utilities",
        description: "Internet bill",
        isRecurring: true,
        recurringDetails: {
          frequency: "monthly",
          nextOccurrence: addDays(new Date(), 10),
        },
        date: startOfMonth(new Date()),
      },
      {
        userId,
        type: "expense",
        amount: 20,
        category: "transport",
        description: "Monthly bus pass",
        isRecurring: true,
        recurringDetails: {
          frequency: "monthly",
          nextOccurrence: addDays(new Date(), 15),
        },
        date: startOfMonth(new Date()),
      },

      // Transactions Linked to Savings Goals
      {
        userId,
        type: "expense",
        amount: 100,
        category: "miscellaneous",
        description: "Contribution to vacation fund",
        savingsGoalId: vacationGoalId,
        date: addDays(new Date(), -15),
      },
      {
        userId,
        type: "expense",
        amount: 50,
        category: "miscellaneous",
        description: "Emergency fund contribution",
        savingsGoalId: emergencyFundId,
        date: addDays(new Date(), -7),
      },
    ];

    // Insert Transactions
    await Transaction.insertMany(transactions);
    console.log(`${transactions.length} transactions seeded`);

    console.log("Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
})();
