// routes/transactions/recurringRoutes.js
import express from "express";
import * as RecurringController from "../../controllers/transactions/recurringController.js";
import { authenticate } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import {
  idValidation,
  transactionValidation,
  recurringDetailsValidation,
} from "../../utils/validations.js";

const router = express.Router();

// Base path: /api/transactions/recurring
router
  .route("/")
  .post(
    authenticate,
    validate([...transactionValidation(), ...recurringDetailsValidation()]),
    RecurringController.createRecurringTransaction
  )
  .get(authenticate, RecurringController.getAllRecurringTransactions);

router
  .route("/:id")
  .put(
    authenticate,
    validate([...idValidation, ...recurringDetailsValidation(true)]),
    RecurringController.updateRecurringTransaction
  )
  .delete(
    authenticate,
    validate(idValidation),
    RecurringController.cancelRecurringTransaction
  );

export default router;
