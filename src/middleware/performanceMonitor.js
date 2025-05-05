const logger = require("../utils/logger");

/**
 * Middleware to monitor API response times for SEO performance improvements
 */
const performanceMonitor = (req, res, next) => {
  // Skip for non-GET requests or static assets
  if (
    req.method !== "GET" ||
    req.path.match(/\.(js|css|jpg|png|gif|svg|ico|woff|woff2)$/)
  ) {
    return next();
  }

  const start = Date.now();
  const path = req.originalUrl || req.url;

  // Store original end function
  const originalEnd = res.end;

  // Override end function
  res.end = function () {
    const duration = Date.now() - start;

    // Add timing header for monitoring tools
    res.setHeader("Server-Timing", `total;dur=${duration}`);

    // Log slow responses (over 1000ms)
    if (duration > 1000) {
      logger.warn(`⚠️ Slow response: ${path} - ${duration}ms`);

      // Log additional info for slow responses
      const userAgent = req.get("User-Agent") || "Unknown";
      const referer = req.get("Referer") || "Direct";

      logger.debug({
        type: "performance",
        path,
        duration,
        statusCode: res.statusCode,
        userAgent,
        referer,
        timestamp: new Date().toISOString(),
      });
    }

    // Store performance data for metrics collection
    if (!req.app.locals.performanceMetrics) {
      req.app.locals.performanceMetrics = [];
    }

    // Keep only the last 100 entries
    if (req.app.locals.performanceMetrics.length >= 100) {
      req.app.locals.performanceMetrics.shift();
    }

    req.app.locals.performanceMetrics.push({
      path,
      duration,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
    });

    // Call original end function
    return originalEnd.apply(this, arguments);
  };

  next();
};

/**
 * Get performance statistics
 * @param {Object} app - Express app instance
 * @returns {Object} Performance metrics
 */
const getPerformanceStats = (app) => {
  const metrics = app.locals.performanceMetrics || [];

  if (metrics.length === 0) {
    return {
      count: 0,
      avgResponseTime: 0,
      slowResponses: 0,
      routes: {},
    };
  }

  // Calculate statistics
  let totalDuration = 0;
  let slowCount = 0;
  const routes = {};

  metrics.forEach((metric) => {
    totalDuration += metric.duration;
    if (metric.duration > 1000) slowCount++;

    // Group by route
    const routePath = metric.path.split("?")[0]; // Remove query string
    if (!routes[routePath]) {
      routes[routePath] = {
        count: 0,
        totalDuration: 0,
        avgDuration: 0,
        slowCount: 0,
      };
    }

    routes[routePath].count++;
    routes[routePath].totalDuration += metric.duration;
    if (metric.duration > 1000) routes[routePath].slowCount++;
  });

  // Calculate averages
  Object.keys(routes).forEach((route) => {
    routes[route].avgDuration = Math.round(
      routes[route].totalDuration / routes[route].count
    );
  });

  return {
    count: metrics.length,
    avgResponseTime: Math.round(totalDuration / metrics.length),
    slowResponses: slowCount,
    slowPercentage: Math.round((slowCount / metrics.length) * 100),
    routes,
  };
};

module.exports = { performanceMonitor, getPerformanceStats };
