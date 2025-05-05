const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary directly here as a backup
// This ensures cloudinary is always configured when this module is used
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  // Test configuration
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn("WARNING: Cloudinary credentials are missing!");
  } else {
    console.log("Cloudinary configured in fileProcessing module");
  }
};

// Run configuration
configureCloudinary();

/**
 * Process uploaded files - upload to Cloudinary and return URL
 * @param {Object} file - Uploaded file from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (file, options = {}) => {
  try {
    // Set default options
    const uploadOptions = {
      folder: options.folder || "5thJohnson/products",
      use_filename: options.use_filename || true,
      unique_filename: options.unique_filename || true,
      overwrite: options.overwrite || true,
      resource_type: "auto",
      ...options,
    };

    // Log upload attempt
    console.log(`Uploading file to Cloudinary: ${file.originalname}`);
    console.log("File path:", file.path);

    // Verify cloudinary is properly configured
    if (!cloudinary.uploader) {
      throw new Error(
        "Cloudinary uploader is not available. Check configuration."
      );
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, uploadOptions);

    // Log successful upload
    console.log(`File uploaded to Cloudinary: ${result.public_id}`);

    // Delete local file after upload
    fs.unlinkSync(file.path);

    // Return upload result
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    // Log error and rethrow
    console.error(`Cloudinary upload error: ${error.message}`);
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    // Log deletion attempt
    console.log(`Deleting file from Cloudinary: ${publicId}`);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    // Log deletion result
    console.log(`Cloudinary deletion result: ${result.result}`);

    return result;
  } catch (error) {
    // Log error and rethrow
    console.error(`Cloudinary deletion error: ${error.message}`);
    throw error;
  }
};

/**
 * Ensure temporary upload directories exist
 */
const ensureUploadDirectories = () => {
  const uploadDir = path.join(process.cwd(), "tmp", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory: ${uploadDir}`);
  }
};

// Ensure upload directories exist on module import
ensureUploadDirectories();

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  ensureUploadDirectories,
};
