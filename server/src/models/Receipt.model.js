import mongoose from "mongoose";

const ReceiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    cloudinaryId: {
      type: String,
      required: [true, "Cloudinary ID is required"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    thumbnailUrl: {
      type: String,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    ocrData: {
      merchant: { type: String, trim: true },
      amount: { type: Number },
      date: { type: Date },
      category: { type: String, trim: true },
      items: [
        {
          name: { type: String },
          quantity: { type: Number },
          price: { type: Number },
        },
      ],
      rawText: { type: String },
      confidence: { type: Number, min: 0, max: 100 },
    },
    processingStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    processingError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Check if OCR data exists
ReceiptSchema.methods.hasOCRData = function () {
  return this.ocrData && this.ocrData.rawText;
};

// Check if linked to transaction
ReceiptSchema.methods.isLinkedToTransaction = function () {
  return !!this.transactionId;
};

// Indexes
ReceiptSchema.index({ userId: 1, createdAt: -1 });
ReceiptSchema.index({ transactionId: 1 });
ReceiptSchema.index({ processingStatus: 1 });

const Receipt = mongoose.model("Receipt", ReceiptSchema);

export default Receipt;
