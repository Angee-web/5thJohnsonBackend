const express = require("express");
const router = express.Router();
const favoriteController = require("../../controllers/client/favoriteController");
const { optionalAuth } = require("../../middleware/userAuth");
const validate = require("../../middleware/validator");
const { favoriteValidators } = require("../../utils/validators");

// Apply optional auth to all routes
router.use(optionalAuth);

/**
 * @route   GET /api/favorites ✅
 * @desc    Get all favorites
 * @access  Public
 */
router.get("/", favoriteController.getFavorites);

/**
 * @route   POST /api/favorites ✅
 * @desc    Add a product to favorites
 * @access  Public
 */
router.post(
  "/",
  validate(favoriteValidators.addToFavorites),
  favoriteController.addToFavorites
);

/**
 * @route   DELETE /api/favorites/:productId ✅
 * @desc    Remove a product from favorites
 * @access  Public
 */
router.delete(
  "/:productId",
  validate(favoriteValidators.removeFavorite),
  favoriteController.removeFromFavorites
);

/**
 * @route   DELETE /api/favorites ✅
 * @desc    Clear all favorites
 * @access  Public
 */
router.delete("/", favoriteController.clearFavorites);

module.exports = router;
