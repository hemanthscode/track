// routes/index.js
import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import transactionRoutes from "./transactions/transactionRoutes.js";
import recurringRoutes from "./transactions/recurringRoutes.js";
import budgetRoutes from "./transactions/budgetRoutes.js";
import analyticsRoutes from "./transactions/analyticsRoutes.js";

const router = express.Router();

// Mount specific sub-routes first
router.use("/transactions/recurring", recurringRoutes);  // /api/transactions/recurring/*
router.use("/transactions/budgets", budgetRoutes);       // /api/transactions/budgets/*
router.use("/transactions", analyticsRoutes);            // /api/transactions/dashboard/*, etc.
router.use("/transactions", transactionRoutes);          // /api/transactions/* (catch-all, so last)

// Other routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

export default router;