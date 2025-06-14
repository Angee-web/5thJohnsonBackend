const productService = require("../../services/productService");
const seoService = require("../../services/seoService");
const { successResponse, errorResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");
const constants = require("../../config/constants");
const Product = require("../../models/Product");
const {
  productSchema,
  breadcrumbSchema,
} = require("../../utils/seo/schemaMarkup");
const { generateMetaTags } = require("../../utils/seo/metaTags");




// Add this function near the top of your file after the imports
/**
 * Get SEO data for pages
 * @param {string} page - Page identifier 
 * @returns {Object} SEO data
 */
const getPageSeo = (page) => {
  const baseData = {
    title: "5thJohnson - Premium Clothing Collection",
    description: "Shop premium clothing at 5thJohnson. Discover the latest fashion trends, styles, and collections."
  };
  
  switch(page) {
    case "search":
      return {
        ...baseData,
        canonicalUrl: `${constants.BASE_URL}/api/products/search`,
      };
    case "featured":
      return {
        ...baseData,
        title: "Featured Products | 5thJohnson",
        canonicalUrl: `${constants.BASE_URL}/api/products/featured`,
      };
    case "newArrivals":
      return {
        ...baseData,
        title: "New Arrivals | 5thJohnson",
        canonicalUrl: `${constants.BASE_URL}/api/products/new-arrivals`,
      };
    case "onSale":
      return {
        ...baseData,
        title: "Sale Items | 5thJohnson",
        canonicalUrl: `${constants.BASE_URL}/api/products/on-sale`,
      };
    default:
      return baseData;
  }
};

/**
 * Get all products with filtering and pagination
 * @route GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt", search } = req.query;

    console.log("Client getProducts function called");
    console.log("Incoming request query:", req.query);

    const products = await productService.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      search,
    });

    console.log("Fetched products:", products);

    return successResponse(res, "Products fetched successfully", { products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    return errorResponse(res, "Failed to fetch products", error.message);
  }
};

/**
 * Get a single product by ID
 * @route GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get product with reviews
    const product = await productService.getProductById(id, true);

    // Generate SEO data
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const seoData = seoService.getProductSeo(product, baseUrl);

    return successResponse(res, {
      product,
      seo: seoData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured products
 * @route GET /api/products/featured
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    console.log("Fetching featured products with limit:", limit);

    const featuredProducts = await productService.getFeaturedProducts(
      parseInt(limit)
    );

    console.log("Featured products:", featuredProducts);

    return successResponse(res, { products: featuredProducts });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    next(error);
  }
};

/**
 * Get new arrivals
 * @route GET /api/products/new-arrivals
 */
const getNewArrivals = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    console.log("Controller: Getting new arrivals with limit:", limit);

    const newArrivals = await productService.getNewArrivals(parseInt(limit));

    console.log(`Controller: Returning ${newArrivals.length} new arrivals`);

    return successResponse(res, { products: newArrivals });
  } catch (error) {
    console.error("Controller: Error fetching new arrivals:", error.message);
    next(error);
  }
};

/**
 * Get on sale products
 * @route GET /api/products/on-sale
 */
const getOnSaleProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    console.log("Controller: Fetching products on sale with limit:", limit);

    const saleProducts = await productService.getOnSaleProducts(parseInt(limit));

    console.log(`Controller: Returning ${saleProducts.length} products on sale`);

    return successResponse(res, { products: saleProducts });
  } catch (error) {
    console.error("Controller: Error fetching products on sale:", error.message);
    next(error);
  }
};

/**
 * Search products
 * @route GET /api/products/search
 */
// Update the searchProducts function
const searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    
    console.log("Search controller - Query:", q);
    
    if (!q) {
      return res.status(200).json({
        success: true,
        message: "Success",
        data: { products: [] },
        seo: getPageSeo("search"), // Use the local helper function
      });
    }
    
    const products = await productService.searchProducts(q, parseInt(limit));
    
    console.log(`Search controller - Found ${products.length} products`);
    
    return res.status(200).json({
      success: true,
      message: "Success",
      data: { products },
      seo: getPageSeo("search"), // Use the local helper function
    });
  } catch (error) {
    next(error);
  }
};



// Add SEO data to your client product route responses
const getProductBySlug = async (req, res, next) => {
  try {
    // Your existing product fetch code
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('collection');
    
    // Add SEO data to response
    const structuredData = productSchema(product);
    const metaTags = generateMetaTags('product', product);
    
    // Add breadcrumbs
    const breadcrumbs = [
      { name: "Home", url: process.env.BASE_URL },
      { name: "Products", url: `${process.env.BASE_URL}/products` }
    ];
    
    if (product.collection) {
      breadcrumbs.push({
        name: product.collection.name,
        url: `${process.env.BASE_URL}/collections/${product.collection.slug}`
      });
    }
    
    breadcrumbs.push({
      name: product.name,
      url: `${process.env.BASE_URL}/products/${product.slug}`
    });
    
    const breadcrumbData = breadcrumbSchema(breadcrumbs);
    
    return res.json({
      success: true,
      data: product,
      seo: {
        ...metaTags,
        structuredData,
        breadcrumbs,
        breadcrumbData
      }
    });
  } catch (error) {
    next(error);
  }
};

// Similar updates for other client product endpoints


module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  getOnSaleProducts,
  searchProducts,
  getProductBySlug,
};
