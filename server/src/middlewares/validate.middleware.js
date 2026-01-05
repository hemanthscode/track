import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Validate request using express-validator rules
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw ApiError.unprocessableEntity("Validation failed", formattedErrors);
  };
};

export default validate;
