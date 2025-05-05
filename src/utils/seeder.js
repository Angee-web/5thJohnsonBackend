const mongoose = require("mongoose");
const Product = require("../models/Product");
const Collection = require("../models/Collection");
// Import other models as needed
const products = require("./seedData/products");
const collections = require("./seedData/collections");
// Import other seed data as needed
const config = require("../config/config");
const logger = require("./logger");

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    logger.info("Connected to MongoDB for seeding");

    // Process products to ensure they use newArrival and not isNew
    const processedProducts = products.map((product) => {
      // If product has isNew field, transfer its value to newArrival and remove isNew
      if (product.isNew !== undefined) {
        product.newArrival = product.isNew;
        delete product.isNew; // Remove isNew property
      }

      // Make sure newArrival exists (default to false if missing)
      if (product.newArrival === undefined) {
        product.newArrival = false;
      }

      return product;
    });

    // Clear existing data
    logger.info("Clearing existing data...");
    await Collection.deleteMany({});
    await Product.deleteMany({});
    // Delete other model data as needed

    // Insert collections first
    logger.info("Seeding collections...");
    const createdCollections = await Collection.insertMany(collections);

    // Create a map of collection names to ObjectIds for reference
    const collectionMap = {};
    createdCollections.forEach((collection) => {
      collectionMap[collection.name] = collection._id;
    });

    // Update product references to collections
    logger.info("Seeding products...");
    const productsWithCollectionIds = processedProducts.map((product) => {
      // Convert collection names to ObjectIds
      if (product.collections) {
        product.collections = product.collections.map(
          (collName) => collectionMap[collName] || collName
        );
      }
      return product;
    });

    // Insert products
    await Product.insertMany(productsWithCollectionIds);

    // Seed other data as needed

    logger.info("Database seeded successfully");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB after seeding");

    return { success: true };
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`);
    // If connected, disconnect on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    return { success: false, error: error.message };
  }
}

// If this script is run directly, execute the seed function
if (require.main === module) {
  seedDatabase().then((result) => {
    if (result.success) {
      console.log("Database seeded successfully");
      process.exit(0);
    } else {
      console.error("Failed to seed database:", result.error);
      process.exit(1);
    }
  });
}

module.exports = seedDatabase;
