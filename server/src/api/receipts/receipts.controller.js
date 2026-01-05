import * as receiptsService from "./receipts.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { HTTP_STATUS } from "../../config/constants.js";

/**
 * @route   POST /api/receipts
 * @desc    Upload receipt
 * @access  Private
 */
export const uploadReceipt = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const receipt = await receiptsService.uploadReceipt(
    req.user._id,
    req.file,
    transactionId
  );

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    { receipt },
    "Receipt uploaded successfully. OCR processing in progress..."
  );
});

/**
 * @route   GET /api/receipts
 * @desc    Get all receipts
 * @access  Private
 */
export const getAllReceipts = asyncHandler(async (req, res) => {
  const receipts = await receiptsService.getAllReceipts(req.user._id, req.query);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { receipts, count: receipts.length },
    `Retrieved ${receipts.length} receipts`
  );
});

/**
 * @route   GET /api/receipts/:id
 * @desc    Get receipt by ID
 * @access  Private
 */
export const getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await receiptsService.getReceiptById(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { receipt },
    "Receipt retrieved successfully"
  );
});

/**
 * @route   POST /api/receipts/:id/link
 * @desc    Link receipt to transaction
 * @access  Private
 */
export const linkReceiptToTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const receipt = await receiptsService.linkReceiptToTransaction(
    req.user._id,
    req.params.id,
    transactionId
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { receipt },
    "Receipt linked to transaction successfully"
  );
});

/**
 * @route   POST /api/receipts/:id/unlink
 * @desc    Unlink receipt from transaction
 * @access  Private
 */
export const unlinkReceiptFromTransaction = asyncHandler(async (req, res) => {
  const receipt = await receiptsService.unlinkReceiptFromTransaction(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { receipt },
    "Receipt unlinked from transaction successfully"
  );
});

/**
 * @route   DELETE /api/receipts/:id
 * @desc    Delete receipt
 * @access  Private
 */
export const deleteReceipt = asyncHandler(async (req, res) => {
  await receiptsService.deleteReceipt(req.user._id, req.params.id);

  sendSuccess(res, HTTP_STATUS.OK, null, "Receipt deleted successfully");
});

/**
 * @route   POST /api/receipts/:id/retry-ocr
 * @desc    Retry OCR processing
 * @access  Private
 */
export const retryOCRProcessing = asyncHandler(async (req, res) => {
  const receipt = await receiptsService.retryOCRProcessing(
    req.user._id,
    req.params.id
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    { receipt },
    "OCR processing retry initiated"
  );
});

export default {
  uploadReceipt,
  getAllReceipts,
  getReceiptById,
  linkReceiptToTransaction,
  unlinkReceiptFromTransaction,
  deleteReceipt,
  retryOCRProcessing,
};
