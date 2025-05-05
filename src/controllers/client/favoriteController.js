const { successResponse, errorResponse } = require("../../utils/apiResponses");
const User = require("../../models/User");
const Product = require("../../models/Product");
const mongoose = require("mongoose");
const logger = require("../../utils/logger");

/**
 * Get user favorites
 * @route GET /api/favorites
 */
const getFavorites = async (req, res, next) => {
  try {
    // Check if authenticated or using session
    if (req.userId) {
      // Logged in user - get favorites from user document
      const user = await User.findById(req.userId).populate({
        path: "favorites",
        select: "name price salePrice images.url slug",
      });

      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      return successResponse(
        res,
        { favorites: user.favorites || [] },
        "Success"
      );
    } else if (req.clientSession) {
      // Anonymous user - get favorites from session
      const favorites = await Product.find({
        _id: { $in: req.clientSession.favorites },
        isActive: true,
      }).select("name price salePrice images.url slug");

      return successResponse(res, { favorites }, "Success");
    } else {
      // No session or user
      return successResponse(res, { favorites: [] }, "Success");
    }
  } catch (error) {
    logger.error(`Get favorites error: ${error.message}`);
    next(error);
  }
};

/**
 * Add product to favorites
 * @route POST /api/favorites
 */
const addToFavorites = async (req, res, next) => {
  try {
    // Add this to the beginning of your addToFavorites controller
    console.log("Request body:", req.body);
    console.log("Product ID received:", req.body.productId);

    // Get product ID from either params or body
    const productId = req.params.productId || req.body.productId;

    if (!productId) {
      return errorResponse(res, "Product ID is required", 400);
    }

    // Validate product exists
    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    if (req.userId) {
      // Logged in user - add to user's favorites
      const user = await User.findById(req.userId);

      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      // Check if already in favorites
      if (user.favorites.includes(productId)) {
        return successResponse(
          res,
          { success: true, productId },
          "Product is already in favorites"
        );
      }

      // Add to favorites
      user.favorites.push(productId);
      await user.save();

      return successResponse(
        res,
        { success: true, productId },
        "Product added to favorites"
      );
    } else if (req.clientSession) {
      // Anonymous user - add to session favorites
      const sessionFavorites = req.clientSession.favorites || [];

      // Check if already in favorites
      if (sessionFavorites.some((id) => id.toString() === productId)) {
        return successResponse(
          res,
          { success: true, productId },
          "Product is already in favorites"
        );
      }

      // Add to favorites
      req.clientSession.favorites.push(productId);
      await req.clientSession.save();

      return successResponse(
        res,
        { success: true, productId },
        "Product added to favorites"
      );
    } else {
      return errorResponse(res, "Session not found", 400);
    }
  } catch (error) {
    logger.error(`Add to favorites error: ${error.message}`);
    next(error);
  }
};

/**
 * Remove product from favorites
 * @route DELETE /api/favorites/:productId
 */
const removeFromFavorites = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (req.userId) {
      // Logged in user - remove from user's favorites
      const user = await User.findById(req.userId);

      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      // Filter out the product ID
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== productId
      );
      await user.save();

      return successResponse(
        res,
        { success: true, productId },
        "Product removed from favorites"
      );
    } else if (req.clientSession) {
      // Anonymous user - remove from session favorites
      req.clientSession.favorites = req.clientSession.favorites.filter(
        (id) => id.toString() !== productId
      );
      await req.clientSession.save();

      return successResponse(
        res,
        { success: true, productId },
        "Product removed from favorites"
      );
    } else {
      return errorResponse(res, "Session not found", 400);
    }
  } catch (error) {
    logger.error(`Remove from favorites error: ${error.message}`);
    next(error);
  }
};

/**
 * Clear all favorites
 * @route DELETE /api/favorites
 */
const clearFavorites = async (req, res, next) => {
  try {
    if (req.userId) {
      // Logged in user - clear user's favorites
      const user = await User.findById(req.userId);

      if (!user) {
        return errorResponse(res, "User not found", 404);
      }

      user.favorites = [];
      await user.save();

      return successResponse(res, { success: true }, "All favorites cleared");
    } else if (req.clientSession) {
      // Anonymous user - clear session favorites
      req.clientSession.favorites = [];
      await req.clientSession.save();

      return successResponse(res, { success: true }, "All favorites cleared");
    } else {
      return errorResponse(res, "Session not found", 400);
    }
  } catch (error) {
    logger.error(`Clear favorites error: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  clearFavorites,
};
