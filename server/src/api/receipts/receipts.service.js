import { Receipt, Transaction } from "../../models/index.js";
import { uploadImage, deleteImage } from "../../services/external/cloudinary.service.js";
import { extractReceiptData } from "../../services/external/ocr.service.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";
import fs from "fs/promises";

/**
 * Upload receipt with OCR processing
 */
export const uploadReceipt = async (userId, file, transactionId = null) => {
  try {
    if (!file) {
      throw ApiError.badRequest("Receipt file is required");
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file.path);

    // Create receipt record
    const receipt = await Receipt.create({
      userId,
      transactionId,
      cloudinaryId: uploadResult.cloudinaryId,
      imageUrl: uploadResult.imageUrl,
      thumbnailUrl: uploadResult.thumbnailUrl,
      originalFilename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      processingStatus: "processing",
    });

    // Process OCR in background (don't await)
    processReceiptOCR(receipt._id, uploadResult.imageUrl).catch((error) => {
      logger.error("OCR processing failed", {
        receiptId: receipt._id,
        error: error.message,
      });
    });

    logger.info("Receipt uploaded", {
      userId,
      receiptId: receipt._id,
      transactionId,
    });

    return receipt;
  } catch (error) {
    logger.error("Failed to upload receipt", { userId, error: error.message });
    throw error;
  }
};

/**
 * Process receipt OCR (async background task)
 */
const processReceiptOCR = async (receiptId, imageUrl) => {
  try {
    const receipt = await Receipt.findById(receiptId);

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Extract data using Groq Vision
    const ocrData = await extractReceiptData(imageUrl);

    // Update receipt with OCR data
    receipt.ocrData = ocrData;
    receipt.processingStatus = "completed";
    await receipt.save();

    logger.info("Receipt OCR completed", {
      receiptId,
      merchant: ocrData.merchant,
      amount: ocrData.amount,
    });
  } catch (error) {
    // Mark as failed
    await Receipt.findByIdAndUpdate(receiptId, {
      processingStatus: "failed",
      processingError: error.message,
    });

    logger.error("Receipt OCR failed", { receiptId, error: error.message });
  }
};

/**
 * Get all receipts
 */
export const getAllReceipts = async (userId, filters = {}) => {
  try {
    const { processingStatus } = filters;

    const query = { userId };
    if (processingStatus) {
      query.processingStatus = processingStatus;
    }

    const receipts = await Receipt.find(query)
      .sort({ createdAt: -1 })
      .populate("transactionId", "type amount category description date")
      .lean();

    return receipts;
  } catch (error) {
    logger.error("Failed to get receipts", { userId, error: error.message });
    throw error;
  }
};

/**
 * Get receipt by ID
 */
export const getReceiptById = async (userId, receiptId) => {
  try {
    const receipt = await Receipt.findOne({
      _id: receiptId,
      userId,
    }).populate("transactionId", "type amount category description date");

    if (!receipt) {
      throw ApiError.notFound("Receipt not found");
    }

    return receipt;
  } catch (error) {
    logger.error("Failed to get receipt", { receiptId, error: error.message });
    throw error;
  }
};

/**
 * Link receipt to transaction
 */
export const linkReceiptToTransaction = async (userId, receiptId, transactionId) => {
  try {
    const [receipt, transaction] = await Promise.all([
      Receipt.findOne({ _id: receiptId, userId }),
      Transaction.findOne({ _id: transactionId, userId }),
    ]);

    if (!receipt) {
      throw ApiError.notFound("Receipt not found");
    }

    if (!transaction) {
      throw ApiError.notFound("Transaction not found");
    }

    if (receipt.transactionId) {
      throw ApiError.badRequest("Receipt is already linked to a transaction");
    }

    // Link receipt to transaction
    receipt.transactionId = transactionId;
    await receipt.save();

    // Update transaction with receipt ID
    transaction.receiptId = receiptId;
    await transaction.save();

    logger.info("Receipt linked to transaction", {
      userId,
      receiptId,
      transactionId,
    });

    return receipt;
  } catch (error) {
    logger.error("Failed to link receipt", {
      receiptId,
      transactionId,
      error: error.message,
    });
    throw error;
  }
};

/**
 * Unlink receipt from transaction
 */
export const unlinkReceiptFromTransaction = async (userId, receiptId) => {
  try {
    const receipt = await Receipt.findOne({ _id: receiptId, userId });

    if (!receipt) {
      throw ApiError.notFound("Receipt not found");
    }

    if (!receipt.transactionId) {
      throw ApiError.badRequest("Receipt is not linked to any transaction");
    }

    // Update transaction to remove receipt reference
    await Transaction.findByIdAndUpdate(receipt.transactionId, {
      receiptId: null,
    });

    // Unlink receipt
    receipt.transactionId = null;
    await receipt.save();

    logger.info("Receipt unlinked from transaction", { userId, receiptId });

    return receipt;
  } catch (error) {
    logger.error("Failed to unlink receipt", { receiptId, error: error.message });
    throw error;
  }
};

/**
 * Delete receipt
 */
export const deleteReceipt = async (userId, receiptId) => {
  try {
    const receipt = await Receipt.findOne({ _id: receiptId, userId });

    if (!receipt) {
      throw ApiError.notFound("Receipt not found");
    }

    // Delete from Cloudinary
    await deleteImage(receipt.cloudinaryId);

    // Unlink from transaction if linked
    if (receipt.transactionId) {
      await Transaction.findByIdAndUpdate(receipt.transactionId, {
        receiptId: null,
      });
    }

    // Delete receipt record
    await Receipt.deleteOne({ _id: receiptId });

    logger.info("Receipt deleted", { userId, receiptId });

    return true;
  } catch (error) {
    logger.error("Failed to delete receipt", { receiptId, error: error.message });
    throw error;
  }
};

/**
 * Retry OCR processing
 */
export const retryOCRProcessing = async (userId, receiptId) => {
  try {
    const receipt = await Receipt.findOne({ _id: receiptId, userId });

    if (!receipt) {
      throw ApiError.notFound("Receipt not found");
    }

    if (receipt.processingStatus === "completed") {
      throw ApiError.badRequest("Receipt has already been processed successfully");
    }

    // Reset status
    receipt.processingStatus = "processing";
    receipt.processingError = null;
    await receipt.save();

    // Retry OCR
    processReceiptOCR(receiptId, receipt.imageUrl).catch((error) => {
      logger.error("OCR retry failed", { receiptId, error: error.message });
    });

    logger.info("OCR processing retry initiated", { userId, receiptId });

    return receipt;
  } catch (error) {
    logger.error("Failed to retry OCR", { receiptId, error: error.message });
    throw error;
  }
};

export default {
  uploadReceipt,
  getAllReceipts,
  getReceiptById,
  linkReceiptToTransaction,
  unlinkReceiptFromTransaction,
  deleteReceipt,
  retryOCRProcessing,
};
