const collectionService = require("../../services/collectionService");
const seoService = require("../../services/seoService");
const { successResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");
const constants = require("../../config/constants");
const {
  collectionSchema,
  breadcrumbSchema,
} = require("../../utils/seo/schemaMarkup");
const { generateMetaTags } = require("../../utils/seo/metaTags");


/**
 * Get all collections
 * @route GET /api/collections
 */
const getCollections = async (req, res, next) => {
  try {
    const {
      search,
      featured,
      page = constants.PAGINATION.DEFAULT_PAGE,
      limit = constants.PAGINATION.DEFAULT_LIMIT,
      sort,
    } = req.query;

    // Convert string params to appropriate types
    const filters = {
      search,
      featured:
        featured === "true" ? true : featured === "false" ? false : undefined,
      // Only show active collections to clients
      isActive: true,
    };

    // Parse sorting
    let sortOption = { order: 1, name: 1 };
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption = { [field]: order === "desc" ? -1 : 1 };
    }

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), constants.PAGINATION.MAX_LIMIT),
      sort: sortOption,
    };

    const result = await collectionService.getCollections(filters, options);

    // Generate SEO data
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Build canonical URL with proper pagination handling
    const pathWithoutQuery = req.path;
    const queryParams = { ...req.query };

    // For canonical URL, remove page=1 if present
    if (parseInt(page) === 1) {
      delete queryParams.page;
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const canonicalUrl = `${baseUrl}${pathWithoutQuery}${
      queryString ? "?" + queryString : ""
    }`;

    // Pagination links for SEO
    const paginationLinks = {};

    if (parseInt(page) > 1) {
      const prevPage = parseInt(page) - 1;
      const prevParams = {
        ...queryParams,
        page: prevPage > 1 ? prevPage : undefined,
      };
      const prevQueryString = new URLSearchParams(prevParams).toString();
      paginationLinks.prev = `${baseUrl}${pathWithoutQuery}${
        prevQueryString ? "?" + prevQueryString : ""
      }`;
    }

    if (parseInt(page) < result.pagination.totalPages) {
      const nextParams = { ...queryParams, page: parseInt(page) + 1 };
      const nextQueryString = new URLSearchParams(nextParams).toString();
      paginationLinks.next = `${baseUrl}${pathWithoutQuery}${
        nextQueryString ? "?" + nextQueryString : ""
      }`;
    }

    // SEO metadata
    const seoData = {
      title: search
        ? `Search results for "${search}" | Collections | 5thJohnson`
        : "Clothing Collections | 5thJohnson",
      description: search
        ? `Browse collections matching "${search}" in our premium clothing store.`
        : "Explore our premium clothing collections at 5thJohnson. Find the perfect style for every occasion.",
      canonicalUrl,
      paginationLinks,
      robots: parseInt(page) > 1 ? "noindex, follow" : "index, follow", // Don't index paginated pages
    };

    return successResponse(res, {
      ...result,
      seo: seoData,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * Get a collection by ID or slug with its products
 * @route GET /api/collections/:id
 */
const getCollectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = constants.PAGINATION.DEFAULT_PAGE,
      limit = constants.PAGINATION.DEFAULT_LIMIT,
      sort,
    } = req.query;

    // Parse sorting
    let sortOption = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption = { [field]: order === "desc" ? -1 : 1 };
    }

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), constants.PAGINATION.MAX_LIMIT),
      sort: sortOption,
    };

    const result = await collectionService.getCollectionsWithProducts(
      id,
      options
    );

    // Generate SEO data
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const seoData = seoService.getCollectionSeo(result.collection, baseUrl);

    return successResponse(res, {
      ...result,
      seo: seoData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured collections
 * @route GET /api/collections/featured
 */
const getFeaturedCollections = async (req, res, next) => {
  try {
    const { limit = 4 } = req.query;
    const featuredCollections = await collectionService.getFeaturedCollections(
      parseInt(limit)
    );

    // Generate SEO data
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const seoData = {
      title: "Featured Collections | 5thJohnson",
      description:
        "Discover our featured clothing collections at 5thJohnson. Premium quality apparel for every style.",
      canonicalUrl: `${baseUrl}/api/collections/featured`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Featured Collections | 5thJohnson",
        description:
          "Discover our featured clothing collections at 5thJohnson.",
        url: `${baseUrl}/api/collections/featured`,
      },
    };

    return successResponse(res, {
      collections: featuredCollections,
      seo: seoData,
    });
  } catch (error) {
    next(error);
  }
};


const getCollectionBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const collection = await collectionService.getCollectionBySlug(slug);

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
        seo: {
          title: "Collection Not Found | 5thJohnson",
          description:
            "The requested collection could not be found. Explore our premium clothing collections.",
          canonicalUrl: `${process.env.BASE_URL}/collections`,
        },
      });
    }

    // Get products for this collection
    const options = {
      page: parseInt(req.query.page || constants.PAGINATION.DEFAULT_PAGE),
      limit: Math.min(
        parseInt(req.query.limit || constants.PAGINATION.DEFAULT_LIMIT),
        constants.PAGINATION.MAX_LIMIT
      ),
      sort: { createdAt: -1 },
    };

    const result = await collectionService.getCollectionWithProducts(
      collection._id,
      options
    );

    // Generate SEO data
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const seoData = seoService.getCollectionSeo(result.collection, baseUrl);

    return successResponse(res, {
      ...result,
      seo: seoData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollections,
  getCollectionById,
  getFeaturedCollections,
  getCollectionBySlug,
};
