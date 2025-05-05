const {
  unauthorizedResponse,
  forbiddenResponse,
} = require("../utils/apiResponses");
const { AppError } = require("./errorHandler");
const logger = require("../utils/logger");
const constants = require("../config/constants");
const authService = require("../services/authService"); // Add this import

/**
 * Authenticate admin API requests using JWT token
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    // Debug logging
    console.log("Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Access denied. No token provided.", 401));
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    console.log(
      "Extracted token:",
      token ? token.substring(0, 20) + "..." : null
    );

    if (!token) {
      return next(new AppError("Access denied. Invalid token format.", 401));
    }

    try {
      // Verify token
      const decoded = authService.verifyToken(token);

      // Add admin ID to request object
      req.adminId = decoded.id;

      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      return next(new AppError("Invalid or expired token", 401));
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return next(new AppError("Authentication error", 500));
  }
};

/**
 * Optional admin authentication - doesn't block the request if no API key
 * but adds isAdmin flag if valid API key is provided
 */
const optionalAdminAuth = (req, res, next) => {
  try {
    const apiKey = req.header(constants.AUTH.API_KEY_HEADER);

    // If API key exists and is valid, mark as admin
    if (apiKey && apiKey === process.env.API_KEY) {
      req.isAdmin = true;
    } else {
      req.isAdmin = false;
    }

    next();
  } catch (error) {
    // Continue without admin privileges
    req.isAdmin = false;
    next();
  }
};

module.exports = {
  adminAuth,
  optionalAdminAuth,
};
