/**
 * Add SEO-related HTTP headers to responses
 */

const seoHeaders = (req, res, next) => {
  // Enable CORS for better integration with other services
  res.header("Access-Control-Allow-Origin", "*");

  // Set X-Robots-Tag for pages that shouldn't be indexed
  if (
    req.path.includes("/admin") ||
    req.path.includes("/checkout") ||
    req.path.includes("/cart") ||
    req.path.includes("/user/account")
  ) {
    res.header("X-Robots-Tag", "noindex, nofollow");
  }

  // Add Content-Security-Policy header
  res.header(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' https://www.google-analytics.com https://www.googletagmanager.com 'unsafe-inline'; " +
      "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
      "img-src 'self' data: https://res.cloudinary.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://www.google-analytics.com;"
  );

  // Enable browser features for PWA
  res.header(
    "Feature-Policy",
    "camera 'none'; microphone 'none'; geolocation 'self'"
  );

  // Prevent MIME type sniffing
  res.header("X-Content-Type-Options", "nosniff");

  // Configure Referrer Policy
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

module.exports = seoHeaders;
