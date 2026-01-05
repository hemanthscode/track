import express from "express";
import * as receiptsController from "./receipts.controller.js";
import {
  uploadReceiptValidation,
  receiptIdValidation,
  linkReceiptValidation,
} from "./receipts.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { uploadSingle, handleUploadError } from "../../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/", authenticate, uploadSingle, handleUploadError, validate(uploadReceiptValidation), receiptsController.uploadReceipt);
router.get("/", authenticate, receiptsController.getAllReceipts);
router.get("/:id", authenticate, validate(receiptIdValidation), receiptsController.getReceiptById);
router.post("/:id/link", authenticate, validate(linkReceiptValidation), receiptsController.linkReceiptToTransaction);
router.post("/:id/unlink", authenticate, validate(receiptIdValidation), receiptsController.unlinkReceiptFromTransaction);
router.delete("/:id", authenticate, validate(receiptIdValidation), receiptsController.deleteReceipt);
router.post("/:id/retry-ocr", authenticate, validate(receiptIdValidation), receiptsController.retryOCRProcessing);

export default router;
