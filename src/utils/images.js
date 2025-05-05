const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

/**
 * Optimize and resize product images
 * @param {Buffer|string} input - Input image buffer or file path
 * @param {string} outputPath - Path to save optimized image
 * @param {Object} options - Resize and optimization options
 */
const optimizeProductImage = async (input, outputPath, options = {}) => {
  try {
    const {
      width = null,
      height = null,
      quality = 80,
      format = "jpeg",
    } = options;

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process the image
    let sharpInstance = sharp(input).resize(width, height, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    });

    // Select format
    if (format === "webp") {
      sharpInstance = sharpInstance.webp({ quality });
    } else if (format === "png") {
      sharpInstance = sharpInstance.png({ quality });
    } else {
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
    }

    // Save optimized image
    await sharpInstance.toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error("Image optimization error:", error);
    throw error;
  }
};

/**
 * Generate all required sizes for a product image
 * @param {string} originalPath - Path to the original image
 * @param {string} productSlug - Product slug for filename
 */
const generateProductImageSizes = async (originalPath, productSlug) => {
  try {
    const filename = path.basename(originalPath);
    const baseDir = path.resolve("public/images/products");

    // Create all sizes
    const sizes = [
      { name: "thumbnail", width: 200, height: 200, format: "webp" },
      { name: "medium", width: 600, height: 600, format: "webp" },
      { name: "large", width: 1200, height: null, format: "webp" },
    ];

    const results = await Promise.all(
      sizes.map((size) => {
        const outputPath = path.join(
          baseDir,
          size.name,
          `${productSlug}-${size.name}.${size.format}`
        );

        return optimizeProductImage(originalPath, outputPath, {
          width: size.width,
          height: size.height,
          quality: 80,
          format: size.format,
        });
      })
    );

    return {
      thumbnail: results[0],
      medium: results[1],
      large: results[2],
      original: originalPath,
    };
  } catch (error) {
    console.error("Error generating product image sizes:", error);
    throw error;
  }
};

module.exports = {
  optimizeProductImage,
  generateProductImageSizes,
};
