const Session = require("../models/Session");
const Product = require("../models/Product");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

/**
 * Get favorites for a session
 * @param {Object} session - Session object
 * @returns {Promise<Array>} Array of favorite products
 */
const getFavorites = async (session) => {
  try {
    if (!session) {
      throw new AppError("Session not found", 400);
    }

    // Get favorites with populated product data
    await session.populate({
      path: "favorites",
      match: { "flags.isActive": true }, // Only include active products
    });

    // Filter out null products (might be deleted or inactive)
    const favorites = session.favorites.filter((f) => f);

    return favorites;
  } catch (error) {
    logger.error(`Error fetching favorites: ${error.message}`);
    throw error;
  }
};

/**
 * Add product to favorites
 * @param {Object} session - Session object
 * @param {String} productId - Product ID to add
 * @returns {Promise<Object>} Updated session
 */
const addToFavorites = async (session, productId) => {
  try {
    if (!session) {
      throw new AppError("Session not found", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Add to favorites
    await session.addFavorite(productId);

    logger.info(
      `Product ${productId} added to favorites for session ${session.sessionId}`
    );
    return { success: true, productId };
  } catch (error) {
    logger.error(`Error adding to favorites: ${error.message}`);
    throw error;
  }
};

/**
 * Remove product from favorites
 * @param {Object} session - Session object
 * @param {String} productId - Product ID to remove
 * @returns {Promise<Object>} Success message
 */
const removeFromFavorites = async (session, productId) => {
  try {
    if (!session) {
      throw new AppError("Session not found", 400);
    }

    await session.removeFavorite(productId);

    logger.info(
      `Product ${productId} removed from favorites for session ${session.sessionId}`
    );
    return { success: true, productId };
  } catch (error) {
    logger.error(`Error removing from favorites: ${error.message}`);
    throw error;
  }
};

/**
 * Clear all favorites
 * @param {Object} session - Session object
 * @returns {Promise<Object>} Success message
 */
const clearFavorites = async (session) => {
  try {
    if (!session) {
      throw new AppError("Session not found", 400);
    }

    await session.clearFavorites();

    logger.info(`All favorites cleared for session ${session.sessionId}`);
    return { success: true };
  } catch (error) {
    logger.error(`Error clearing favorites: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
};
