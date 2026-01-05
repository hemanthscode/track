import { cloudinary, cloudinaryConfig } from "../../config/cloudinary.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";
import fs from "fs/promises";

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: cloudinaryConfig.folder,
      allowed_formats: cloudinaryConfig.allowedFormats,
      transformation: cloudinaryConfig.transformation,
      resource_type: "image",
      ...options,
    });

    // Delete local file after upload
    await fs.unlink(filePath).catch((err) => {
      logger.warn("Failed to delete local file", { filePath, error: err.message });
    });

    logger.info("Image uploaded to Cloudinary", {
      publicId: result.public_id,
      url: result.secure_url,
    });

    return {
      cloudinaryId: result.public_id,
      imageUrl: result.secure_url,
      thumbnailUrl: result.eager?.[0]?.secure_url || result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    logger.error("Cloudinary upload failed", { error: error.message });

    // Clean up local file on error
    await fs.unlink(filePath).catch(() => {});

    throw ApiError.internal("Failed to upload image");
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (cloudinaryId) => {
  try {
    const result = await cloudinary.uploader.destroy(cloudinaryId);

    if (result.result !== "ok") {
      throw new Error(`Deletion failed: ${result.result}`);
    }

    logger.info("Image deleted from Cloudinary", { cloudinaryId });
    return true;
  } catch (error) {
    logger.error("Cloudinary deletion failed", {
      cloudinaryId,
      error: error.message,
    });
    throw ApiError.internal("Failed to delete image");
  }
};

/**
 * Get image details from Cloudinary
 */
export const getImageDetails = async (cloudinaryId) => {
  try {
    const result = await cloudinary.api.resource(cloudinaryId);
    return {
      cloudinaryId: result.public_id,
      imageUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      createdAt: result.created_at,
    };
  } catch (error) {
    logger.error("Failed to get image details", {
      cloudinaryId,
      error: error.message,
    });
    throw ApiError.notFound("Image not found");
  }
};

export default { uploadImage, deleteImage, getImageDetails };
