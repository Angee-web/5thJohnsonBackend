const express = require("express");
const router = express.Router();
const whatsappController = require("../../controllers/client/whatsappController");
const validate = require("../../middleware/validator");
const { whatsappValidators } = require("../../utils/validators");
// Fix: Import the createLimiter function instead of rateLimiter
const { createLimiter } = require("../../middleware/rateLimiter");

/**
 * @route   POST /api/whatsapp/start
 * @desc    Start a WhatsApp conversation with welcome message
 * @access  Public
 */
router.post(
  "/start",
  // Fix: Use createLimiter instead of rateLimiter
  createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many WhatsApp conversation requests. Please try again later.",
  }),
  validate(whatsappValidators.startConversation),
  whatsappController.startConversation
);

/**
 * @route   POST /api/whatsapp/product-inquiry
 * @desc    Send product inquiry message via WhatsApp
 * @access  Public
 */
router.post(
  "/product-inquiry",
  // Fix: Use createLimiter instead of rateLimiter
  createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: "Too many product inquiries. Please try again later.",
  }),
  validate(whatsappValidators.productInquiry),
  whatsappController.productInquiry
);

/**
 * @route   POST /api/whatsapp/support
 * @desc    Send support message via WhatsApp
 * @access  Public
 */
router.post(
  "/support",
  // Fix: Use createLimiter instead of rateLimiter
  createLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many support requests. Please try again later.",
  }),
  validate(whatsappValidators.supportMessage),
  whatsappController.supportMessage
);

/**
 * @route   GET /api/whatsapp/webhook
 * @desc    WhatsApp webhook verification endpoint
 * @access  Public
 */
router.get("/webhook", whatsappController.verifyWebhook);

/**
 * @route   POST /api/whatsapp/webhook
 * @desc    WhatsApp webhook for receiving messages
 * @access  Public
 */
router.post("/webhook", whatsappController.webhookEvent);

module.exports = router;
