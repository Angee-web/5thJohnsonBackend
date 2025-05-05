const { validationResult } = require("express-validator");
const { badRequestResponse } = require("../utils/apiResponses");

/**
 * Middleware to handle express-validator validations
 * @param {Array} validations - Array of validation middleware
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    // Return validation error response
    return badRequestResponse(res, "Validation failed", formattedErrors);
  };
};

module.exports = validate;
