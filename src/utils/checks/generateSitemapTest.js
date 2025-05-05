// Save this as generateSitemapTest.js in your src folder
require("dotenv").config();

const { connectDB } = require("../../config/db");
const { generateSitemap } = require("../seo/sitemapGenerator");
// const { generateSitemap } = require("./utils/seo/sitemapGenerator");

async function testSitemap() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    console.log("Generating sitemap...");
    const result = await generateSitemap();

    if (result) {
      console.log("Sitemap generated successfully.");
    } else {
      console.log("Sitemap generation returned false.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error during sitemap generation test:", error);
    process.exit(1);
  }
}

testSitemap();
