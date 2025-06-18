const app = require("./app");
const { connectDB } = require("./config/db");
const logger = require("./utils/logger");
const config = require("./config/config");
const authService = require("./services/authService");
const routes = require("./routes");
const express = require("express");
const cors = require("cors");

// Allow any origin
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

require("dotenv").config();
// const { generateSitemap } = require("./utils/seo/sitemapGenerator");
// const { generateRobotsTxt } = require("./utils/seo/generateRobotsTxt");
// const { generateHtmlSitemap } = require("./utils/seo/generateHtmlSitemap");


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);
//Log to see if the routes are loaded correctly
console.log("Routes loaded successfully", routes);
console.log("Server.js is running");

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});



app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "5thJohnson API is running",
    timestamp: new Date().toISOString(),
  });
});



console.log("Environment Variables Loaded:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("BASE_URL:", process.env.BASE_URL);
console.log("MONGO_URI:", process.env.MONGO_URI ? "DEFINED" : "NOT DEFINED");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "DEFINED" : "NOT DEFINED");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "DEFINED" : "NOT DEFINED");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "DEFINED" : "NOT DEFINED");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("WHATSAPP_API_KEY:", process.env.WHATSAPP_API_KEY ? "DEFINED" : "NOT DEFINED");

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

app.get("/test", (req, res) => {
  res.send("Server is working");
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

module.exports = { startServer };
