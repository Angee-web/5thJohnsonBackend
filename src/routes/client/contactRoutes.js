const express = require("express");
const router = express.Router();
const contactController = require("../../controllers/client/contactController");
const validate = require("../../middleware/validator");
const { contactValidators } = require("../../utils/validators");
// Fix: Correctly import the rate limiter functions
const { createLimiter } = require("../../middleware/rateLimiter");

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form message
 * @access  Public
 * @note    Rate limited to prevent abuse
 */
router.post(
  "/",
  // Use the createLimiter function to create a custom rate limiter
  createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Limit to 5 requests per hour
    message:
      "You've submitted too many contact requests. Please try again later.",
  }),
  validate(contactValidators.submitContactForm),
  contactController.submitContactForm
);

module.exports = router;
