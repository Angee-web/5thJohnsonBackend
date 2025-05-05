const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkProducts() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Get the Product model - with a flexible schema
    const Product = mongoose.model(
      "Product",
      new mongoose.Schema({}, { strict: false })
    );

    // Count all products
    const totalCount = await Product.countDocuments();
    console.log(`Total products in database: ${totalCount}`);

    if (totalCount === 0) {
      console.log(
        "No products found in database! You may need to run your seeder."
      );
    } else {
      // Get a sample of products to inspect
      const products = await Product.find().limit(2).lean();
      console.log("Sample products:");
      products.forEach((p) => {
        console.log({
          id: p._id,
          name: p.name,
          isActive: p.isActive,
          price: p.price,
        });
      });
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error(`Error checking products: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Run the function
checkProducts();
