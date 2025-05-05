const reviewService = require("../../services/reviewService");
const { successResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * Get reviews for a product
 * @route GET /api/reviews/product/:productId
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Only return approved reviews for clients
    const reviews = await reviewService.getProductReviews(productId, true);

    return successResponse(res, { reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a new review
 * @route POST /api/reviews
 */
const submitReview = async (req, res, next) => {
  try {
    const { product, name, email, rating, comment } = req.body;

    const newReview = await reviewService.createReview({
      product,
      name,
      email,
      rating,
      comment,
      // Set to false by default - needs admin approval
      isApproved: false,
    });

    return successResponse(
      res,
      { id: newReview._id },
      "Thank you for your review. It will be visible after approval.",
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  submitReview,
};
