const collectionService = require("../../services/collectionService");
const cloudinaryService = require("../../services/cloudinaryService");
const { successResponse, errorResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");
const Collection = require("../../models/Collection");
const Product = require("../../models/Product");

/**
 * Create a new collection
 * @route POST /api/admin/collections
 */
const createCollection = async (req, res, next) => {
  try {
    const collection = await collectionService.createCollection(req.body);

    return successResponse(
      res,
      "Collection created successfully",
      { collection },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all collections with filtering and pagination
 * @route GET /api/admin/collections
 */
const getCollections = async (req, res, next) => {
  try {
    // Extract query parameters
    const { page, limit, sort, search, featured, isActive } = req.query;

    // Format filters - only apply filters when they're provided
    const filters = {};

    if (search) filters.search = search;
    if (featured !== undefined) filters.featured = featured === "true";
    if (isActive !== undefined) filters.isActive = isActive === "true";

    // Format options
    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    };

    // Add sorting if provided
    if (sort) {
      options.sort = {};
      const [field, order] = sort.split(":");
      options.sort[field] = order === "desc" ? -1 : 1;
    }

    const result = await collectionService.getCollections(filters, options);

    return successResponse(res, "Collections fetched successfully", result);
  } catch (error) {
    next(error);
  }
};


/**
 * Get collection by ID with product details
 * @route GET /api/admin/collections/:id
 */
const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get collection
    let collection = await Collection.findById(id);
    
    if (!collection) {
      return errorResponse(res, "Collection not found", 404);
    }

    let products = [];
    let productCount = 0;

    // If products are stored directly in the collection
    if (collection.products && collection.products.length) {
      // Fetch the actual product details
      products = await Product.find(
        { _id: { $in: collection.products }, isActive: true },
        'name price images.url slug' // Select only needed fields
      ).lean();
      
      productCount = products.length;
    } else {
      // If products store collection references
      products = await Product.find(
        { collections: collection._id, isActive: true },
        'name price images.url slug' // Select only needed fields
      ).lean();
      
      productCount = products.length;
    }

    // Update metadata
    if (!collection.metadata) {
      collection.metadata = {};
    }
    collection.metadata.productCount = productCount;
    
    // Update collection with current count in database
    await Collection.findByIdAndUpdate(id, {
      "metadata.productCount": productCount
    });

    // Convert to plain object to add products
    const collectionData = collection.toObject();
    
    // Add products to the response
    collectionData.products = products.map(product => ({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.images && product.images.length ? product.images[0].url : null,
      slug: product.slug
    }));

    return successResponse(
      res,
      {
        collection: collectionData,
        productCount: productCount,
      },
      "Collection fetched successfully",
      200
    );
  } catch (error) {
    console.error("Error fetching collection:", error);
    next(error);
  }
};

/**
 * Get collections that have products
 * @route GET /api/admin/collections/with-products
 */
const getCollectionsWithProducts = async (req, res, next) => {
  try {
    const { page, limit, sort } = req.query;

    // Format options
    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10
    };

    // Add sorting if provided
    if (sort) {
      options.sort = {};
      const [field, order] = sort.split(":");
      options.sort[field] = order === "desc" ? -1 : 1;
    }

    // Get collections with products
    const result = await collectionService.getCollectionsWithProducts(options);

    return successResponse(
      res,
      {
        collections: result.collections,
        pagination: result.pagination
      },
      "Collections with products fetched successfully"
    );
  } catch (error) {
    console.error("Error fetching collections with products:", error);
    next(error);
  }
};


/**
 * Update collection
 * @route PUT /api/admin/collections/:id
 */
const updateCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const collection = await collectionService.updateCollection(id, req.body);

    return successResponse(res, "Collection updated successfully", {
      collection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete collection
 * @route DELETE /api/admin/collections/:id
 */
const deleteCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    await collectionService.deleteCollection(id);

    return successResponse(res, "Collection deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Upload collection image
 * @route POST /api/admin/collections/:id/image
 */
const uploadCollectionImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if file exists in request
    if (!req.file) {
      return errorResponse(res, "No image file provided", 400);
    }

    // Get collection
    const collection = await Collection.findById(id);
    if (!collection) {
      return errorResponse(res, "Collection not found", 404);
    }

    // Upload image to Cloudinary
    const folder = `5thJohnson/collections/${id}`;
    const result = await cloudinaryService.uploadImage(req.file, { folder });

    // Delete old image if exists
    if (collection.image && collection.image.publicId) {
      try {
        await cloudinaryService.deleteImage(collection.image.publicId);
      } catch (error) {
        logger.error(`Error deleting old image: ${error.message}`);
        // Continue even if delete fails
      }
    }

    // Update collection with new image
    collection.image = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };

    await collection.save();

    return successResponse(
      res,
      {
        collection,
        image: collection.image,
      },
      "Image uploaded successfully"
    );
  } catch (error) {
    logger.error(`Error uploading collection image: ${error.message}`);
    next(error);
  }
};


/**
 * Add products to collection
 * @route POST /api/admin/collections/:id/products
 */
// Example fix for addProductsToCollection function
const addProductsToCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    // Get collection
    const collection = await Collection.findById(id);
    if (!collection) {
      return errorResponse(res, "Collection not found", 404);
    }

    // Check if all products exist
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });

    if (products.length !== productIds.length) {
      return errorResponse(res, "Some products were not found", 400);
    }

    // Add products to collection
    let productsAdded = 0;

    // If using a products field in collection
    if (!collection.products) {
      collection.products = [];
    }

    // Add only products not already in collection
    for (const productId of productIds) {
      if (!collection.products.includes(productId)) {
        collection.products.push(productId);
        productsAdded++;
      }
    }

    // Update product count in metadata
    if (!collection.metadata) {
      collection.metadata = {};
    }
    collection.metadata.productCount = collection.products.length;

    // Save collection
    await collection.save();

    // Also update products if they store collection references
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { collections: collection._id } }
    );

    return successResponse(
      res,
      {
        collection,
      },
      `Products added to collection successfully`,
      200
    );
  } catch (error) {
    console.error("Error adding products to collection:", error);
    next(error);
  }
};

/**
 * Remove products from collection
 * @route DELETE /api/admin/collections/:id/products
 */
const removeProductsFromCollection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return errorResponse(res, "Product IDs array is required", 400);
    }

    const collection = await collectionService.removeProductsFromCollection(
      id,
      productIds
    );

    return successResponse(
      res,
      "Products removed from collection successfully",
      { collection }
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  getCollectionsWithProducts,
  updateCollection,
  deleteCollection,
  uploadCollectionImage,
  addProductsToCollection,
  removeProductsFromCollection,
};
