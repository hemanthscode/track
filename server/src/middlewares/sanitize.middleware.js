import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

/**
 * Sanitize request data to prevent NoSQL injection
 */
export const sanitizeData = mongoSanitize({
  replaceWith: "_",
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized key ${key} in ${req.originalUrl}`);
  },
});

/**
 * Clean user input to prevent XSS attacks
 */
export const preventXSS = xss();

export default { sanitizeData, preventXSS };
