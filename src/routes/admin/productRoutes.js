const express = require("express");
const router = express.Router();
// const productController = require("../../controllers/admin/productController");
const productController = require("../../controllers/admin/productController");
const { adminAuth } = require("../../middleware/adminAuth");
const validate = require("../../middleware/validator");
const { productValidators } = require("../../utils/validators");
const multer = require("multer");
const { fileProcessing } = require("../../utils/fileProcessing");

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
 * @route   GET /api/admin/products
 * @desc    Get all products (admin version with additional filters)
 * @access  Admin
 */
router.get("/", productController.getProducts);

/**
 * @route   POST /api/admin/products
 * @desc    Create a new product
 * @access  Admin
 */
router.post(
  "/",
  validate(productValidators.createProduct),
  productController.createProduct
);

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get a product by ID
 * @access  Admin
 */
router.get(
  "/:id",
  validate(productValidators.getProduct),
  productController.getProductById
);

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update a product
 * @access  Admin
 */
router.put(
  "/:id",
  validate(productValidators.updateProduct),
  productController.updateProduct
);

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete a product
 * @access  Admin
 */
router.delete(
  "/:id",
  validate(productValidators.deleteProduct),
  productController.deleteProduct
);

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Upload image for a product
 * @access  Admin
 */
router.post(
  "/:id/images",
  validate(productValidators.uploadImage),
  upload.single("image"),
  productController.uploadProductImage
);

/**
 * @route   DELETE /api/admin/products/:id/images/:imageId
 * @desc    Delete image from a product
 * @access  Admin
 */
router.delete(
  "/:id/images",
  validate(productValidators.deleteImageByPublicId),
  productController.deleteProductImage
);

module.exports = router;
