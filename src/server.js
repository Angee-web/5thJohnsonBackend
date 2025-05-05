const app = require("./app");
const { connectDB } = require("./config/db");
const logger = require("./utils/logger");
const config = require("./config/config");
const authService = require("./services/authService");
// const { generateSitemap } = require("./utils/seo/sitemapGenerator");
// const { generateRobotsTxt } = require("./utils/seo/generateRobotsTxt");
// const { generateHtmlSitemap } = require("./utils/seo/generateHtmlSitemap");

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // await generateRobotsTxt();
    // await generateSitemap();
    // await generateHtmlSitemap();

    // Create initial admin user if needed
    await authService.createInitialAdmin();

    // Start Express server
    const server = app.listen(config.port, () => {
      logger.info(
        `Server running in ${config.nodeEnv} mode on port ${config.port}`
      );
    });

    // Generate sitemap after server starts and DB is connected
      if (config.nodeEnv === 'production') {
        generateSitemap()
          .then(() => logger.info('Initial sitemap generated successfully'))
          .catch(err => logger.error(`Failed to generate sitemap: ${err.message}`));
        
        // Regenerate the sitemap daily
        setInterval(() => {
          generateSitemap()
            .then(() => logger.info('Daily sitemap regenerated successfully'))
            .catch(err => logger.error(`Failed to regenerate sitemap: ${err.message}`));
        }, 24 * 60 * 60 * 1000);
      }
    

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received. Shutting down gracefully");
      server.close(() => {
        logger.info("Process terminated");
      });
    });

    return server;
  } catch (error) {
    logger.error(`Server start error: ${error.message}`);
    process.exit(1);
  }
};



// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
