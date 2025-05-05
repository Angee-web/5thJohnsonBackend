const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Product = require("../../models/Product");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkDatabase() {
  try {
    // Get MongoDB URI from environment variable - use MONGO_URI which is what's in your .env
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Check all products
    console.log("\n--- All Products ---");
    const products = await Product.find({}).lean();
    console.log(`Total products: ${products.length}`);

    // Check new arrival products
    console.log("\n--- New Arrival Products ---");
    const newArrivals = await Product.find({ newArrival: true }).lean();
    console.log(`Products with newArrival=true: ${newArrivals.length}`);

    if (newArrivals.length > 0) {
      console.log("New arrival products:");
      newArrivals.forEach((p) => {
        console.log(`- ${p.name} (${p._id})`);
      });
    } else {
      console.log("No products found with newArrival=true");
    }

    // Check if any products have isNew field
    const productsWithIsNew = products.filter((p) => p.isNew !== undefined);
    console.log(`\nProducts with isNew field: ${productsWithIsNew.length}`);

    if (productsWithIsNew.length > 0) {
      console.log("Products with isNew field:");
      productsWithIsNew.forEach((p) => {
        console.log(`- ${p.name}: isNew=${p.isNew}`);
      });
    }

    // Print first 2 products with full details for inspection
    console.log("\n--- Sample Products (Full Details) ---");
    products.slice(0, 2).forEach((p) => {
      console.log(JSON.stringify(p, null, 2));
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error(`Error checking database: ${error.message}`);
    // If connected, disconnect on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Run the function when the script is executed directly
checkDatabase();
