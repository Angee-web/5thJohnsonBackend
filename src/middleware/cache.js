/**
 * Caching middleware for improved performance
 * Implements a simple in-memory cache for API responses
 */

const nodeCache = require("node-cache");
const cache = new nodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired items every 60 seconds
});

/**
 * Determine if a request should be cached
 * @param {Object} req - Express request object
 * @returns {boolean} Whether the request should be cached
 */
const shouldCache = (req) => {
  // Only cache GET requests
  if (req.method !== "GET") {
    return false;
  }

  // Don't cache authenticated requests or admin routes
  if (req.path.includes("/admin") || req.path.includes("/auth")) {
    return false;
  }

  // Don't cache requests with specific query params
  if (req.query.nocache === "true") {
    return false;
  }

  return true;
};

/**
 * Generate a cache key from the request
 * @param {Object} req - Express request object
 * @returns {string} Cache key
 */
const getCacheKey = (req) => {
  // Basic cache key is the full URL including query params
  let key = `${req.method}:${req.originalUrl}`;

  // For authenticated users, add user ID to key to prevent cache leakage
  if (req.user) {
    key += `:${req.user.id}`;
  }

  return key;
};

/**
 * Cache middleware for Express
 */
const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300, // 5 minutes
    debug = false,
  } = options;

  return (req, res, next) => {
    if (!shouldCache(req)) {
      return next();
    }

    const key = getCacheKey(req);
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      if (debug) {
        console.log(`Cache hit for ${key}`);
      }
      return res.json(cachedResponse);
    }

    if (debug) {
      console.log(`Cache miss for ${key}`);
    }

    // Store the original res.json function
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, ttl);
      }

      // Call the original function with the response body
      return originalJson.call(this, body);
    };

    next();
  };
};

/**
 * Clear the entire cache or specific keys
 * @param {string|string[]} keys - Optional specific keys to clear
 */
const clearCache = (keys) => {
  if (!keys) {
    cache.flushAll();
    return;
  }

  if (Array.isArray(keys)) {
    keys.forEach((key) => cache.del(key));
  } else {
    cache.del(keys);
  }
};

module.exports = {
  cacheMiddleware,
  clearCache,
};
