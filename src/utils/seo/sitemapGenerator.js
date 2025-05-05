const { SitemapStream, streamToPromise } = require("sitemap");
const { createWriteStream, mkdirSync, existsSync } = require("fs");
const path = require("path");
const Collection = require("../../models/Collection");
const Product = require("../../models/Product");

/**
 * Generate XML sitemap for the website
 */
async function generateSitemap() {
  try {
    const baseUrl = process.env.BASE_URL || "https://www.5thjohnson.com";

    // Set the output directory and ensure it exists
    const publicDir = path.join(__dirname, "../../../public");
    const sitemapPath = path.join(publicDir, "sitemap.xml");

    // Create the directory if it doesn't exist
    if (!existsSync(publicDir)) {
      console.log(`Creating directory: ${publicDir}`);
      mkdirSync(publicDir, { recursive: true });
    }

    console.log(`Will write sitemap to: ${sitemapPath}`);

    const smStream = new SitemapStream({ hostname: baseUrl });
    const writableStream = createWriteStream(sitemapPath);

    // Add static pages
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
      smStream.write({
        url: `/collections/${collection.slug}`,
        lastmod: collection.updatedAt?.toISOString(),
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    // End the stream and pipe to file
    smStream.end();

    // Set up stream error handling
    writableStream.on("error", (error) => {
      console.error(`Error writing sitemap: ${error.message}`);
    });

    writableStream.on("finish", () => {
      console.log(`Sitemap written successfully to ${sitemapPath}`);
    });

    smStream.pipe(writableStream);

    console.log("Sitemap generation process completed");
    return true;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return false;
  }
}

module.exports = { generateSitemap };
