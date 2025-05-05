/**
 * Standard API response formatter
 */

// Success response with data
const successResponse = (
  res,
  data = {},
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Error response
const errorResponse = (
  res,
  message = "Server Error",
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Not found response
const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, message, 404);
};

// Bad request response
const badRequestResponse = (res, message = "Bad request", errors = null) => {
  return errorResponse(res, message, 400, errors);
};

// Unauthorized response
const unauthorizedResponse = (res, message = "Unauthorized access") => {
  return errorResponse(res, message, 401);
};

// Forbidden response
const forbiddenResponse = (res, message = "Access forbidden") => {
  return errorResponse(res, message, 403);
};

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
};
