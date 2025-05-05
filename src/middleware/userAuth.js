const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/apiResponses");
const logger = require("../utils/logger");

/**
 * Protect routes that require authentication
 */
const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Not authorized, no token", 401);
    }

    // Get token from header
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set user ID on request
      req.userId = decoded.id;

      next();
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      return errorResponse(res, "Not authorized, invalid token", 401);
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    next(error);
  }
};

/**
 * Optional authentication - doesn't block requests without tokens
 * but adds userId to request if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Continue without authentication
      return next();
    }

    // Get token from header
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set user ID on request
      req.userId = decoded.id;
    } catch (error) {
      // Invalid token, but continue anyway
      logger.debug(`Optional auth token invalid: ${error.message}`);
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    logger.error(`Optional auth error: ${error.message}`);
    next();
  }
};

module.exports = {
  protect,
  optionalAuth,
};
