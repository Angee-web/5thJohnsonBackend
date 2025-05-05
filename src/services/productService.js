const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product
 */
const createProduct = async (productData) => {
  try {
    const product = new Product(productData);
    await product.save();
    logger.info(`Product created: ${product._id}`);
    return product;
  } catch (error) {
    logger.error(`Error creating product: ${error.message}`);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {String} id - Product ID
 * @param {Boolean} includeReviews - Whether to include approved reviews
 * @returns {Promise<Object>} Product document
 */
const getProductById = async (id, includeReviews = false) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const query = Product.findById(id);

    if (includeReviews) {
      query.populate({
        path: "reviews",
        match: { isApproved: true },
        select: "-email", // Don't expose reviewer emails
      });
    }

    const product = await query.exec();

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  } catch (error) {
    logger.error(`Error fetching product ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Get products with filtering, sorting and pagination
 * @param {Object} filters - Filter conditions
 * @param {Object} options - Query options (sort, pagination)
 * @returns {Promise<Object>} Products and pagination info
 */
const getProducts = async (filters = {}, options = {}) => {
  try {
    const { search, collection, priceMin, priceMax, featured, onSale, newArrival } =
      filters;

    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;

    // Build query
    const query = {};

    // Always include only active products unless explicitly specified
    if (filters.isActive === undefined) {
      query.isActive = true;  // CHANGED: top-level instead of flags.isActive
    } else if (filters.isActive !== null) {
      query.isActive = filters.isActive;  // CHANGED: top-level
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Collection filter
    if (collection) {
      query.collections = mongoose.Types.ObjectId.isValid(collection)
        ? new mongoose.Types.ObjectId(collection)
        : collection;
    }

    // Price range filter
    if (priceMin !== undefined || priceMax !== undefined) {
      query.price = {};
      if (priceMin !== undefined) query.price.$gte = priceMin;
      if (priceMax !== undefined) query.price.$lte = priceMax;
    }

    // Featured products filter
    if (featured !== undefined) {
      query.featured = featured;  // CHANGED: top-level instead of flags.isFeatured
    }

    // On sale products filter
    if (onSale !== undefined) {
      query.onSale = onSale;  // CHANGED: top-level instead of flags.isOnSale
    }

    // New products filter
    if (newArrival !== undefined) {
      query.newArrival = newArrival;  // CHANGED: top-level instead of flags.newArrival
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error fetching products: ${error.message}`);
    throw error;
  }
};


/**
 * Update product by ID
 * @param {String} id - Product ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated product
 */
const updateProduct = async (id, updateData) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    logger.info(`Product updated: ${id}`);
    return product;
  } catch (error) {
    logger.error(`Error updating product ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Delete product by ID
 * @param {String} id - Product ID
 * @returns {Promise<Object>} Deleted product
 */
const deleteProduct = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid product ID", 400);
    }

    const product = await Product.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Delete product images from cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.deleteFromCloudinary(image.publicId);
        }
      }
    }

    // Remove product
    await product.deleteOne();

    logger.info(`Product deleted: ${id}`);
    return { success: true, id };
  } catch (error) {
    logger.error(`Error deleting product ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Upload product image
 * @param {String} productId - Product ID
 * @param {Object} imageData - Image data
 * @returns {Promise<Object>} Updated product
 */
const uploadProductImage = async (productId, imageData) => {
  try {
    const { url, publicId, isFeatured = false, altText = "" } = imageData;

    if (!url || !publicId) {
      throw new AppError("Image URL and publicId are required", 400);
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // If this is featured, remove featured flag from other images
    if (isFeatured) {
      product.images.forEach((img) => {
        img.isFeatured = false;
      });
    }

    // Add new image
    product.images.push({
      url,
      publicId,
      isFeatured,
      altText,
    });

    await product.save();
    logger.info(`Image added to product ${productId}: ${publicId}`);

    return product;
  } catch (error) {
    logger.error(`Error uploading product image: ${error.message}`);
    throw error;
  }
};

/**
 * Delete product image
 * @param {String} productId - Product ID
 * @param {String} imageId - Image ID
 * @returns {Promise<Object>} Updated product
 */
const deleteProductImage = async (productId, imageId) => {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const imageIndex = product.images.findIndex(
      (img) => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      throw new AppError("Image not found", 404);
    }

    // Get image public ID for Cloudinary deletion
    const publicId = product.images[imageIndex].publicId;

    // Remove image from product
    product.images.splice(imageIndex, 1);

    // If we deleted the featured image, make the first remaining image featured
    const hasFeatured = product.images.some((img) => img.isFeatured);
    if (!hasFeatured && product.images.length > 0) {
      product.images[0].isFeatured = true;
    }

    await product.save();

    // Delete from Cloudinary
    if (publicId) {
      await cloudinary.deleteFromCloudinary(publicId);
    }

    logger.info(`Image deleted from product ${productId}: ${imageId}`);

    return product;
  } catch (error) {
    logger.error(`Error deleting product image: ${error.message}`);
    throw error;
  }
};


/**
 * Get featured products
 * @param {Number} limit - Maximum number of products to return
 * @returns {Array} Featured products
 */
const getFeaturedProducts = async (limit = 8) => {
  try {
    console.log("Getting featured products, limit:", limit);

    // Use top-level fields as shown in your schema
    const featuredProducts = await Product.find({
      featured: true,
      isActive: true,
    })
      .populate("collections", "name slug")
      .sort("-createdAt")
      .limit(Number(limit));

    console.log(`Found ${featuredProducts.length} featured products`);
    return featuredProducts;
  } catch (error) {
    logger.error(`Error fetching featured products: ${error.message}`);
    throw new Error("Failed to fetch featured products");
  }
};

/**
 * Get products on sale
 * @param {Number} limit - Maximum number of products to return
 * @returns {Array} Products on sale
 */
const getOnSaleProducts = async (limit = 8) => {
  try {
    console.log("Getting on-sale products, limit:", limit);

    // Use top-level fields as shown in your schema
    const onSaleProducts = await Product.find({
      onSale: true,
      isActive: true,
    })
      .populate("collections", "name slug")
      .sort("-createdAt")
      .limit(Number(limit));

    console.log(`Found ${onSaleProducts.length} on-sale products`);
    return onSaleProducts;
  } catch (error) {
    logger.error(`Error fetching on-sale products: ${error.message}`);
    throw new Error("Failed to fetch on-sale products");
  }
};

/**
 * Get new arrival products
 * @param {Number} limit - Maximum number of products to return
 * @returns {Promise<Array>} New arrival products
 */
const getNewArrivals = async (limit = 8) => {
  try {
    console.log("Getting new arrivals, limit:", limit);
    
    // Use newArrival field to match your schema intention
    const newArrivals = await Product.find({
      newArrival: true,  // Use this field name consistently 
      isActive: true
    })
    .populate("collections", "name slug")
    .sort("-createdAt")
    .limit(Number(limit));
    
    console.log(`Found ${newArrivals.length} new arrivals`);
    return newArrivals;
  } catch (error) {
    logger.error(`Error fetching new arrivals: ${error.message}`);
    throw new Error("Failed to fetch new arrivals");
  }
};

/**
 * Search products
 * @param {String} query - Search query
 * @param {Number} limit - Maximum number of results
 * @returns {Promise<Array>} Search results
 */
const searchProducts = async (query, limit = 10) => {
  try {
    console.log("DEBUG: Searching products with query:", query);
    
    if (!query) {
      return [];
    }

    // Using $text search if you have text index on product fields
    // Make sure your MongoDB has text indexes on name and description fields
    const products = await Product.find(
      {
        $text: { $search: query },
        isActive: true,
      },
      {
        score: { $meta: "textScore" },
      }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
    
    console.log(`DEBUG: Found ${products.length} matching products`);
    return products;
  } catch (error) {
    console.error("ERROR in searchProducts:", error);
    logger.error(`Error searching products: ${error.message}`);
    throw error;
  }
};


module.exports = {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  getFeaturedProducts,
  getNewArrivals,
  getOnSaleProducts,
  searchProducts,
};
