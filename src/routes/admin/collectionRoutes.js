const express = require("express");
const router = express.Router();
const collectionController = require("../../controllers/admin/collectionController");
const { adminAuth } = require("../../middleware/adminAuth");
const validate = require("../../middleware/validator");
const { collectionValidators } = require("../../utils/validators");
const multer = require("multer");

// Setup multer storage for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "tmp/uploads/");
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + ".tmp");
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Protect all routes with admin authentication
router.use(adminAuth);

/**
 * @route   GET /api/admin/collections ✅
 * @desc    Get all collections (admin version with additional filters)
 * @access  Admin
 */
router.get("/", collectionController.getCollections);

/**
 * @route   POST /api/admin/collections ✅
 * @desc    Create a new collection
 * @access  Admin
 */
router.post(
  "/",
  validate(collectionValidators.createCollection),
  collectionController.createCollection
);


/**
 * @route   GET /api/admin/collections/with-products ✅
 * @desc    Get collections that have products
 * @access  Admin
 */
router.get(
  "/with-products",
  collectionController.getCollectionsWithProducts
);



/**
 * @route   GET /api/admin/collections/:id ✅
 * @desc    Get a collection by ID
 * @access  Admin
 */
router.get(
  "/:id",
  validate(collectionValidators.getCollection),
  collectionController.getCollectionById
);



/**
 * @route   PUT /api/admin/collections/:id ✅
 * @desc    Update a collection
 * @access  Admin
 */
router.put(
  "/:id",
  validate(collectionValidators.updateCollection),
  collectionController.updateCollection
);

/**
 * @route   DELETE /api/admin/collections/:id ✅
 * @desc    Delete a collection
 * @access  Admin
 */
router.delete(
  "/:id",
  validate(collectionValidators.deleteCollection),
  collectionController.deleteCollection
);

/**
 * @route   POST /api/admin/collections/:id/image
 * @desc    Upload image for a collection
 * @access  Admin
 */
router.post(
  "/:id/image",
  upload.single("image"),
  validate(collectionValidators.uploadImage),
  collectionController.uploadCollectionImage
);

/**
 * @route   POST /api/admin/collections/:id/products
 * @desc    Add products to a collection
 * @access  Admin
 */
router.post(
  "/:id/products",
  validate(collectionValidators.addProducts),
  collectionController.addProductsToCollection
);

/**
 * @route   DELETE /api/admin/collections/:id/products
 * @desc    Remove products from a collection
 * @access  Admin
 */
router.delete(
  "/:id/products",
  validate(collectionValidators.removeProducts),
  collectionController.removeProductsFromCollection
);

module.exports = router;
