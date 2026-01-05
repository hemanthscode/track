import multer from "multer";
import path from "path";
import { FILE_UPLOAD } from "../config/constants.js";
import ApiError from "../utils/ApiError.js";

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, FILE_UPLOAD.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `receipt-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type. Allowed: ${FILE_UPLOAD.ALLOWED_TYPES.join(", ")}`
      ),
      false
    );
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_UPLOAD.MAX_SIZE,
  },
});

// Error handler for multer
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        ApiError.badRequest(
          `File too large. Maximum size: ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`
        )
      );
    }
    return next(ApiError.badRequest(err.message));
  }
  next(err);
};

export const uploadSingle = upload.single("receipt");
export default upload;
