require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Debug environment variables
console.log("Environment Variables:", {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

(async () => {
  try {
    console.log("Starting upload...");
    const result = await cloudinary.uploader.upload("tmp/uploads/Passport_Photograph.jpg", {
      folder: "test-folder",
    });
    console.log("Upload result:", result);
  } catch (err) {
    console.error("Upload failed:", err);
  }
})();