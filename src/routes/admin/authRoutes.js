const express = require("express");
const router = express.Router();
const authController = require("../../controllers/admin/authController");
const { adminAuth } = require("../../middleware/adminAuth");
// Fix: Import the createLimiter function instead of rateLimiter
const { createLimiter } = require("../../middleware/rateLimiter");
const { getPerformanceStats } = require("../../middleware/performanceMonitor");

/**
 * @route   GET /api/admin/auth/all ✅
 * @desc    Test route to get all users
 * @desc    This route is for testing purposes only and should not be used in production.
 * @access  Public
 */
router.get("/all", authController.getAllUsers); 

/** 
 * @route   POST /api/admin/auth/register ✅
 * @desc    Admin registration
 * @access  Public
 */

router.post(
  "/register",
  authController.register
);

/**
 * @route   POST /api/admin/auth/login ✅
 * @desc    Admin login
 * @access  Public
 */
router.post(
  "/login",
  // Fix: Use createLimiter instead of rateLimiter
  createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts, please try again later.",
  }), // 5 attempts per 15 minutes
  authController.login
);

/**
 * @route   POST /api/admin/auth/change-password ✅
 * @desc    Change admin password
 * @access  Admin
 */
router.post("/change-password", adminAuth, authController.changePassword);

/**
 * @route   GET /api/admin/auth/verify
 * @desc    Verify token validity
 * @access  Admin
 */
router.get("/verify", adminAuth, authController.verifyToken);

// Add this route
router.get("/performance", adminAuth, (req, res) => {
  const stats = getPerformanceStats(req.app);
  res.json({
    success: true,
    data: stats,
  });
});

module.exports = router;
