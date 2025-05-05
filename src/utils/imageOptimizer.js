/**
 * Image optimization utilities for 5thJohnson
 *
 * This file should contain methods for:
 * 1. Optimizing product images
 * 2. Generating responsive image sets
 * 3. Converting images to modern formats
 */

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
    } else if (format === "avif") {
      sharpInstance = sharpInstance.avif({ quality });
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
    const baseDir = path.resolve("public/images/products");

    // Create all sizes
    const sizes = [
      { name: "thumbnail", width: 200, height: 200, format: "webp" },
      { name: "medium", width: 600, height: 600, format: "webp" },
      { name: "large", width: 1200, height: null, format: "webp" },
      // Also generate AVIF for modern browsers
      { name: "thumbnail", width: 200, height: 200, format: "avif" },
      { name: "medium", width: 600, height: 600, format: "avif" },
      // Fallback JPEG for older browsers
      { name: "medium", width: 600, height: 600, format: "jpeg" },
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
          quality: size.format === "jpeg" ? 85 : 80,
          format: size.format,
        });
      })
    );

    // Return paths organized by size and format
    const imagePaths = {
      thumbnail: {
        webp: results[0],
        avif: results[3],
      },
      medium: {
        webp: results[1],
        avif: results[4],
        jpeg: results[5],
      },
      large: {
        webp: results[2],
      },
      original: originalPath,
    };

    return imagePaths;
  } catch (error) {
    console.error("Error generating product image sizes:", error);
    throw error;
  }
};

/**
 * Create responsive image HTML for product images
 * @param {Object} imagePaths - Object containing paths to different image versions
 * @param {string} alt - Alt text for the image
 */
const createResponsiveImageHtml = (imagePaths, alt) => {
  return `
    <picture>
      <!-- AVIF format for browsers that support it -->
      <source
        srcset="${imagePaths.thumbnail.avif} 200w, ${imagePaths.medium.avif} 600w"
        type="image/avif"
        sizes="(max-width: 600px) 200px, 600px"
      />
      <!-- WebP format for browsers that support it -->
      <source
        srcset="${imagePaths.thumbnail.webp} 200w, ${imagePaths.medium.webp} 600w, ${imagePaths.large.webp} 1200w"
        type="image/webp"
        sizes="(max-width: 600px) 200px, (max-width: 1200px) 600px, 1200px"
      />
      <!-- JPEG fallback -->
      <img
        src="${imagePaths.medium.jpeg}"
        alt="${alt}"
        loading="lazy"
        width="600"
        height="600"
      />
    </picture>
  `;
};

module.exports = {
  optimizeProductImage,
  generateProductImageSizes,
  createResponsiveImageHtml,
};
