const authService = require("../../services/authService");
const { successResponse, errorResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

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
  login,
  changePassword,
  verifyToken,
};
