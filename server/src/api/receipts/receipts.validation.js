import { param, body } from "express-validator";

export const uploadReceiptValidation = [
  body("transactionId")
    .optional()
    .isMongoId()
    .withMessage("Invalid transaction ID"),
];

export const receiptIdValidation = [
  param("id").isMongoId().withMessage("Invalid receipt ID"),
];

export const linkReceiptValidation = [
  param("id").isMongoId().withMessage("Invalid receipt ID"),

  body("transactionId")
    .isMongoId()
    .withMessage("Invalid transaction ID"),
];
