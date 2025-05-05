/**
 * Script to generate sitemap.xml
 * Can be run manually or scheduled
 */

require("dotenv").config({ path: "../../.env" });
const { generateSitemap } = require("../utils/seo/sitemapGenerator");
const mongoose = require("mongoose");

/**
 * Connect to database and generate sitemap
 */
async function runSitemapGenerator() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Generate sitemap
    const result = await generateSitemap();

    if (result) {
      console.log("Sitemap generated successfully");
    } else {
      console.error("Failed to generate sitemap");
    }

    // Close database connection
    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

// Run the script
runSitemapGenerator();
