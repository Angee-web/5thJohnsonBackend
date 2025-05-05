const constants = require("../config/constants");
const seoConfig = require("../config/seoConfig");

/**
 * Middleware to add default SEO meta tags to API responses
 * This is useful for routes that return HTML content or are crawlable
 */

/**
 * Comprehensive SEO middleware to inject correct metadata for all responses
 */
const seoMiddleware = (req, res, next) => {
  // Skip for non-GET requests and API endpoints
  if (req.method !== "GET" || req.path.startsWith("/api/admin")) {
    return next();
  }

  // Store original json function
  const originalJson = res.json;

  // Override json method
  res.json = function (data) {
    // Don't modify error responses
    if (!data || !data.success) {
      return originalJson.call(this, data);
    }

    // Add SEO data if not already present
    if (!data.seo) {
      const baseUrl = seoConfig.site.url;
      const path = req.path;
      const fullUrl = `${baseUrl}${path}`;

      // Determine page type
      let pageType = "page";
      if (path.match(/^\/products\/[^\/]+$/)) pageType = "product";
      if (path.match(/^\/collections\/[^\/]+$/)) pageType = "collection";

      // Generate SEO data based on page type
      data.seo = {
        title: seoConfig.defaults.title,
        description: seoConfig.defaults.description,
        canonical: fullUrl,
        robots:
          process.env.NODE_ENV === "production"
            ? seoConfig.robots.production
            : seoConfig.robots.development,
      };
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Generate structured data (JSON-LD) for the website
 * @returns {Object} JSON-LD data
 */
const generateWebsiteStructuredData = (req) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "5thJohnson",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/products/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
};

/**
 * Add structured data to response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} type - Type of structured data to add (website, breadcrumb, etc.)
 */
const addStructuredData = (req, res, type = "website") => {
  let structuredData;

  switch (type) {
    case "website":
      structuredData = generateWebsiteStructuredData(req);
      break;
    default:
      structuredData = generateWebsiteStructuredData(req);
  }

  return structuredData;
};

module.exports = {
  seoMiddleware,
  addStructuredData,
};
