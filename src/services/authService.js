const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const dotenv = require("dotenv"); // Add this
const path = require("path"); // Add this

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Admin login
 * @param {String} username - Admin username
 * @param {String} password - Admin password
 * @returns {Promise<Object>} Auth data with token
 */
const login = async (username, password) => {
  try {
    // Find admin by username
    const admin = await Admin.findOne({ username, isActive: true });

    if (!admin) {
      throw new AppError("Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = generateToken(admin._id);

    return {
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
      },
    };
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    throw error;
  }
};

/**
 * Generate JWT token
 * @param {String} adminId - Admin ID
 * @returns {String} JWT Token
 */
const generateToken = (adminId) => {
  // Use environment variable directly with a fallback
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    logger.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT authentication is not properly configured");
  }

  return jwt.sign({ id: adminId }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    // Use environment variable directly with a fallback
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      logger.error("JWT_SECRET is not defined in environment variables");
      throw new Error("JWT authentication is not properly configured");
    }

    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
};

/**
 * Create initial admin user if none exists
 * @param {Object} adminData - Admin data
 * @returns {Promise<Boolean>} Success status
 */
const createInitialAdmin = async (adminData = null) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      // Create default admin if none provided
      const defaultAdmin = adminData || {
        username: "admin",
        password: "admin123", // Will be hashed by the pre-save hook
        email: "admin@5thjohnson.com",
        name: "Admin User",
      };

      await Admin.create(defaultAdmin);
      logger.info("Initial admin user created");
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error creating initial admin: ${error.message}`);
    throw error;
  }
};

/**
 * Change admin password
 * @param {String} adminId - Admin ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise<Boolean>} Success status
 */
const changePassword = async (adminId, currentPassword, newPassword) => {
  try {
    const admin = await Admin.findById(adminId);

    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    return true;
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  login,
  verifyToken,
  createInitialAdmin,
  changePassword,
};
