const fs = require("fs");
const path = require("path");
const logger = require("../logger"); // Adjust the path if needed

/**
 * Generate robots.txt file with proper configuration
 * @param {Object} options - Optional configuration
 * @returns {Promise<Boolean>} - Success status
 */
async function generateRobotsTxt(options = {}) {
  try {
    // Set the base URL
    const baseUrl =
      options.baseUrl || process.env.BASE_URL || "https://www.5thjohnson.com";

    // Set the output directory and ensure it exists
    const publicDir = path.join(process.cwd(), "public");
    const robotsTxtPath = path.join(publicDir, "robots.txt");

    // Create the directory if it doesn't exist
    if (!fs.existsSync(publicDir)) {
      logger.info(`Creating directory: ${publicDir}`);
      fs.mkdirSync(publicDir, { recursive: true });
    }

    logger.info(`Will write robots.txt to: ${robotsTxtPath}`);

    // Build the robots.txt content
    const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /user/account/
Disallow: /cart/
Disallow: /auth/

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 5
`;

    // Write the file
    fs.writeFileSync(robotsTxtPath, content);

    logger.info(`robots.txt generated successfully at ${robotsTxtPath}`);

    // Verify the file was created properly
    if (fs.existsSync(robotsTxtPath)) {
      const fileContent = fs.readFileSync(robotsTxtPath, "utf-8");
      const fileSize = fs.statSync(robotsTxtPath).size;

      if (fileSize > 0 && fileContent.includes(baseUrl)) {
        logger.info(`robots.txt verified: ${fileSize} bytes`);
        return true;
      } else {
        logger.error(`robots.txt file exists but content verification failed`);
        return false;
      }
    } else {
      logger.error(`robots.txt file was not created at ${robotsTxtPath}`);
      return false;
    }
  } catch (error) {
    logger.error(`Error generating robots.txt: ${error.message}`);
    throw error;
  }
}

/**
 * Check if robots.txt exists and is valid
 * @returns {Object} - Status and details
 */
function checkRobotsTxt() {
  try {
    const robotsTxtPath = path.join(process.cwd(), "public", "robots.txt");

    if (!fs.existsSync(robotsTxtPath)) {
      return {
        exists: false,
        message: `robots.txt does not exist at ${robotsTxtPath}`,
        path: robotsTxtPath,
      };
    }

    const content = fs.readFileSync(robotsTxtPath, "utf-8");
    const size = fs.statSync(robotsTxtPath).size;

    // Basic validation
    const hasUserAgent = content.includes("User-agent:");
    const hasSitemap = content.includes("Sitemap:");
    const hasDisallow = content.includes("Disallow:");

    const isValid = hasUserAgent && hasSitemap && hasDisallow;

    return {
      exists: true,
      isValid,
      size,
      content,
      message: isValid
        ? `robots.txt exists and appears valid (${size} bytes)`
        : `robots.txt exists but may be missing required directives`,
      path: robotsTxtPath,
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      message: `Error checking robots.txt: ${error.message}`,
    };
  }
}

// Test function to run from command line
async function test() {
  console.log("Checking existing robots.txt...");
  const check = checkRobotsTxt();
  console.log(check.message);

  if (!check.exists || !check.isValid) {
    console.log("Generating new robots.txt...");
    const result = await generateRobotsTxt();

    if (result) {
      console.log("robots.txt generated successfully");
      const newCheck = checkRobotsTxt();
      console.log(`New robots.txt: ${newCheck.size} bytes`);
      console.log("Content:");
      console.log(newCheck.content);
    } else {
      console.log("Failed to generate robots.txt");
    }
  } else {
    console.log("Existing robots.txt is valid");
    console.log("Content:");
    console.log(check.content);
  }
}

// Run test if executed directly
if (require.main === module) {
  test().catch(console.error);
}

module.exports = { generateRobotsTxt, checkRobotsTxt };
