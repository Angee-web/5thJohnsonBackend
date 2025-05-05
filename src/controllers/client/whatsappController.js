const whatsappService = require("../../services/whatsappService");
const {
  successResponse,
  badRequestResponse,
} = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * Start a WhatsApp conversation with welcome message
 * @route POST /api/whatsapp/start
 */
const startConversation = async (req, res, next) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
      return badRequestResponse(res, "Phone number is required");
    }

    // Send welcome message
    await whatsappService.sendWelcomeMessage(phone, {
      name: name || "there",
    });

    return successResponse(
      res,
      { success: true },
      "WhatsApp conversation started"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Send product inquiry message
 * @route POST /api/whatsapp/product-inquiry
 */
const productInquiry = async (req, res, next) => {
  try {
    const { phone, productName, productId } = req.body;

    if (!phone || !productName) {
      return badRequestResponse(
        res,
        "Phone number and product name are required"
      );
    }

    // Send product inquiry message
    await whatsappService.sendProductInquiry(phone, {
      productName,
      productId,
    });

    return successResponse(
      res,
      { success: true },
      "Product inquiry message sent"
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Send support message
 * @route POST /api/whatsapp/support
 */
const supportMessage = async (req, res, next) => {
  try {
    const { phone, query } = req.body;

    if (!phone) {
      return badRequestResponse(res, "Phone number is required");
    }

    // Send support message
    await whatsappService.sendSupportMessage(phone, {
      query: query || "support request",
    });

    return successResponse(res, { success: true }, "Support message sent");
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook verification for WhatsApp
 * @route GET /api/whatsapp/webhook
 */
const verifyWebhook = async (req, res) => {
  const {
    "hub.mode": mode,
    "hub.verify_token": token,
    "hub.challenge": challenge,
  } = req.query;

  if (whatsapp.verifyWebhook(mode, token)) {
    return res.status(200).send(challenge);
  }

  return res.status(403).end();
};

/**
 * Webhook for WhatsApp message events
 * @route POST /api/whatsapp/webhook
 */
const webhookEvent = async (req, res) => {
  // Acknowledge receipt immediately
  res.status(200).end();

  try {
    const body = req.body;

    // Log incoming webhook
    logger.info(`Received WhatsApp webhook: ${JSON.stringify(body)}`);

    // Process webhook events asynchronously
    // This would typically be handled by a message queue or background job
    // for now we'll just log it
    if (body.object === "whatsapp_business_account") {
      logger.info("Processing WhatsApp webhook event");
    }
  } catch (error) {
    logger.error(`Error processing WhatsApp webhook: ${error.message}`);
  }
};

module.exports = {
  startConversation,
  productInquiry,
  supportMessage,
  verifyWebhook,
  webhookEvent,
};
