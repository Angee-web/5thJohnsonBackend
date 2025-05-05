/**
 * Middleware to handle 301 redirects for changed URLs
 * Improves SEO by preserving link equity when URLs change
 */

// Define redirects: old path -> new path
const redirects = [
  // Example redirects for common URL changes
  { from: "/clothing", to: "/categories/all" },
  { from: "/womens", to: "/categories/women" },
  { from: "/mens", to: "/categories/men" },
  { from: "/accessories", to: "/categories/accessories" },
  { from: "/products/womens-clothing", to: "/categories/women" },
  { from: "/products/mens-clothing", to: "/categories/men" },

  // Redirect old URLs with underscores to new dash format
  { from: "/product_details", to: "/products" },
  { from: "/shopping_cart", to: "/cart" },

  // Redirect old campaign URLs
  { from: "/summer-sale-2024", to: "/promotions/summer" },
  { from: "/winter-collection", to: "/collections/winter" },

  // Handle common typos
  { from: "/categores", to: "/categories" },
  { from: "/produts", to: "/products" },
];

/**
 * Regular expression based redirect rules - for more complex matches
 */
const regexRedirects = [
  // Redirect old product URL format to new format
  {
    pattern: /^\/shop\/product\/([a-z0-9-]+)$/i,
    replace: "/products/$1",
  },
  // Redirect old category page format
  {
    pattern: /^\/shop\/category\/([a-z0-9-]+)$/i,
    replace: "/categories/$1",
  },
];

/**
 * Middleware to handle redirects
 */
const handleRedirects = (req, res, next) => {
  const path = req.path;

  // Check exact match redirects
  const exactRedirect = redirects.find((r) => r.from === path);
  if (exactRedirect) {
    // Preserve query parameters in the redirect
    const queryString =
      Object.keys(req.query).length > 0
        ? "?" + new URLSearchParams(req.query).toString()
        : "";

    return res.redirect(301, exactRedirect.to + queryString);
  }

  // Check regex-based redirects
  for (const redirect of regexRedirects) {
    if (redirect.pattern.test(path)) {
      const newPath = path.replace(redirect.pattern, redirect.replace);

      // Preserve query parameters
      const queryString =
        Object.keys(req.query).length > 0
          ? "?" + new URLSearchParams(req.query).toString()
          : "";

      return res.redirect(301, newPath + queryString);
    }
  }

  next();
};

module.exports = handleRedirects;
