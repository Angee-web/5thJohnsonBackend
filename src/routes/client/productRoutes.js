const express = require("express");
const router = express.Router();
const productController = require("../../controllers/client/productController");
const Product = require("../../models/Product"); // Add this import for the debug route
const { validate } = require("../../middleware/validator");
const { productValidators } = require("../../utils/validators");

/**
 * @route   GET /api/products ✅
 * @desc    Get all products with filtering and pagination
 * @access  Public
 */
router.get("/", productController.getProducts);

/**
 * @route   GET /api/products/featured ✅
 * @desc    Get featured products
 * @access  Public
 */
router.get("/featured", productController.getFeaturedProducts);

/**
 * @route   GET /api/products/new-arrivals 
 * @desc    Get new arrival products
 * @access  Public
 */
router.get("/new-arrivals", productController.getNewArrivals);

/**
 * @route   GET /api/products/on-sale
 * @desc    Get products on sale
 * @access  Public
 */
router.get("/on-sale", productController.getOnSaleProducts);

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 */
router.get("/search", productController.searchProducts);

// Add the debug route BEFORE the :id route
router.get("/debug-structure", async (req, res) => {
  try {
    // Get a sample product to examine its structure
    const product = await Product.findOne();

    if (!product) {
      return res.json({
        success: false,
        message: "No products found in database",
      });
    }

    // Analyze the product structure
    const structure = {
      hasFlags: !!product.flags,
      flagsStructure: product.flags ? Object.keys(product.flags) : null,
      topLevelFields: Object.keys(product.toObject()),
      featuredField:
        product.featured !== undefined
          ? "top-level"
          : product.flags && product.flags.isFeatured !== undefined
          ? "nested"
          : "not-found",
      onSaleField:
        product.onSale !== undefined
          ? "top-level"
          : product.flags && product.flags.isOnSale !== undefined
          ? "nested"
          : "not-found",
      isActiveField:
        product.isActive !== undefined
          ? "top-level"
          : product.flags && product.flags.isActive !== undefined
          ? "nested"
          : "not-found",
      sampleProduct: product,
    };

    return res.json({
      success: true,
      data: structure,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Get a product by ID
 * @access  Public
 */
// This should be AFTER all specific routes
router.get("/:id", productController.getProductById);

module.exports = router;
