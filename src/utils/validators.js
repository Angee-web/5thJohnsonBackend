const { body, param, query } = require("express-validator");

/**
 * Common validation patterns
 */
const patterns = {
  alphanumeric: /^[a-zA-Z0-9\s-_]+$/,
  phoneNumber: /^\+?[0-9]{10,15}$/,
  password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  objectId: /^[0-9a-fA-F]{24}$/,
};

/**
 * Product validation rules
 */
const productValidationRules = {
  create: [
    body("name")
      .notEmpty()
      .withMessage("Product name is required")
      .isLength({ max: 100 })
      .withMessage("Product name cannot exceed 100 characters"),

    body("description")
      .notEmpty()
      .withMessage("Product description is required")
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),

    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Price cannot be negative"),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),

    body("sku")
      .optional()
      .isLength({ max: 50 })
      .withMessage("SKU cannot exceed 50 characters"),

    body("flags").optional().isObject().withMessage("Flags must be an object"),

    body("collections")
      .optional()
      .isArray()
      .withMessage("Collections must be an array"),
  ],

  update: [
    body("name")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Product name cannot exceed 100 characters"),

    body("description")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Description cannot exceed 2000 characters"),

    body("price")
      .optional()
      .isNumeric()
      .withMessage("Price must be a number")
      .custom((value) => value >= 0)
      .withMessage("Price cannot be negative"),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer"),
  ],
};

// Add these to your validators.js file
const userValidators = {
  register: [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],

  login: [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
};

/**
 * Collection validation rules
 */
const collectionValidationRules = {
  create: [
    body("name")
      .notEmpty()
      .withMessage("Collection name is required")
      .isLength({ max: 100 })
      .withMessage("Collection name cannot exceed 100 characters"),

    body("description")
      .notEmpty()
      .withMessage("Collection description is required")
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
  ],

  update: [
    body("name")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Collection name cannot exceed 100 characters"),

    body("description")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),

    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean value"),

    body("featured")
      .optional()
      .isBoolean()
      .withMessage("featured must be a boolean value"),
  ],
};

/**
 * Review validation rules
 */
const reviewValidationRules = [
  body("product")
    .notEmpty()
    .withMessage("Product ID is required")
    .matches(patterns.objectId)
    .withMessage("Invalid product ID format"),

  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment")
    .notEmpty()
    .withMessage("Review comment is required")
    .isLength({ max: 1000 })
    .withMessage("Comment cannot exceed 1000 characters"),
];

/**
 * Contact form validation rules
 */
const contactValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isLength({ max: 200 })
    .withMessage("Subject cannot exceed 200 characters"),

  body("message")
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 5000 })
    .withMessage("Message cannot exceed 5000 characters"),
];

// Collection validators
const collectionValidators = {
  getCollectionById: [
    param("id").not().isEmpty().withMessage("Collection ID is required").trim(),
  ],
  getCollection: [
    param("id").not().isEmpty().withMessage("Collection ID is required").trim(),
  ],
  createCollection: [
    body("name")
      .notEmpty()
      .withMessage("Collection name is required")
      .isLength({ max: 100 })
      .withMessage("Collection name cannot exceed 100 characters"),
    body("description")
      .notEmpty()
      .withMessage("Collection description is required"),
  ],
  updateCollection: [
    param("id").matches(patterns.objectId).withMessage("Invalid collection ID"),
    body("name").optional().isString().withMessage("Name must be a string"),
  ],
  deleteCollection: [
    param("id").matches(patterns.objectId).withMessage("Invalid collection ID"),
  ],
  uploadImage: [
    param("id").matches(patterns.objectId).withMessage("Invalid collection ID"),
  ],
  addProducts: [
    param("id").matches(patterns.objectId).withMessage("Invalid collection ID"),
    body("productIds").isArray().withMessage("Product IDs must be an array"),
  ],
  removeProducts: [
    param("id").matches(patterns.objectId).withMessage("Invalid collection ID"),
    body("productIds").isArray().withMessage("Product IDs must be an array"),
  ],
};

// Product validators
const productValidators = {
  getProduct: [
    param("id").not().isEmpty().withMessage("Product ID is required").trim(),
  ],
  createProduct: productValidationRules.create,
  updateProduct: [
    param("id").matches(patterns.objectId).withMessage("Invalid product ID"),
    ...productValidationRules.update,
  ],
  deleteProduct: [
    param("id").matches(patterns.objectId).withMessage("Invalid product ID"),
  ],
  uploadImage: [
    param("id").matches(patterns.objectId).withMessage("Invalid product ID"),
  ],
  deleteImage: [
    param("id").matches(patterns.objectId).withMessage("Invalid product ID"),
    param("imageId").not().isEmpty().withMessage("Image ID is required"),
  ],
  // Add this new validator
  deleteImageByPublicId: [
    param("id").matches(patterns.objectId).withMessage("Invalid product ID"),
    body("publicId").notEmpty().withMessage("Image public ID is required"),
  ],
};

// Message validators
const messageValidators = {
  getMessage: [
    param("id").matches(patterns.objectId).withMessage("Invalid message ID"),
  ],
  updateStatus: [
    param("id").matches(patterns.objectId).withMessage("Invalid message ID"),
    body("status")
      .isIn(["pending", "responded", "closed"])
      .withMessage("Invalid status"),
  ],
  respondToMessage: [
    param("id").matches(patterns.objectId).withMessage("Invalid message ID"),
    body("response") // Change this from "message" to "response"
      .notEmpty()
      .withMessage("Response message is required")
      .isString()
      .withMessage("Response must be a string"),
  ],
  deleteMessage: [
    param("id").matches(patterns.objectId).withMessage("Invalid message ID"),
  ],
  deleteResponse: [
    param("id").matches(patterns.objectId).withMessage("Invalid message ID"),
  ],
};

// Review validators
const reviewValidators = {
  getProductReviews: [
    param("productId")
      .matches(patterns.objectId)
      .withMessage("Invalid product ID"),
  ],
  submitReview: reviewValidationRules,
  getReview: [
    param("id").matches(patterns.objectId).withMessage("Invalid review ID"),
  ],
  approveReview: [
    param("id").matches(patterns.objectId).withMessage("Invalid review ID"),
    body("isApproved").isBoolean().withMessage("isApproved must be a boolean"),
  ],
  respondToReview: [
    param("id").matches(patterns.objectId).withMessage("Invalid review ID"),
    body("response").notEmpty().withMessage("Response is required"),
  ],
  deleteReview: [
    param("id").matches(patterns.objectId).withMessage("Invalid review ID"),
  ],
};

// Favorite validators
const favoriteValidators = {
  addToFavorites: [
    body("productId")
      .exists()
      .withMessage("Product ID is required")
      .isLength({ min: 1 })
      .withMessage("Product ID cannot be empty"),
  ],
  // In favoriteValidators object
  addFavoriteByParam: [
    param("productId")
      .matches(patterns.objectId)
      .withMessage("Invalid product ID"),
  ],
  removeFavorite: [
    param("productId")
      .matches(patterns.objectId)
      .withMessage("Invalid product ID"),
  ],
};

// Contact validators
const contactValidators = {
  submitContactForm: contactValidationRules,
};

// WhatsApp validators
const whatsappValidators = {
  startConversation: [
    body("phone")
      .matches(patterns.phoneNumber)
      .withMessage("Invalid phone number"),
  ],
  productInquiry: [
    body("phone")
      .matches(patterns.phoneNumber)
      .withMessage("Invalid phone number"),
    body("productId")
      .matches(patterns.objectId)
      .withMessage("Invalid product ID"),
  ],
  supportMessage: [
    body("phone")
      .matches(patterns.phoneNumber)
      .withMessage("Invalid phone number"),
    body("message").notEmpty().withMessage("Message is required"),
  ],
};

/**
 * ID parameter validation (used for route parameters)
 */
const validateObjectId = [
  param("id").matches(patterns.objectId).withMessage("Invalid ID format"),
];

/**
 * Pagination validation for query parameters
 */
const paginationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),
];

module.exports = {
  productValidators,
  userValidators,
  collectionValidators,
  messageValidators,
  reviewValidators,
  favoriteValidators,
  contactValidators,
  whatsappValidators,
  patterns,
  productValidationRules,
  collectionValidationRules,
  reviewValidationRules,
  contactValidationRules,
  validateObjectId,
  paginationRules,
};
