/**
 * Middleware to set canonical URLs for API responses
 * Helps prevent duplicate content issues for SEO
 */

const setCanonicalUrl = (req, res, next) => {
  const baseUrl = process.env.BASE_URL || "https://www.5thjohnson.com";

  // Extract the original path without query parameters
  const path = req.originalUrl.split("?")[0];

  // Handle pagination specifically
  const page = parseInt(req.query.page) || 1;

  // Set canonical URL based on current path
  if (page > 1) {
    // For paginated pages, canonical should point to the first page
    req.canonicalUrl = `${baseUrl}${path.split("/page/")[0]}`;
  } else {
    req.canonicalUrl = `${baseUrl}${path}`;
  }

  // Add the canonical URL to any responses
  const originalJson = res.json;
  res.json = function (body) {
    // Add SEO data if it's not already present
    if (!body.seo) {
      body.seo = {};
    }

    if (!body.seo.canonicalUrl) {
      body.seo.canonicalUrl = req.canonicalUrl;
    }

    return originalJson.call(this, body);
  };

  next();
};

module.exports = setCanonicalUrl;
