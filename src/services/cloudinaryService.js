const cloudinary = require("../config/cloudinary");
const { uploadToCloudinary } = require("../utils/fileProcessing");
const logger = require("../utils/logger");

/**
 * Upload image to Cloudinary
 * @param {Object} file - Multer file object
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadImage = async (file, options = {}) => {
  try {
    // Validate file exists
    if (!file || (!file.path && !file.buffer)) {
      throw new Error("Missing required parameter - file");
    }

    const {
      folder = "products",
      width = 1200,
      quality = 80,
      format = "webp",
      tags = [],
    } = options;

    // Create upload options
    const uploadOptions = {
      folder,
      resource_type: "image",
      transformation: [{ width, quality, format }],
      tags,
    };

    // Use the file path directly (this is what multer provides)
    const filePath = file.path;

    // Upload to Cloudinary using your existing utility
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Return formatted result
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error(`Error uploading image to Cloudinary: ${error.message}`);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The public ID of the image
 * @returns {Promise<Object>} - Cloudinary delete result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Error deleting image from Cloudinary: ${error.message}`);
    throw error;
  }
};


/**
 * Generate responsive image URLs
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {Object} Responsive image URLs
 */
const getResponsiveImageUrl = (publicId, options = {}) => {
  const { cloudName } = cloudinary.cloudinary.config();
  const { widths = [320, 640, 960, 1280], transformations = {} } = options;

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  // Build transformation string
  const transformationStr = Object.entries(transformations)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  // Generate URLs for different sizes
  const urls = widths.reduce((acc, width) => {
    const quality = width <= 640 ? 70 : 80;
    const transform = `${
      transformationStr ? transformationStr + "," : ""
    }w_${width},q_${quality}`;

    acc[width] = `${baseUrl}/${transform}/${publicId}`;
    return acc;
  }, {});

  // Add original URL
  urls.original = `${baseUrl}/${publicId}`;

  return urls;
};

module.exports = {
  uploadImage,
  deleteImage,
  getResponsiveImageUrl,
};
