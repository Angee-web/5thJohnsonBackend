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
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      collections,
      minPrice,
      maxPrice,
      search,
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Collection filter
    if (collections) {
      const collectionIds = collections.split(",");
      const validCollectionIds = collectionIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );
      query.collections = { $in: validCollectionIds };
    }

    // Price range filter
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    } else if (minPrice !== undefined) {
      query.price = { $gte: Number(minPrice) };
    } else if (maxPrice !== undefined) {
      query.price = { $lte: Number(maxPrice) };
    }

    // Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Debugging logs
    console.log("Query object:", query);

    // Execute query
    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const products = await Product.find(query)
      .populate("collections", "name slug")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Return response
    res.status(200).json({
      success: true,
      message: "Success",
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages,
        },
      },
      seo: {
        title: "5thJohnson - Premium Clothing Collection",
        description:
          "Shop premium clothing at 5thJohnson. Discover the latest fashion trends, styles, and collections.",
        canonicalUrl: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
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
    console.error("Controller: Error fetching new arrivals:", error);
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
    const saleProducts = await productService.getOnSaleProducts(
      parseInt(limit)
    );

    return successResponse(res, { products: saleProducts });
  } catch (error) {
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
