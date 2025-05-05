/**
 * Middleware to monitor API response times for SEO performance
 */
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function
  res.end = function () {
    const duration = Date.now() - start;
    const path = req.originalUrl || req.url;

    // Log slow responses (over 1000ms)
    if (duration > 1000) {
      console.warn(`Slow response: ${path} - ${duration}ms`);
    }

    // Add timing header for monitoring tools
    res.setHeader("Server-Timing", `total;dur=${duration}`);

    // Call original end function
    return originalEnd.apply(this, arguments);
  };

  next();
};

module.exports = performanceMonitor;
