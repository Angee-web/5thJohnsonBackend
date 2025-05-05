const axios = require("axios");
const logger = require("../utils/logger");

// WhatsApp Business API configuration
const whatsappConfig = {
  baseUrl: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v17.0",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  businessId: process.env.WHATSAPP_BUSINESS_ID,
  webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET,
};

// Create axios instance for WhatsApp API calls
const whatsappClient = axios.create({
  baseURL: `${whatsappConfig.baseUrl}/${whatsappConfig.phoneNumberId}/messages`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${whatsappConfig.accessToken}`,
  },
});

// Intercept response for error logging
whatsappClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      logger.error(
        `WhatsApp API error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
    } else if (error.request) {
      logger.error(`WhatsApp API request error: ${error.message}`);
    } else {
      logger.error(`WhatsApp API setup error: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

/**
 * Verify WhatsApp webhook request
 * @param {string} mode - Mode from query params
 * @param {string} token - Token from query params
 * @returns {boolean} Whether the request is valid
 */
const verifyWebhook = (mode, token) => {
  return mode === "subscribe" && token === whatsappConfig.webhookSecret;
};

module.exports = {
  whatsappClient,
  whatsappConfig,
  verifyWebhook,
};
