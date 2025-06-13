const Collection = require("../models/Collection");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const mongoose = require("mongoose");

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data
 * @returns {Promise<Object>} Created collection
 */
const createCollection = async (collectionData) => {
  try {
    const collection = new Collection(collectionData);
    await collection.save();
    logger.info(`Collection created: ${collection._id}`);
    return collection;
  } catch (error) {
    logger.error(`Error creating collection: ${error.message}`);
    throw error;
  }
};

/**
 * Get collection by ID
 * @param {String} id - Collection ID or slug
 * @returns {Promise<Object>} Collection document
 */
const getCollectionById = async (id) => {
  try {
    let collection;

    // First try to find by ID
    if (mongoose.Types.ObjectId.isValid(id)) {
      collection = await Collection.findById(id);
    }

    // If not found by ID, try to find by slug
    if (!collection) {
      collection = await Collection.findOne({ slug: id });
    }

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    return collection;
  } catch (error) {
    logger.error(`Error fetching collection ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Get collections with filtering and pagination
 * @param {Object} filters - Filter conditions
 * @param {Object} options - Query options (sort, pagination)
 * @returns {Promise<Object>} Collections and pagination info
 */
const getCollections = async (filters = {}, options = {}) => {
  try {
    const query = {};

    // Apply search filter if provided
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Apply featured filter only if explicitly provided
    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    // Apply isActive filter only if explicitly provided
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Set default pagination if not provided
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Apply sorting or use default sort
    const sort = options.sort || { order: 1 };

    // Execute query with pagination
    const collections = await Collection.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Collection.countDocuments(query);

    return {
      collections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error getting collections: ${error.message}`);
    throw error;
  }
};

/**
 * Get collections that have products
 * @param {Object} options - Query options (pagination, sort)
 * @returns {Promise<Object>} Collections with products and pagination info
 */
const getCollectionsWithProducts = async (options = {}) => {
  try {
    console.log("Getting collections with products, options:", options);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || { order: 1 };

    const productsWithCollections = await Product.find({
      collections: { $exists: true, $ne: [] },
    })
      .select("_id name collections")
      .lean();

    console.log(`Found ${productsWithCollections.length} products with collections`);

    const allCollectionIds = [];
    const productsByCollection = {};

    productsWithCollections.forEach((product) => {
      if (Array.isArray(product.collections)) {
        product.collections.forEach((collId) => {
          const collectionId = collId.toString();

          if (!productsByCollection[collectionId]) {
            productsByCollection[collectionId] = {
              count: 0,
              productIds: [],
            };
            allCollectionIds.push(collectionId);
          }

          productsByCollection[collectionId].count++;
          productsByCollection[collectionId].productIds.push(product._id);
        });
      }
    });

    console.log(`Found ${allCollectionIds.length} collections with products`);

    if (allCollectionIds.length === 0) {
      return {
        collections: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      };
    }

    const collectionObjectIds = allCollectionIds.map((id) =>
      mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id
    );

    console.log("Converted ObjectIds:", collectionObjectIds);

    const collections = await Collection.find({
      _id: { $in: collectionObjectIds },
    })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log(`Retrieved ${collections.length} collections`);

    const enhancedCollections = await Promise.all(
      collections.map(async (collection) => {
        const collectionId = collection._id.toString();
        const productInfo = productsByCollection[collectionId] || {
          count: 0,
          productIds: [],
        };

        const products = await Product.find({
          _id: { $in: productInfo.productIds.slice(0, 10) },
        })
          .select("_id name price images slug")
          .lean();

        collection.products = products.map((product) => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          slug: product.slug,
          imageUrl:
            product.images && product.images.length
              ? product.images[0].url
              : null,
        }));

        if (!collection.metadata) collection.metadata = {};
        collection.metadata.productCount = productInfo.count;

        return collection;
      })
    );

    return {
      collections: enhancedCollections,
      pagination: {
        page,
        limit,
        total: allCollectionIds.length,
        pages: Math.ceil(allCollectionIds.length / limit),
      },
    };
  } catch (error) {
    logger.error(`Error getting collections with products: ${error.message}`);
    throw error;
  }
};


/**
 * Update collection by ID
 * @param {String} id - Collection ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated collection
 */
const updateCollection = async (id, updateData) => {
  try {
    const collection = await Collection.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    logger.info(`Collection updated: ${id}`);
    return collection;
  } catch (error) {
    logger.error(`Error updating collection ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Delete collection by ID
 * @param {String} id - Collection ID
 * @returns {Promise<Object>} Success message
 */
const deleteCollection = async (id) => {
  try {
    const collection = await Collection.findById(id);

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    // First remove this collection reference from all products
    await Product.updateMany(
      { collections: collection._id },
      { $pull: { collections: collection._id } }
    );

    // Delete collection image from cloudinary if it exists
    if (collection.image && collection.image.publicId) {
      await cloudinary.deleteFromCloudinary(collection.image.publicId);
    }

    // Delete the collection
    await collection.deleteOne();

    logger.info(`Collection deleted: ${id}`);
    return { success: true, id };
  } catch (error) {
    logger.error(`Error deleting collection ${id}: ${error.message}`);
    throw error;
  }
};

/**
 * Upload collection image
 * @param {String} collectionId - Collection ID
 * @param {Object} imageData - Image data
 * @returns {Promise<Object>} Updated collection
 */
const uploadCollectionImage = async (collectionId, imageData) => {
  try {
    const { url, publicId, altText = "" } = imageData;

    const collection = await Collection.findById(collectionId);

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    // Delete old image if it exists
    if (collection.image && collection.image.publicId) {
      await cloudinary.deleteFromCloudinary(collection.image.publicId);
    }

    // Set new image
    collection.image = {
      url,
      publicId,
      altText,
    };

    await collection.save();
    logger.info(`Image added to collection ${collectionId}`);

    return collection;
  } catch (error) {
    logger.error(`Error uploading collection image: ${error.message}`);
    throw error;
  }
};

/**
 * Add products to collection
 * @param {String} collectionId - Collection ID
 * @param {Array} productIds - Array of product IDs
 * @returns {Promise<Object>} Updated collection with product count
 */
const addProductsToCollection = async (collectionId, productIds) => {
  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    // Add collection to each product's collections array
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { collections: collection._id } }
    );

    // Update product count
    await Collection.updateProductCount(collection._id);

    // Get updated collection
    const updatedCollection = await Collection.findById(collectionId);

    logger.info(
      `Added ${productIds.length} products to collection ${collectionId}`
    );
    return updatedCollection;
  } catch (error) {
    logger.error(`Error adding products to collection: ${error.message}`);
    throw error;
  }
};

/**
 * Remove products from collection
 * @param {String} collectionId - Collection ID
 * @param {Array} productIds - Array of product IDs
 * @returns {Promise<Object>} Updated collection with product count
 */
const removeProductsFromCollection = async (collectionId, productIds) => {
  try {
    const collection = await Collection.findById(collectionId);

    if (!collection) {
      throw new AppError("Collection not found", 404);
    }

    // Remove collection from each product's collections array
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $pull: { collections: collection._id } }
    );

    // Update product count
    await Collection.updateProductCount(collection._id);

    // Get updated collection
    const updatedCollection = await Collection.findById(collectionId);

    logger.info(
      `Removed ${productIds.length} products from collection ${collectionId}`
    );
    return updatedCollection;
  } catch (error) {
    logger.error(`Error removing products from collection: ${error.message}`);
    throw error;
  }
};

/**
 * Get featured collections
 * @param {Number} limit - Maximum number of collections to return
 * @returns {Promise<Array>} Featured collections
 */
const getFeaturedCollections = async (limit = 4) => {
  try {
    return await Collection.find({
      isActive: true,
      featured: true,
    })
      .sort({ order: 1, name: 1 })
      .limit(limit);
  } catch (error) {
    logger.error(`Error fetching featured collections: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createCollection,
  getCollectionById,
  getCollections,
  getCollectionsWithProducts,
  updateCollection,
  deleteCollection,
  uploadCollectionImage,
  addProductsToCollection,
  removeProductsFromCollection,
  getFeaturedCollections,
};
