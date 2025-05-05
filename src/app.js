// In app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const { errorHandler } = require("./middleware/errorHandler");
const { standardLimiter } = require("./middleware/rateLimiter");
const { ensureUploadDirectories } = require("./utils/fileProcessing");

// Import SEO middleware
const setCanonicalUrl = require("./middleware/canonicalUrl");
const handleRedirects = require("./middleware/redirects");
// const seoHeaders = require("./middleware/seoHeaders");
const { cacheMiddleware } = require("./middleware/cache");
const { generateSitemap } = require("./utils/seo/sitemapGenerator");
const { performanceMonitor } = require("./middleware/performanceMonitor");


ensureUploadDirectories();

// Import the main router instead of individual route files
const routes = require("./routes/index");
const { sessionManager } = require("./middleware/sessionManager");
const seoHeaders = require("./middleware/seoHeader");

// Create Express app
const app = express();

app.use(performanceMonitor);

// Apply global middlewares
app.use(
  helmet({
    // Modify CSP to allow inline scripts for analytics if needed
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://www.google-analytics.com"],
      },
    },
  })
); // Security headers with SEO-friendly settings

// SEO middleware - apply early in the chain
app.use(handleRedirects); // First check for redirects
app.use(seoHeaders); // Set SEO-related headers

app.use(compression()); // Compress responses
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(sessionManager);
app.use(setCanonicalUrl); // Add canonical URLs to responses

// // Add at the top of sessionManager middleware
// console.log('Session cookie from request:', req.cookies[constants.AUTH.SESSION_COOKIE_NAME]);
// // Add after setting the cookie
// console.log('Setting new session cookie:', newSessionId);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Special routes for SEO files
app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/robots.txt"));
});

app.get("/sitemap.xml", (req, res) => {
  res.header("Content-Type", "application/xml");
  res.sendFile(path.join(__dirname, "../public/sitemap.xml"));
});

// Apply rate limiting to all routes
app.use(standardLimiter);

// Add caching for specific API routes that are heavily used but don't change often
app.use("/api/products", cacheMiddleware({ ttl: 300 })); // Cache product listings for 5 minutes
app.use("/api/categories", cacheMiddleware({ ttl: 600 })); // Cache categories for 10 minutes
app.use("/api/settings", cacheMiddleware({ ttl: 1800 })); // Cache site settings for 30 minutes

// Use the main router for all routes
app.use(routes);

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    seo: {
      title: "Page Not Found | 5thJohnson",
      description:
        "The requested page could not be found. Browse our premium clothing collection at 5thJohnson.",
      canonicalUrl: process.env.BASE_URL || "https://www.5thjohnson.com",
    },
  });
});

// Global error handler
app.use(errorHandler);

// Export the app before listening
module.exports = app;

// If this file is executed directly (not imported), start the server
if (require.main === module) {
  const PORT = process.env.PORT || 7000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Generate sitemap in production
    if (process.env.NODE_ENV === "production") {
      generateSitemap()
        .then(() => console.log("Initial sitemap generated successfully"))
        .catch((err) =>
          console.error("Failed to generate initial sitemap:", err)
        );

      // Schedule sitemap generation every day at midnight
      const oneDayMilliseconds = 24 * 60 * 60 * 1000;
      setInterval(() => {
        generateSitemap()
          .then(() =>
            console.log("Daily sitemap generation completed:", new Date())
          )
          .catch((err) =>
            console.error("Daily sitemap generation failed:", err)
          );
      }, oneDayMilliseconds);
    }
  });
}
