import express from "express";
import * as TransactionController from "../../controllers/transactions/transactionController.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { idValidation, transactionValidation, queryValidation } from "../../utils/validations.js";

const router = express.Router();

// Base path: /api/transactions
router.post("/", authenticate, validate(transactionValidation()), TransactionController.createTransaction);
router.get("/", authenticate, validate(queryValidation.transactions), TransactionController.getAllTransactions);
router.get("/:id", authenticate, validate(idValidation), TransactionController.getTransactionById);
router.put("/:id", authenticate, validate([...idValidation, ...transactionValidation(true)]), TransactionController.updateTransaction);
router.delete("/:id", authenticate, validate(idValidation), TransactionController.deleteTransaction);

export default router;