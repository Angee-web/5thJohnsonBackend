const rateLimit = require("express-rate-limit");

// Create a standard rate limiter for most routes
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Create a stricter limiter for sensitive routes
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests to this resource, please try again later.",
  },
});

// Create a customizable limiter
const createLimiter = (options) => {
  return rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: options.message || "Too many requests, please try again later.",
    },
  });
};

module.exports = {
  standardLimiter,
  strictLimiter,
  createLimiter,
};
