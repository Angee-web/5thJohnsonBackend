const fs = require("fs");
const path = require("path");

/**
 * Generate HTML sitemap for users
 */
const generateHtmlSitemap = async (collections, products) => {
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Map - 5thJohnson</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    h2 { color: #444; margin-top: 30px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    a { color: #0066cc; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .main-sections { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .section { margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>5thJohnson Site Map</h1>
  
  <div class="main-sections">
    <div class="section">
      <h2>Main Pages</h2>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/faq">FAQ</a></li>
        <li><a href="/terms">Terms & Conditions</a></li>
        <li><a href="/privacy">Privacy Policy</a></li>
      </ul>
    </div>

    <div class="section">
      <h2>Collections</h2>
      <ul>`;

  // Add collections
  collections.forEach((collection) => {
    html += `
        <li><a href="/collections/${collection.slug}">${collection.name}</a></li>`;
  });

  html += `
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>Products</h2>
    <ul>`;

  // Add products
  products.forEach((product) => {
    html += `
      <li><a href="/products/${product.slug}">${product.name}</a></li>`;
  });

  html += `
    </ul>
  </div>

  <p><a href="/sitemap.xml">XML Sitemap</a></p>
</body>
</html>`;

  // Write to file
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "sitemap.html"), html);
  console.log("HTML sitemap generated");
  return true;
};

module.exports = { generateHtmlSitemap };
