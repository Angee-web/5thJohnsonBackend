/**
 * Application-wide constants
 */

// Authentication constants
const AUTH = {
  API_KEY_HEADER: "x-api-key",
  SESSION_COOKIE_NAME: "5thJohnsonSession",
  SESSION_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  ADMIN_SESSION_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Rate limiting constants
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // 100 requests per window
  STRICT_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  STRICT_MAX_REQUESTS: 10, // 10 requests per hour for sensitive endpoints
};

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

// File upload limits
const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGES_PER_PRODUCT: 8,
};

// SEO defaults
const SEO = {
  DEFAULT_META_TITLE: "5thJohnson - Premium Clothing Collection",
  DEFAULT_META_DESCRIPTION:
    "Shop premium clothing at 5thJohnson. Discover the latest fashion trends, styles, and collections.",
  MAX_META_TITLE_LENGTH: 70,
  MAX_META_DESCRIPTION_LENGTH: 160,
};

// Cache durations in seconds
const CACHE = {
  PRODUCT_CACHE: 60 * 60, // 1 hour
  COLLECTION_CACHE: 60 * 60 * 2, // 2 hours
  HOMEPAGE_CACHE: 60 * 30, // 30 minutes
};

// Export all constants
module.exports = {
  AUTH,
  RATE_LIMIT,
  PAGINATION,
  UPLOAD,
  SEO,
  CACHE,

  // Convert object constants to flat constants for backward compatibility
  API_KEY_HEADER: AUTH.API_KEY_HEADER,
  SESSION_COOKIE_NAME: AUTH.SESSION_COOKIE_NAME,
  SESSION_EXPIRY: AUTH.SESSION_EXPIRY,
  RATE_LIMIT_WINDOW_MS: RATE_LIMIT.WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: RATE_LIMIT.MAX_REQUESTS,
  DEFAULT_PAGE: PAGINATION.DEFAULT_PAGE,
  DEFAULT_LIMIT: PAGINATION.DEFAULT_LIMIT,
  MAX_LIMIT: PAGINATION.MAX_LIMIT,
  DEFAULT_META_TITLE: SEO.DEFAULT_META_TITLE,
  DEFAULT_META_DESCRIPTION: SEO.DEFAULT_META_DESCRIPTION,
};
