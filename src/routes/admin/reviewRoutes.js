const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/admin/reviewController");
const { adminAuth } = require("../../middleware/adminAuth");
const validate = require("../../middleware/validator");
const { reviewValidators } = require("../../utils/validators");

// Protect all routes with admin authentication
router.use(adminAuth);

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all reviews (admin version with additional filters)
 * @access  Admin
 */
router.get("/", reviewController.getReviews);

/**
 * @route   GET /api/admin/reviews/:id
 * @desc    Get a review by ID
 * @access  Admin
 */
router.get(
  "/:id",
  validate(reviewValidators.getReview),
  reviewController.getReviewById
);

/**
 * @route   PUT /api/admin/reviews/:id/approve
 * @desc    Approve or unapprove a review
 * @access  Admin
 */
router.put(
  "/:id/approve",
  validate(reviewValidators.approveReview),
  reviewController.updateApproval
);

/**
 * @route   POST /api/admin/reviews/:id/respond
 * @desc    Add admin response to a review
 * @access  Admin
 */
router.post(
  "/:id/respond",
  validate(reviewValidators.respondToReview),
  reviewController.respondToReview
);

/**
 * @route   DELETE /api/admin/reviews/:id
 * @desc    Delete a review
 * @access  Admin
 */
router.delete(
  "/:id",
  validate(reviewValidators.deleteReview),
  reviewController.deleteReview
);

module.exports = router;
