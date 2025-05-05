const constants = require("../config/constants");

/**
 * Generate SEO metadata for a product
 * @param {Object} product - Product document
 * @returns {Object} SEO metadata
 */
const generateProductSeo = (product) => {
  return {
    title:
      product.metadata?.seo?.metaTitle ||
      `${product.name} | ${constants.SEO.DEFAULT_META_TITLE}`,
    description:
      product.metadata?.seo?.metaDescription ||
      truncate(
        `Shop ${product.name} at 5thJohnson. ${product.description}`,
        constants.SEO.MAX_META_DESCRIPTION_LENGTH
      ),
    keywords:
      product.metadata?.seo?.keywords ||
      generateKeywords(product.name, product.description),
    image: product.getFeaturedImage()?.url,
    url: `/products/${product._id}`,
  };
};

/**
 * Generate SEO metadata for a collection
 * @param {Object} collection - Collection document
 * @returns {Object} SEO metadata
 */
const generateCollectionSeo = (collection) => {
  return {
    title:
      collection.metadata?.seo?.metaTitle ||
      `${collection.name} | ${constants.SEO.DEFAULT_META_TITLE}`,
    description:
      collection.metadata?.seo?.metaDescription ||
      truncate(
        `Shop the ${collection.name} collection at 5thJohnson. ${collection.description}`,
        constants.SEO.MAX_META_DESCRIPTION_LENGTH
      ),
    keywords:
      collection.metadata?.seo?.keywords ||
      generateKeywords(collection.name, collection.description),
    image: collection.image?.url,
    url: `/collections/${collection.slug || collection._id}`,
  };
};

/**
 * Generate JSON-LD structured data for a product
 * @param {Object} product - Product document
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} JSON-LD structured data
 */
/**
 * Generate Product JSON-LD schema
 */
const generateProductJsonLd = (product, baseUrl) => {
  if (!product) return null;

  const image = product.getFeaturedImage();
  const rating = {
    "@type": "AggregateRating",
    "ratingValue": product.rating || 0,
    "reviewCount": product.reviewCount || 0, // Use reviewCount from product model
    "bestRating": "5",
    "worstRating": "1"
  };

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": image.url,
    "description": product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "5thJohnson"
    },
    "offers": {
      "@type": "Offer",
      "url": `${baseUrl}/products/${product.slug || product._id}`,
      "priceCurrency": "USD",
      "price": product.salePrice || product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    },
    // Only include rating if product has reviews
    ...(product.reviewCount > 0 ? { "aggregateRating": rating } : {})
  };
};


/**
 * Generate JSON-LD structured data for breadcrumbs
 * @param {Array} items - Breadcrumb items
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} JSON-LD structured data
 */
const generateBreadcrumbJsonLd = (items, baseUrl) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
};

/**
 * Extract keywords from text
 * @param {String} title - Title text
 * @param {String} content - Content text
 * @returns {Array} Array of keywords
 */
const generateKeywords = (title = "", content = "") => {
  const combined = `${title} ${content}`.toLowerCase();

  // Remove special characters and split into words
  const words = combined.replace(/[^\w\s]/g, " ").split(/\s+/);

  // Filter out common words and short words
  const commonWords = [
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "on",
    "at",
    "to",
    "from",
    "by",
  ];
  const keywords = words.filter(
    (word) => word.length > 3 && !commonWords.includes(word)
  );

  // Remove duplicates and limit number of keywords
  return [...new Set(keywords)].slice(0, 10);
};

/**
 * Truncate text to specified length
 * @param {String} text - Text to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String} Truncated text
 */
const truncate = (text, maxLength = 160) => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  // Truncate at the last space before maxLength to avoid cutting words
  return text.substring(0, text.lastIndexOf(" ", maxLength)) + "...";
};

// Add this function to your seoHelpers.js file

/**
 * Generate default SEO metadata
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} Default SEO metadata
 */
const generateDefaultSeo = (baseUrl) => {
  return {
    title: "5thJohnson - Premium Clothing Collection",
    description: "Shop premium clothing at 5thJohnson. Discover the latest fashion trends, styles, and collections.",
    keywords: "5thJohnson, clothing, fashion, premium clothing, fashion trends",
    canonicalUrl: baseUrl,
    ogType: "website",
    ogTitle: "5thJohnson Clothing",
    ogDescription: "Premium clothing and fashion accessories for every occasion.",
    ogImage: `${baseUrl}/images/logo.png`,
    ogUrl: baseUrl,
    twitterCard: "summary_large_image",
    twitterTitle: "5thJohnson Clothing",
    twitterDescription: "Premium clothing and fashion accessories for every occasion.",
    twitterImage: `${baseUrl}/images/logo.png`
  };
};


module.exports = {
  generateProductSeo,
  generateCollectionSeo,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateDefaultSeo,
  generateKeywords,
  truncate,
};
