const fs = require("fs");
const path = require("path");

const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");

try {
  console.log(`Checking sitemap at: ${sitemapPath}`);

  if (fs.existsSync(sitemapPath)) {
    const stats = fs.statSync(sitemapPath);
    console.log(`Sitemap file size: ${stats.size} bytes`);

    if (stats.size > 0) {
      const content = fs.readFileSync(sitemapPath, "utf-8");
      console.log("\n--- Sitemap Content Preview ---");
      console.log(content.substring(0, 500) + "...");

      // Count URLs in sitemap
      const urlMatches = content.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;
      console.log(`\nTotal URLs in sitemap: ${urlCount}`);

      // Count product URLs
      const productMatches = content.match(/<loc>.*?\/products\//g);
      const productCount = productMatches ? productMatches.length : 0;
      console.log(`Product URLs: ${productCount}`);

      // Count collection URLs
      const collectionMatches = content.match(/<loc>.*?\/collections\//g);
      const collectionCount = collectionMatches ? collectionMatches.length : 0;
      console.log(`Collection URLs: ${collectionCount}`);

      // Static pages (total - products - collections)
      const staticCount = urlCount - productCount - collectionCount;
      console.log(`Static page URLs: ${staticCount}`);
    } else {
      console.log("Sitemap file is empty!");
    }
  } else {
    console.log("Sitemap file does not exist!");
  }
} catch (error) {
  console.error("Error reading sitemap:", error);
}
