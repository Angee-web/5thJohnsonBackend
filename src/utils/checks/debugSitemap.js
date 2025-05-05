require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectDB } = require("../../config/db");
const { SitemapStream } = require("sitemap");
const { createWriteStream } = require("fs");
const Product = require("../../models/Product");
const Collection = require("../../models/Collection");

async function debugSitemap() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected.");

    const baseUrl = process.env.BASE_URL || "https://www.5thjohnson.com";
    console.log(`Using base URL: ${baseUrl}`);

    // Set the output directory and ensure it exists
    const publicDir = path.join(process.cwd(), "public");
    const sitemapPath = path.join(publicDir, "sitemap.xml");

    // Create the directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      console.log(`Creating directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }

    console.log(`Will write sitemap to: ${sitemapPath}`);

    // Create and pipe the sitemap
    const smStream = new SitemapStream({ hostname: baseUrl });

    // Create a write stream and handle errors
    const writableStream = createWriteStream(sitemapPath);

    // Set up error handlers
    smStream.on("error", (error) => {
      console.error("SitemapStream error:", error);
    });

    writableStream.on("error", (error) => {
      console.error("WriteStream error:", error);
    });

    writableStream.on("finish", () => {
      console.log("Write stream finished");

      // Verify the file was written
      if (fs.existsSync(sitemapPath)) {
        const stats = fs.statSync(sitemapPath);
        console.log(`Final sitemap file size: ${stats.size} bytes`);

        if (stats.size > 0) {
          console.log("Sitemap generated successfully with content!");
        } else {
          console.log("Sitemap file was created but is empty!");
        }
      } else {
        console.log("Sitemap file was not created!");
      }
    });

    // Add static pages
    console.log("Adding static pages to sitemap...");
    smStream.write({ url: "/", changefreq: "daily", priority: 1.0 });
    smStream.write({ url: "/about", changefreq: "monthly", priority: 0.8 });
    smStream.write({ url: "/contact", changefreq: "monthly", priority: 0.8 });
    smStream.write({ url: "/faq", changefreq: "monthly", priority: 0.7 });
    smStream.write({ url: "/terms", changefreq: "yearly", priority: 0.5 });
    smStream.write({ url: "/privacy", changefreq: "yearly", priority: 0.5 });

    // Add product pages
    console.log("Fetching products...");
    const products = await Product.find({ isActive: true }).select(
      "slug updatedAt"
    );
    console.log(`Found ${products.length} active products`);

    products.forEach((product) => {
      console.log(`Adding product: ${product.slug}`);
      smStream.write({
        url: `/products/${product.slug}`,
        lastmod: product.updatedAt.toISOString(),
        changefreq: "weekly",
        priority: 0.9,
      });
    });

    // Add collection pages
    console.log("Fetching collections...");
    const collections = await Collection.find({ isActive: true }).select(
      "slug updatedAt"
    );
    console.log(`Found ${collections.length} active collections`);

    collections.forEach((collection) => {
      console.log(`Adding collection: ${collection.slug}`);
      smStream.write({
        url: `/collections/${collection.slug}`,
        lastmod: collection.updatedAt?.toISOString(),
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    console.log("Ending stream...");

    // IMPORTANT: Make sure to end the stream properly
    smStream.end();

    // Pipe the stream to the file AFTER adding all URLs
    console.log("Piping stream to file...");
    smStream.pipe(writableStream);

    console.log("Debug process completed - check if file was written");

    // Wait a bit to let the stream finish
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return true;
  } catch (error) {
    console.error("Error during sitemap debug:", error);
    return false;
  }
}

debugSitemap()
  .then(() => {
    console.log("Debug process exited");
    // Leave process open a bit to complete writing
    setTimeout(() => process.exit(0), 2000);
  })
  .catch((err) => {
    console.error("Debug process failed:", err);
    process.exit(1);
  });
