import { getGroqClient } from "../../config/groq.js";
import { extractStructuredData } from "../ai/groq.service.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";
import fs from "fs/promises";

/**
 * Extract text and data from receipt image using Groq Vision
 */
export const extractReceiptData = async (imageUrl) => {
  try {
    const groq = getGroqClient();

    // Use Groq's vision model to analyze receipt
    const response = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in JSON format:
{
  "merchant": "store name",
  "amount": total_amount_as_number,
  "date": "YYYY-MM-DD",
  "category": "food|transport|shopping|entertainment|etc",
  "items": [{"name": "item", "quantity": 1, "price": 100}],
  "confidence": 0-100
}

If any field is unclear, use null. Be accurate with numbers.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from Groq Vision");
    }

    // Parse JSON response
    const ocrData = JSON.parse(content);

    logger.info("Receipt OCR completed", {
      merchant: ocrData.merchant,
      amount: ocrData.amount,
      confidence: ocrData.confidence,
    });

    return {
      ...ocrData,
      rawText: content,
    };
  } catch (error) {
    logger.error("Receipt OCR failed", { error: error.message });
    throw ApiError.internal("Failed to extract receipt data");
  }
};

/**
 * Extract text from receipt (simple OCR without structured data)
 */
export const extractReceiptText = async (imageUrl) => {
  try {
    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all visible text from this receipt image. Return only the text, no formatting.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content || "";
    return text.trim();
  } catch (error) {
    logger.error("Text extraction failed", { error: error.message });
    throw ApiError.internal("Failed to extract text");
  }
};

export default { extractReceiptData, extractReceiptText };
