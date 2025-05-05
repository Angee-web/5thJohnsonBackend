/**
 * Custom error types for standardized error handling
 */

/**
 * Base application error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Indicates errors that are expected/handled

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
  constructor(message = "Validation failed", errors = null) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Authentication Error (401)
 */
class AuthError extends AppError {
  constructor(message = "Authentication failed") {
    super(message, 401);
  }
}

/**
 * Authorization Error (403)
 */
class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later") {
    super(message, 429);
  }
}

/**
 * Database Error (500)
 */
class DatabaseError extends AppError {
  constructor(message = "Database operation failed") {
    super(message, 500);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ForbiddenError,
  RateLimitError,
  DatabaseError,
};
