import { v2 as cloudinary } from "cloudinary";
import { config } from "./env.js";
import logger from "../utils/logger.js";

export const initializeCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
    
    logger.info("✅ Cloudinary initialized");
  } catch (error) {
    logger.error("Failed to initialize Cloudinary", { error: error.message });
    throw error;
  }
};

export const cloudinaryConfig = {
  folder: "expense-tracker/receipts",
  allowedFormats: ["jpg", "jpeg", "png"],
  transformation: [
    { width: 1000, height: 1000, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" },
  ],
};

export { cloudinary };
export default { initializeCloudinary, cloudinary, cloudinaryConfig };
