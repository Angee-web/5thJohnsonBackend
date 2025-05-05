const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function migrateToNewArrival() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Get the Product model
    const Product = mongoose.model(
      "Product",
      new mongoose.Schema({}, { strict: false })
    );

    // Step 1: Find all documents that have the isNew field
    const productsWithIsNew = await Product.find({
      isNew: { $exists: true },
    }).lean();
    console.log(`Found ${productsWithIsNew.length} products with isNew field`);

    // Step 2: Update these documents to copy isNew value to newArrival
    console.log("Updating products to use newArrival instead of isNew...");
    const updates = [];

    for (const product of productsWithIsNew) {
      console.log(`Updating product: ${product.name} (${product._id})`);
      updates.push(
        Product.updateOne(
          { _id: product._id },
          {
            $set: { newArrival: product.isNew },
            $unset: { isNew: "" },
          }
        )
      );
    }

    // Execute all updates
    const results = await Promise.all(updates);

    let modifiedCount = 0;
    results.forEach((result) => {
      modifiedCount += result.modifiedCount;
    });

    console.log(`Successfully updated ${modifiedCount} products`);

    // Verify the update
    const productsWithNewArrival = await Product.find({
      newArrival: true,
    }).lean();
    console.log(
      `\nVerification: Found ${productsWithNewArrival.length} products with newArrival=true`
    );

    if (productsWithNewArrival.length > 0) {
      console.log("Products with newArrival=true:");
      productsWithNewArrival.forEach((p) => {
        console.log(`- ${p.name} (${p._id})`);
      });
    }

    // Check if any products still have isNew field
    const remainingWithIsNew = await Product.find({
      isNew: { $exists: true },
    }).countDocuments();
    console.log(`\nProducts still with isNew field: ${remainingWithIsNew}`);

    console.log("\nMigration completed successfully!");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error(`Error during migration: ${error.message}`);
    // If connected, disconnect on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Run the migration function
migrateToNewArrival();
