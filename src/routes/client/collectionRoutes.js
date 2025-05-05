const express = require("express");
const router = express.Router();
const collectionController = require("../../controllers/client/collectionController");
const validate = require("../../middleware/validator");
const { collectionValidators } = require("../../utils/validators");
const rateLimiter = require("../../middleware/rateLimiter");

/**
 * @route GET /api/collections
 * @desc Get all collections with filtering
 * @access Public
 */
router.get("/", collectionController.getCollections);

/**
 * @route GET /api/collections/featured
 * @desc Get featured collections
 * @access Public
 */
router.get("/featured", collectionController.getFeaturedCollections);

/**
 * @route GET /api/collections/:id
 * @desc Get a collection by ID or slug with its products
 * @access Public
 */
router.get(
  "/:id",
  validate(collectionValidators.getCollectionById),
  collectionController.getCollectionById
);

module.exports = router;
