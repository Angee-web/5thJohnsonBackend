const Review = require("../../models/Review");
const reviewService = require("../../services/reviewService");
const { successResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * Get all reviews
 * @route GET /api/admin/reviews
 */
const getReviews = async (req, res, next) => {
  try {
    // Extract query parameters
    const {
      page,
      limit,
      sort,
      product,
      isApproved,
      minRating,
      maxRating,
      hasResponse,
    } = req.query;

    // Format filters
    const filters = {
      product,
      isApproved: isApproved === undefined ? undefined : isApproved === "true",
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
      hasResponse:
        hasResponse === undefined ? undefined : hasResponse === "true",
    };

    // Format options
    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };

    // Add sorting if provided
    if (sort) {
      options.sort = {};
      const [field, order] = sort.split(":");
      options.sort[field] = order === "desc" ? -1 : 1;
    }

    const result = await reviewService.getReviews(filters, options);

    return successResponse(res, "Reviews fetched successfully", result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get review by ID
 * @route GET /api/admin/reviews/:id
 */
const getReviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewService.getReviewById(id);

    return successResponse(res, "Review fetched successfully", { review });
  } catch (error) {
    next(error);
  }
};

/**
 * Update review approval status
 * @route PUT /api/admin/reviews/:id/approve
 */
const updateApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        message: "isApproved field is required",
      });
    }

    const review = await reviewService.updateApproval(id, isApproved);

    return successResponse(
      res,
      `Review ${isApproved ? "approved" : "unapproved"} successfully`,
      { review }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to a review
 * @route POST /api/admin/reviews/:id/respond
 */
const respondToReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    // Validate that response was provided
    if (!response || response.trim() === '') {
      return errorResponse(res, "Response text is required", 400);
    }

    // Debug log
    console.log(`Updating review ${id} with response: ${response}`);

    // Find and update the review
    const review = await Review.findById(id);
    if (!review) {
      return errorResponse(res, "Review not found", 404);
    }

    // Set the response directly
    review.response = response;
    await review.save();

    // Fetch the updated review with product details
    const updatedReview = await Review.findById(id)
      .populate('product', 'name images');

    // Debug log after update
    console.log(`Updated review response: ${updatedReview.response}`);

    return successResponse(
      res,
      {
        review: updatedReview
      },
      "Response added successfully"
    );
  } catch (error) {
    console.error("Error responding to review:", error);
    next(error);
  }
};

/**
 * Delete review
 * @route DELETE /api/admin/reviews/:id
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(id);

    return successResponse(res, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  getReviewById,
  updateApproval,
  respondToReview,
  deleteReview,
};
