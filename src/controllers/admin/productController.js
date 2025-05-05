const productService = require("../../services/productService");
const cloudinaryService = require("../../services/cloudinaryService");
const { successResponse, errorResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");
const Product = require("../../models/Product");
const fs = require("fs");

/**
 * Create a new product
 * @route POST /api/admin/products
 */
const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);

    return successResponse(
      res,
      "Product created successfully",
      { product },
      201
    );
  } catch (error) {
    next(error);
  }
};

// Find the getProducts function and update it with this implementation:

/**
 * Get all products for admin
 * @route GET /api/admin/products
 */
const getProducts = async (req, res, next) => {
  try {
    console.log("Admin getProducts function called");
    
    // Parse query parameters (with defaults)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get query filters
    const queryFilters = {};
    
    // Only apply isActive filter if explicitly specified
    if (req.query.isActive !== undefined) {
      queryFilters.isActive = req.query.isActive === 'true';
    }
    
    // Apply other filters if provided
    if (req.query.search) {
      queryFilters.$text = { $search: req.query.search };
    }
    
    if (req.query.collection) {
      queryFilters.collections = req.query.collection;
    }
    
    // Log the query being executed
    console.log("Admin products query filters:", JSON.stringify(queryFilters));
    console.log("Pagination:", { page, limit, skip });
    
    // Execute the query
    const products = await Product.find(queryFilters)
      .sort({ createdAt: -1 })
      .populate('collections', 'name')
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Product.countDocuments(queryFilters);
    
    console.log(`Found ${products.length} products out of ${total} total`);
    
    // Calculate pagination info
    const pages = Math.ceil(total / limit);
    
    return successResponse(
      res,
      {
        products,
        pagination: {
          page,
          limit,
          total,
          pages
        }
      },
      "Products fetched successfully"
    );
  } catch (error) {
    console.error("Error in admin getProducts:", error);
    next(error);
  }
};


/**
 * Get product by ID
 * @route GET /api/admin/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const includeReviews = req.query.includeReviews === "true";

    const product = await productService.getProductById(id, includeReviews);

    return successResponse(res, "Product fetched successfully", { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 * @route PUT /api/admin/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    return successResponse(res, "Product updated successfully", { product });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 * @route DELETE /api/admin/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    return successResponse(res, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};

// Find the uploadProductImage function and update it:

/**
 * Upload product image
 * @route POST /api/admin/products/:id/images
 */
const uploadProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return errorResponse(res, "No image file provided", 400);
    }

    // Find product
    const product = await Product.findById(id);
    
    if (!product) {
      // Clean up uploaded file if product not found
      if (req.file && req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, "Product not found", 404);
    }

    console.log(`Uploading image for product ${id}: ${req.file.originalname}`);

    // Upload to Cloudinary
    const { uploadToCloudinary } = require("../../utils/fileProcessing");
    
    const uploadResult = await uploadToCloudinary(req.file, {
      folder: `5thJohnson/products/${id}`
    });

    // Add image to product
    const newImage = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      width: uploadResult.width,
      height: uploadResult.height
    };

    // Add to product images array
    if (!product.images) {
      product.images = [];
    }
    
    product.images.push(newImage);
    
    // If this is the first image, make it the main image
    if (product.images.length === 1) {
      product.mainImage = newImage;
    }
    
    // Save product
    await product.save();
    
    return successResponse(
      res, 
      { image: newImage }, 
      "Product image uploaded successfully",
      201
    );
  } catch (error) {
    // Clean up uploaded file if there was an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};


// Find the deleteProductImage function and update it:

/**
 * Delete product image
 * @route DELETE /api/admin/products/:id/images
 */
const deleteProductImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { publicId } = req.body; // Get the publicId from the request body

    if (!publicId) {
      return errorResponse(res, "Image public ID is required", 400);
    }

    console.log(`Deleting image with publicId: ${publicId} from product: ${id}`);

    // Find product
    const product = await Product.findById(id);
    
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    // Find image in the product by publicId
    const imageIndex = product.images.findIndex(
      (img) => img.publicId === publicId
    );

    if (imageIndex === -1) {
      return errorResponse(res, "Image not found in product", 404);
    }

    // Get image before removing from array
    const imageToDelete = product.images[imageIndex];
    
    console.log(`Found image at index ${imageIndex}:`, imageToDelete);

    // Remove from Cloudinary
    const { deleteFromCloudinary } = require("../../utils/fileProcessing");
    
    try {
      await deleteFromCloudinary(publicId);
      console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
    } catch (cloudinaryError) {
      console.error(`Error deleting from Cloudinary: ${cloudinaryError.message}`);
      // Continue with removing from database even if Cloudinary delete fails
    }

    // Remove image from product
    product.images.splice(imageIndex, 1);
    console.log(`Removed image from product. Remaining images: ${product.images.length}`);

    // If it was the main image, set a new one if available
    if (
      product.mainImage && 
      product.mainImage.publicId === publicId
    ) {
      product.mainImage = product.images.length > 0 ? product.images[0] : null;
      console.log("Updated main image");
    }

    // Save product
    await product.save();

    return successResponse(res, null, "Product image deleted successfully");
  } catch (error) {
    console.error(`Error in deleteProductImage: ${error.message}`);
    next(error);
  }
};



module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
};
