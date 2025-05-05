const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log configuration attempt
console.log("Configuring Cloudinary with:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "FOUND" : "MISSING",
  api_key: process.env.CLOUDINARY_API_KEY ? "FOUND" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "FOUND" : "MISSING",
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
