const express = require("express");
const router = express.Router();
const authController = require("../../controllers/client/authController");
const { protect } = require("../../middleware/userAuth");
const validate = require("../../middleware/validator");
const { userValidators } = require("../../utils/validators");

/**
 * @route   POST /api/user/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  "/register",
  // (req, res, next) => {
  //   console.log("Request body:", req.body); // Log the incoming request body
  //   next();
  // },
  // validate(userValidators.register),
  authController.register
);

/**
 * @route   POST /api/user/auth/login
 * @desc    User login
 * @access  Public
 */
router.post("/login", validate(userValidators.login), authController.login);

/**
 * @route   GET /api/user/auth/me
 * @desc    Get current user profile
 * @access  Privatez
 */
router.get("/me", protect, authController.getProfile);

module.exports = router;
