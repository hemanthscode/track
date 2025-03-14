import { validationResult } from "express-validator";
import { sendError } from "../utils/response.js";

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join("; ");
    return sendError(res, 422, `Validation failed: ${errorMessages}`);
  };
};