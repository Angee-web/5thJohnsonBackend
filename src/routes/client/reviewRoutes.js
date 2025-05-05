const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/client/reviewController");
const validate = require("../../middleware/validator");
const { reviewValidators } = require("../../utils/validators");

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a specific product
 * @access  Public
 */
router.get(
  "/product/:productId",
  validate(reviewValidators.getProductReviews),
  reviewController.getProductReviews
);

/**
 * @route   POST /api/reviews
 * @desc    Submit a new review
 * @access  Public
 */
router.post(
  "/",
  validate(reviewValidators.submitReview),
  reviewController.submitReview
);

module.exports = router;
