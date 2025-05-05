const logger = require('../utils/logger');
const { errorResponse } = require('../utils/apiResponses');

// Custom error class for application errors
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates expected/handled errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](
    `${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`
  );
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  // Handle specific error types
  
  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }
  
  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    error.message = 'Data validation error';
    error.statusCode = 400;
    
    // Extract validation errors
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    
    return errorResponse(res, error.message, error.statusCode, errors);
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
    
    // Extract the duplicated field
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    
    return errorResponse(
      res, 
      `${field} with value '${value}' already exists`,
      400
    );
  }
  
  // Express-validator errors (passed as array)
  if (err.array && typeof err.array === 'function') {
    const validationErrors = err.array();
    error.message = 'Validation failed';
    error.statusCode = 400;
    
    return errorResponse(res, error.message, error.statusCode, validationErrors);
  }

  // Handle operational errors (expected errors)
  if (err.isOperational) {
    return errorResponse(res, error.message, error.statusCode);
  }
  
  // For production, don't leak error details for non-operational errors
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    logger.error('UNEXPECTED ERROR:', err);
    return errorResponse(res, 'Something went wrong', 500);
  }
  
  // Development error response with full details
  return errorResponse(
    res,
    error.message,
    error.statusCode,
    process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      error: err
    } : null
  );
};

module.exports = {
  AppError,
  errorHandler
};