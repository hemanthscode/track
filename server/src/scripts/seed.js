import mongoose from "mongoose";
import { User, Transaction, Budget } from "../models/index.js";
import { config } from "../config/env.js";
import logger from "../utils/logger.js";
import {
  TRANSACTION_TYPES,
  TRANSACTION_CATEGORIES,
  RECURRING_FREQUENCIES,
  BUDGET_TYPES,
  BUDGET_PERIODS,
} from "../config/constants.js";
import {
  subMonths,
  addMonths,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";

// ---------- HELPERS ----------

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomAmount = (min, max) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

// ---------- USERS (VALIDATIONS: username/email/password lengths, uniqueness) ----------

const usersSeed = [
  {
    username: "admin",
    email: "admin@expensetracker.com",
    password: "Admin@123456",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isEmailVerified: true,
    isActive: true,
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "John@123456",
    firstName: "John",
    lastName: "Doe",
    role: "user",
    isEmailVerified: true,
    isActive: true,
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "Jane@123456",
    firstName: "Jane",
    lastName: "Smith",
    role: "user",
    isEmailVerified: true,
    isActive: true,
  },
];

// ---------- TRANSACTIONS (OBEYING TRANSACTION_TYPES & TRANSACTION_CATEGORIES) ----------

const expenseDescriptionsByCategory = {
  food: [
    "Lunch at restaurant",
    "Grocery shopping",
    "Snacks from supermarket",
    "Dinner with friends",
  ],
  housing: [
    "Monthly rent",
    "Maintenance charges",
    "Home repair",
  ],
  transport: [
    "Bus pass",
    "Cab ride",
    "Fuel for bike",
  ],
  utilities: [
    "Electricity bill",
    "Water bill",
    "Internet bill",
    "Mobile recharge",
  ],
  entertainment: [
    "Netflix subscription",
    "Movie tickets",
    "Concert",
  ],
  health: [
    "Doctor visit",
    "Medicines",
    "Health checkup",
  ],
  education: [
    "Online course",
    "Books purchase",
    "Exam fees",
  ],
  shopping: [
    "Clothing shopping",
    "Electronics purchase",
    "Amazon order",
  ],
  subscriptions: [
    "Spotify subscription",
    "YouTube premium",
    "Cloud storage subscription",
  ],
  travel: [
    "Train ticket",
    "Hotel booking",
    "Cab at destination",
  ],
  insurance: [
    "Health insurance premium",
    "Vehicle insurance",
  ],
  debt: [
    "Credit card bill payment",
    "Loan EMI",
  ],
  miscellaneous: [
    "Gift purchase",
    "Donation",
    "Unexpected expense",
  ],
};

const incomeDescriptionsByCategory = {
  salary: [
    "Monthly salary credit",
    "Salary bonus",
  ],
  freelance: [
    "Freelance project payment",
    "Consulting fees",
  ],
  investment: [
    "FD interest",
    "Mutual fund redemption",
  ],
  gift: [
    "Cash gift from family",
    "Birthday gift money",
  ],
  other: [
    "Refund from vendor",
    "Cashback received",
  ],
};

const buildRandomExpense = (userId, startDate, endDate) => {
  const category = randomItem(TRANSACTION_CATEGORIES.EXPENSE);
  const description = randomItem(expenseDescriptionsByCategory[category]);

  return {
    userId,
    type: TRANSACTION_TYPES.EXPENSE,
    category,
    description,
    amount: randomAmount(50, 5000),
    date: randomDate(startDate, endDate),
    isRecurring: false,
    tags: [category],
    metadata: {
      merchant: "",
      paymentMethod: "UPI",
      notes: "seed-expense",
    },
  };
};

const buildRandomIncome = (userId, startDate, endDate) => {
  const category = randomItem(TRANSACTION_CATEGORIES.INCOME);
  const description = randomItem(incomeDescriptionsByCategory[category]);

  return {
    userId,
    type: TRANSACTION_TYPES.INCOME,
    category,
    description,
    amount: randomAmount(5000, 100000),
    date: randomDate(startDate, endDate),
    isRecurring: false,
    tags: [category],
    metadata: {
      merchant: "",
      paymentMethod: "Bank transfer",
      notes: "seed-income",
    },
  };
};

// ---------- RECURRING TRANSACTIONS (OBEYING RECURRING_FREQUENCIES) ----------

const recurringSeed = (userId, now) => {
  const start = startOfMonth(now);

  return [
    {
      userId,
      type: TRANSACTION_TYPES.EXPENSE,
      category: "utilities",
      description: "Monthly electricity bill",
      amount: 1500,
      date: start,
      isRecurring: true,
      recurringDetails: {
        frequency: RECURRING_FREQUENCIES.MONTHLY,
        startDate: start,
        endDate: endOfMonth(addMonths(now, 12)),
        nextOccurrence: startOfMonth(addMonths(now, 1)),
      },
      tags: ["recurring", "utilities"],
      metadata: { notes: "seed-recurring" },
    },
    {
      userId,
      type: TRANSACTION_TYPES.EXPENSE,
      category: "subscriptions",
      description: "Netflix subscription",
      amount: 649,
      date: start,
      isRecurring: true,
      recurringDetails: {
        frequency: RECURRING_FREQUENCIES.MONTHLY,
        startDate: start,
        endDate: endOfMonth(addMonths(now, 12)),
        nextOccurrence: startOfMonth(addMonths(now, 1)),
      },
      tags: ["recurring", "subscriptions"],
      metadata: { notes: "seed-recurring" },
    },
    {
      userId,
      type: TRANSACTION_TYPES.INCOME,
      category: "salary",
      description: "Monthly salary",
      amount: 80000,
      date: start,
      isRecurring: true,
      recurringDetails: {
        frequency: RECURRING_FREQUENCIES.MONTHLY,
        startDate: start,
        endDate: null, // allowed
        nextOccurrence: startOfMonth(addMonths(now, 1)),
      },
      tags: ["recurring", "salary"],
      metadata: { notes: "seed-recurring" },
    },
  ];
};

// ---------- BUDGETS (OBEYING BUDGET_TYPES, BUDGET_PERIODS & CATEGORY RULES) ----------

const budgetSeed = (userId, now) => {
  const monthlyStart = startOfMonth(now);
  const monthlyEnd = endOfMonth(now);

  return [
    // Budget type -> must have EXPENSE category
    {
      userId,
      type: BUDGET_TYPES.BUDGET,
      category: "food",
      amount: 10000,
      period: BUDGET_PERIODS.MONTHLY,
      startDate: monthlyStart,
      // endDate auto-filled by schema using period, can omit to use default,
      description: "Monthly food budget",
      alertThreshold: 80,
      progress: 0,
      alertSent: false,
    },
    {
      userId,
      type: BUDGET_TYPES.BUDGET,
      category: "transport",
      amount: 5000,
      period: BUDGET_PERIODS.MONTHLY,
      startDate: monthlyStart,
      description: "Monthly transport budget",
      alertThreshold: 75,
      progress: 0,
      alertSent: false,
    },
    {
      userId,
      type: BUDGET_TYPES.BUDGET,
      category: "shopping",
      amount: 8000,
      period: BUDGET_PERIODS.MONTHLY,
      startDate: monthlyStart,
      description: "Shopping control budget",
      alertThreshold: 85,
      progress: 0,
      alertSent: false,
    },
    // Savings type -> category optional/ignored, amount required, period required
    {
      userId,
      type: BUDGET_TYPES.SAVINGS,
      category: undefined, // ignored by validator when type === SAVINGS
      amount: 100000,
      period: BUDGET_PERIODS.YEARLY,
      startDate: monthlyStart,
      description: "Emergency fund savings goal",
      alertThreshold: 90,
      progress: 30000,
      alertSent: false,
    },
  ];
};

// ---------- MAIN SEED FUNCTION ----------

const seedDatabase = async () => {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🌱 STARTING DATABASE SEEDING");
    console.log("=".repeat(60) + "\n");

    await mongoose.connect(config.database.uri);
    logger.info("Connected to MongoDB");

    console.log("🗑️  Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
    ]);
    logger.info("Existing data cleared");

    // Users
    console.log("\n👥 Creating users...");
    const createdUsers = [];
    for (const u of usersSeed) {
      const user = await User.create(u); // pre-save hook hashes password
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${user.email} (${user.role})`);
    }
    logger.info(`Created ${createdUsers.length} users`);

    const mainUser = createdUsers.find((u) => u.email === "john@example.com");
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 6);

    // Transactions
    console.log("\n💰 Creating transactions (last 6 months)...");
    const txDocs = [];

    // 160 expenses + 60 income = 220 total
    for (let i = 0; i < 160; i++) {
      txDocs.push(buildRandomExpense(mainUser._id, sixMonthsAgo, now));
    }
    for (let i = 0; i < 60; i++) {
      txDocs.push(buildRandomIncome(mainUser._id, sixMonthsAgo, now));
    }

    // Edge-case transactions within constraints
    txDocs.push(
      {
        userId: mainUser._id,
        type: TRANSACTION_TYPES.EXPENSE,
        category: "food",
        description: "Very old expense (valid category)",
        amount: 500,
        date: subMonths(now, 12), // allowed
        isRecurring: false,
        tags: ["old"],
        metadata: { notes: "edge-old" },
      },
      {
        userId: mainUser._id,
        type: TRANSACTION_TYPES.INCOME,
        category: "salary",
        description: "Future salary payment",
        amount: 90000,
        date: addDays(now, 3), // allowed
        isRecurring: false,
        tags: ["future"],
        metadata: { notes: "edge-future" },
      },
      {
        userId: mainUser._id,
        type: TRANSACTION_TYPES.EXPENSE,
        category: "shopping",
        description: "High-value laptop purchase",
        amount: 95000,
        date: subDays(now, 5),
        isRecurring: false,
        tags: ["electronics"],
        metadata: { notes: "edge-large-expense" },
      },
      {
        userId: mainUser._id,
        type: TRANSACTION_TYPES.INCOME,
        category: "investment",
        description: "Large stock profit",
        amount: 150000,
        date: subDays(now, 8),
        isRecurring: false,
        tags: ["investment"],
        metadata: { notes: "edge-large-income" },
      },
      {
        userId: mainUser._id,
        type: TRANSACTION_TYPES.EXPENSE,
        category: "food",
        description: "Tea at canteen",
        amount: 20,
        date: subDays(now, 1),
        isRecurring: false,
        tags: ["small"],
        metadata: { notes: "edge-small-expense" },
      }
    );

    const createdTx = await Transaction.insertMany(txDocs);
    console.log(`   ✓ Created ${createdTx.length} transactions`);

    // Recurring transactions
    console.log("\n🔁 Creating recurring transactions...");
    const recurringDocs = recurringSeed(mainUser._id, now);
    const createdRecurring = await Transaction.insertMany(recurringDocs);
    console.log(`   ✓ Created ${createdRecurring.length} recurring templates`);

    // Budgets & savings (Budget model handles defaults & validation)
    console.log("\n📊 Creating budgets & savings...");
    const budgetDocs = budgetSeed(mainUser._id, now);
    const createdBudgets = await Budget.insertMany(budgetDocs);
    console.log(`   ✓ Created ${createdBudgets.length} budget/savings records`);

    console.log("\n" + "=".repeat(60));
    console.log("📈 SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`Users:                ${createdUsers.length}`);
    console.log(`Transactions:         ${createdTx.length}`);
    console.log(`Recurring templates:  ${createdRecurring.length}`);
    console.log(`Budgets/Savings:      ${createdBudgets.length}`);
    console.log("=".repeat(60));

    console.log("\n🔑 TEST LOGINS:");
    usersSeed.forEach((u) => {
      console.log(`📧 ${u.email}`);
      console.log(`🔒 ${u.password}`);
      console.log("-".repeat(40));
    });

    await mongoose.connection.close();
    console.log("\n✅ Seeding completed successfully\n");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Error seeding database:", err);
    logger.error("Seeding failed", { error: err.message, stack: err.stack });
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
