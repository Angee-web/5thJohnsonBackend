const Review = require("../models/Review");
const Product = require("../models/Product");
const emailService = require("./emailService");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

/**
 * Create a new product review
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object>} Created review
 */
const createReview = async (reviewData) => {
  try {
    // Check if product exists
    const productExists = await Product.exists({ _id: reviewData.product });

    if (!productExists) {
      throw new AppError("Product not found", 404);
    }

    const review = new Review(reviewData);
    await review.save();

    logger.info(`Review created for product ${reviewData.product}`);
    return review;
  } catch (error) {
    logger.error(`Error creating review: ${error.message}`);
    throw error;
  }
};

/**
 * Get reviews for a product
 * @param {String} productId - Product ID
 * @param {Boolean} approvedOnly - Whether to include only approved reviews
 * @returns {Promise<Array>} Array of reviews
 */
const getProductReviews = async (productId, approvedOnly = true) => {
  try {
    const query = { product: productId };

    if (approvedOnly) {
      query.isApproved = true;
    }

    const reviews = await Review.find(query).sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    logger.error(
      `Error fetching reviews for product ${productId}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Get all reviews with filtering and pagination
 * @param {Object} filters - Filter conditions
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Reviews and pagination info
 */
const getReviews = async (filters = {}, options = {}) => {
  try {
    const { product, isApproved, minRating, maxRating, hasResponse } = filters;

    const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;

    // Build query
    const query = {};

    // Filter by product
    if (product) {
      query.product = product;
    }

    // Filter by approval status
    if (isApproved !== undefined) {
      query.isApproved = isApproved;
    }

    // Filter by rating range
    if (minRating !== undefined || maxRating !== undefined) {
      query.rating = {};
      if (minRating !== undefined) query.rating.$gte = minRating;
      if (maxRating !== undefined) query.rating.$lte = maxRating;
    }

    // Filter by response status
    if (hasResponse === true) {
      query["adminResponse.response"] = { $exists: true, $ne: null };
    } else if (hasResponse === false) {
      query["adminResponse.response"] = { $exists: false };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("product", "name images")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count
    const total = await Review.countDocuments(query);

    return {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error fetching reviews: ${error.message}`);
    throw error;
  }
};

/**
 * Get review by ID
 * @param {String} id - Review ID
 * @returns {Promise<Object>} Review document
 */
const getReviewById = async (id) => {
  try {
    const review = await Review.findById(id).populate("product", "name images");

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    return review;
  } catch (error) {
    logger.error(`Error fetching review ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Update review approval status
 * @param {String} id - Review ID
 * @param {Boolean} isApproved - Approval status
 * @returns {Promise<Object>} Updated review
 */
const updateApproval = async (id, isApproved) => {
  try {
    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true, runValidators: true }
    );

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Update product rating
    await Product.updateProductRating(review.product);

    logger.info(`Review ${id} approval status updated to ${isApproved}`);
    return review;
  } catch (error) {
    logger.error(`Error updating review approval: ${error.message}`);
    throw error;
  }
};

/**
 * Add admin response to review
 * @param {String} id - Review ID
 * @param {String} response - Admin response text
 * @returns {Promise<Object>} Updated review
 */
const addResponse = async (id, response) => {
  try {
    const review = await Review.findByIdAndUpdate(
      id,
      {
        adminResponse: {
          response,
          createdAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).populate("product", "name");

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Send email notification to customer
    try {
      await emailService.sendReviewResponse(review);
    } catch (emailError) {
      logger.error(
        `Failed to send review response email: ${emailError.message}`
      );
      // Continue execution even if email fails
    }

    logger.info(`Admin response added to review ${id}`);
    return review;
  } catch (error) {
    logger.error(`Error adding response to review: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a review
 * @param {String} id - Review ID
 * @returns {Promise<Object>} Success message
 */
const deleteReview = async (id) => {
  try {
    const review = await Review.findById(id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    const productId = review.product;

    await review.deleteOne();

    // Update product rating
    await Product.updateProductRating(productId);

    logger.info(`Review ${id} deleted`);
    return { success: true, id };
  } catch (error) {
    logger.error(`Error deleting review ${id}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getReviews,
  getReviewById,
  updateApproval,
  addResponse,
  deleteReview,
};
