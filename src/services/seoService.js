const {
  generateSitemap,
  saveSitemap,
  generateRobotsTxt,
  saveRobotsTxt,
} = require("../utils/seo/sitemapGenerator");
const {
  generateProductSeo,
  generateCollectionSeo,
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  generateDefaultSeo,
} = require("../utils/seoHelpers");
const logger = require("../utils/logger");

/**
 * Generate and save sitemap.xml
 * @param {String} baseUrl - Base URL of the website
 * @returns {Promise<Boolean>} Success status
 */
const refreshSitemap = async (baseUrl) => {
  try {
    const sitemap = await generateSitemap(baseUrl);
    await saveSitemap(sitemap);
    logger.info(`Sitemap refreshed for ${baseUrl}`);
    return true;
  } catch (error) {
    logger.error(`Error refreshing sitemap: ${error.message}`);
    throw error;
  }
};

/**
 * Generate and save robots.txt
 * @param {String} baseUrl - Base URL of the website
 * @returns {Promise<Boolean>} Success status
 */
const refreshRobotsTxt = async (baseUrl) => {
  try {
    const robotsTxt = generateRobotsTxt(baseUrl);
    await saveRobotsTxt(robotsTxt);
    logger.info(`Robots.txt refreshed for ${baseUrl}`);
    return true;
  } catch (error) {
    logger.error(`Error refreshing robots.txt: ${error.message}`);
    throw error;
  }
};

const {
  productSchema,
  breadcrumbSchema,
} = require("../utils/seo/schemaMarkup");
const { generateMetaTags } = require("../utils/seo/metaTags");

/**
 * Generate SEO metadata for a product
 * @param {Object} product - Product document
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} SEO metadata and structured data
 */
const getProductSeo = (product, baseUrl) => {
  if (!product) {
    return generateDefaultSeo(baseUrl);
  }

  // Generate meta tags using your utility
  const metaTags = generateMetaTags("product", product);

  // Generate breadcrumbs for structured data
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Products", url: "/products" },
  ];

  if (product.collection) {
    breadcrumbs.push({
      name: product.collection.name,
      url: `/collections/${product.collection.slug}`,
    });
  }

  breadcrumbs.push({
    name: product.name,
    url: `/products/${product.slug}`,
  });

  const breadcrumbData = breadcrumbSchema(breadcrumbs);

  // Generate product schema
  const productData = productSchema(product);

  return {
    title: metaTags.title,
    description: metaTags.description,
    canonical: `${baseUrl}/products/${product.slug}`,
    ogType: metaTags.ogType,
    structuredData: {
      product: productData,
      breadcrumb: breadcrumbData,
    },
  };
};


/**
 * Generate SEO metadata for a collection
 * @param {Object} collection - Collection document
 * @param {String} baseUrl - Base URL of the website
 * @returns {Object} SEO metadata and structured data
 */
const getCollectionSeo = (collection, baseUrl) => {
  try {
    if (!collection) {
      return generateDefaultSeo(baseUrl);
    }
    
    // Generate meta tags using your utility
    const metaTags = generateMetaTags('collection', collection);
    
    // Generate breadcrumbs for structured data
    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Collections", url: "/collections" },
      {
        name: collection.name,
        url: `/collections/${collection.slug || collection._id}`,
      },
    ];
    
    const breadcrumbData = breadcrumbSchema(breadcrumbs);
    
    // Generate collection schema
    // Assume products are included in collection or pass empty array
    const products = collection.products || [];
    const collectionData = collectionSchema(collection, products);

    return {
      title: metaTags.title,
      description: metaTags.description,
      canonical: `${baseUrl}/collections/${collection.slug}`,
      ogType: metaTags.ogType,
      structuredData: {
        collection: collectionData,
        breadcrumb: breadcrumbData
      }
    };
  } catch (error) {
    logger.error(`Error generating collection SEO: ${error.message}`);
    return generateDefaultSeo(baseUrl);
  }
};

/**
 * Generate SEO data for paginated content
 * @param {Object} options - Pagination options
 * @param {String} baseUrl - Base URL
 * @param {String} path - Current path
 * @param {Object} query - Query parameters
 * @returns {Object} Pagination SEO data
 */
const getPaginationSeo = (options, baseUrl, path, query = {}) => {
  const { currentPage, totalPages } = options;
  const paginationLinks = {};
  
  // Clone query params and remove pagination
  const queryParams = {...query};
  
  // Build canonical URL - always points to first page
  let canonicalUrl;
  if (currentPage > 1) {
    delete queryParams.page;
    const queryString = new URLSearchParams(queryParams).toString();
    canonicalUrl = `${baseUrl}${path}${queryString ? '?' + queryString : ''}`;
  } else {
    // Current page is already first page
    canonicalUrl = `${baseUrl}${path}${queryParams ? '?' + new URLSearchParams(queryParams).toString() : ''}`;
  }
  
  // Add prev/next links for SEO
  if (currentPage > 1) {
    const prevParams = {...queryParams};
    if (currentPage > 2) {
      prevParams.page = currentPage - 1;
    }
    const prevQueryString = new URLSearchParams(prevParams).toString();
    paginationLinks.prev = `${baseUrl}${path}${prevQueryString ? '?' + prevQueryString : ''}`;
  }
  
  if (currentPage < totalPages) {
    const nextParams = {...queryParams, page: currentPage + 1};
    const nextQueryString = new URLSearchParams(nextParams).toString();
    paginationLinks.next = `${baseUrl}${path}${nextQueryString ? '?' + nextQueryString : ''}`;
  }
  
  // Robots meta - don't index paginated pages beyond first page
  const robots = currentPage > 1 ? "noindex, follow" : "index, follow";
  
  return {
    canonicalUrl,
    paginationLinks,
    robots
  };
};


/**
 * Generate SEO for standard pages
 * @param {String} pageType - Type of page
 * @param {Object} data - Optional page data
 * @param {String} baseUrl - Base URL
 * @returns {Object} SEO data
 */
const getPageSeo = (pageType, data = {}, baseUrl) => {
  // Use your meta tags generator
  const metaTags = generateMetaTags(pageType, data);
  
  // Generate appropriate structured data based on page type
  let structuredData = {};
  
  if (pageType === 'home') {
    const { organizationSchema } = require("../utils/seo/schemaMarkup");
    structuredData.organization = organizationSchema();
  } else if (pageType === 'faq' && data.faqs) {
    const { faqSchema } = require("../utils/seo/schemaMarkup");
    structuredData.faq = faqSchema(data.faqs);
  }
  
  return {
    title: metaTags.title,
    description: metaTags.description,
    canonical: `${baseUrl}${metaTags.canonical || ''}`,
    ogType: metaTags.ogType || 'website',
    structuredData
  };
};


module.exports = {
  refreshSitemap,
  refreshRobotsTxt,
  getProductSeo,
  getCollectionSeo,
  getPaginationSeo,
  getPageSeo,
};
