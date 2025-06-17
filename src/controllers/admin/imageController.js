const { cloudinary_js_config } = require("../../config/cloudinary");
const logger = require("../../utils/logger");


/**
 * Upload a background image
 * @route POST /api/admin/background/upload
 */
const uploadBackgroundImage = async (req, res, next) => {
  try {
    // Check if a file is provided
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Upload the image to Cloudinary
    const result = await cloudinary_js_config.uploader.upload(req.file.path, {
      folder: "5thJohnson/backgrounds",
    });

    logger.info(`Background image uploaded: ${result.secure_url}`);

    return res.status(200).json({
      success: true,
      message: "Background image uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    logger.error(`Error uploading background image: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to upload background image",
    });
  }
};

module.exports = { uploadBackgroundImage };