import express from "express";
import * as transactionsController from "./transactions.controller.js";
import {
  createTransactionValidation,
  updateTransactionValidation,
  getTransactionsValidation,
  transactionIdValidation,
  searchTransactionsValidation,
} from "./transactions.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, validate(createTransactionValidation), transactionsController.createTransaction);
router.get("/", authenticate, validate(getTransactionsValidation), transactionsController.getAllTransactions);
router.get("/search", authenticate, validate(searchTransactionsValidation), transactionsController.searchTransactions);
router.get("/:id", authenticate, validate(transactionIdValidation), transactionsController.getTransactionById);
router.put("/:id", authenticate, validate(updateTransactionValidation), transactionsController.updateTransaction);
router.delete("/:id", authenticate, validate(transactionIdValidation), transactionsController.deleteTransaction);

export default router;
