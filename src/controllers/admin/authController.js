const authService = require("../../services/authService");
const { successResponse, errorResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * Fetch all users
 * @route GET /api/admin/auth/register
 * @access Public
 * @returns {Object} - List of all users
 */
const getAllUsers = async (req, res, next) => {
  try {
    console.log("Get all users route hit");
    const users = await authService.getAllUsers();
    console.log("Users fetched successfully:", users);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
};

/** Admin registration
 * @route POST /api/admin/auth/register
 * 
 */
const register = async (req, res, next) => {
  console.log("Register route hit"); // Debugging log
  console.log("Request body:", req.body); // Debugging log

  const { username, password } = req.body;
  if (!username || !password) {
    console.log("Validation failed: Missing username or password");
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const adminData = await authService.register(username, password);
    console.log("Admin registered successfully:", adminData); // Debugging log
    return res.status(201).json({ message: "Admin registered successfully", data: adminData });
  } catch (error) {
    console.error("Error in register route:", error); // Debugging log
    next(error);
  }
};

/**
 * Admin login
 * @route POST /api/admin/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return errorResponse(res, "Username and password are required", 400);
    }

    const authData = await authService.login(username, password);

    return successResponse(res, authData, "Login successful");
  } catch (error) {
    next(error);
  }
};

/**
 * Change admin password
 * @route POST /api/admin/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.adminId; // From auth middleware

    if (!currentPassword || !newPassword) {
      return errorResponse(
        res,
        "Current password and new password are required",
        400
      );
    }

    if (newPassword.length < 6) {
      return errorResponse(
        res,
        "New password must be at least 6 characters",
        400
      );
    }

    await authService.changePassword(adminId, currentPassword, newPassword);

    return successResponse(res, null, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Verify token validity
 * @route GET /api/admin/auth/verify
 */
const verifyToken = async (req, res) => {
  return successResponse(res, { valid: true }, "Token is valid");
};

module.exports = {
  getAllUsers,
  register,
  login,
  changePassword,
  verifyToken,
};
