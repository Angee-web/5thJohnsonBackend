const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

// Import the Product model
const Product = require("./src/models/Product");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Fetch a product by ID
const fetchProductById = async (productId) => {
  try {
    console.log(`Fetching product with ID: ${productId}`);
    const product = await Product.findById(productId).populate("collections", "name slug").lean();
    if (!product) {
      console.log("Product not found");
    } else {
      console.log("Product fetched successfully:", product);
    }
  } catch (error) {
    console.error("Error fetching product by ID:", error.message);
  }
};

// Fetch all products with pagination
const fetchAllProducts = async (page = 1, limit = 10) => {
  try {
    console.log(`Fetching products - Page: ${page}, Limit: ${limit}`);
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    console.log(`Fetched ${products.length} products:`, products);
  } catch (error) {
    console.error("Error fetching all products:", error.message);
  }
};

// Main function to test fetching products
const main = async () => {
  await connectDB();

  // Test fetching a product by ID
  const testProductId = "60f7c2f5b5d3c2a5d4e8b9c1"; // Replace with a valid product ID
  await fetchProductById(testProductId);

  // Test fetching all products with pagination
  const testPage = 1;
  const testLimit = 5;
  await fetchAllProducts(testPage, testLimit);

  // Close the database connection
  mongoose.connection.close();
  console.log("Database connection closed");
};

// Run the main function
main();