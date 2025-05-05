const whatsapp = require("../config/whatsapp");
const logger = require("../utils/logger");
const fs = require("fs").promises;
const path = require("path");

/**
 * Load WhatsApp message template and populate with data
 * @param {String} templateName - Name of the template
 * @param {Object} data - Data to populate template
 * @returns {Promise<Object>} WhatsApp message object
 */
const loadTemplate = async (templateName, data = {}) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "whatsapp",
      `${templateName}.js`
    );
    const templateModule = require(templatePath);
    return templateModule(data);
  } catch (error) {
    logger.error(
      `Error loading WhatsApp template ${templateName}: ${error.message}`
    );
    throw error;
  }
};

/**
 * Send WhatsApp message using template
 * @param {String} phone - Recipient phone number
 * @param {String} template - Template name
 * @param {Object} data - Template data
 * @returns {Promise<Object>} API response
 */
const sendTemplateMessage = async (phone, template, data = {}) => {
  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phone);

    // Load the template
    const messageContent = await loadTemplate(template, data);

    // Send message via WhatsApp API
    const response = await whatsapp.whatsappClient.post("", {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: formattedPhone,
      type: messageContent.type,
      [messageContent.type]: {
        body: messageContent.body,
      },
    });

    logger.info(
      `WhatsApp message sent to ${formattedPhone} using template ${template}`
    );
    return response.data;
  } catch (error) {
    logger.error(`WhatsApp message failed: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome message
 * @param {String} phone - Recipient phone number
 * @param {Object} data - Customer data
 * @returns {Promise<Object>} API response
 */
const sendWelcomeMessage = async (phone, data = {}) => {
  return sendTemplateMessage(phone, "welcomeMessage", data);
};

/**
 * Send product inquiry message
 * @param {String} phone - Recipient phone number
 * @param {Object} data - Product inquiry data
 * @returns {Promise<Object>} API response
 */
const sendProductInquiry = async (phone, data = {}) => {
  return sendTemplateMessage(phone, "productInquiry", data);
};

/**
 * Send support message
 * @param {String} phone - Recipient phone number
 * @param {Object} data - Support data
 * @returns {Promise<Object>} API response
 */
const sendSupportMessage = async (phone, data = {}) => {
  return sendTemplateMessage(phone, "support", data);
};

/**
 * Format phone number to international format
 * @param {String} phone - Phone number
 * @returns {String} Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Ensure it starts with a + if not present
  if (!cleaned.startsWith("+")) {
    // If it starts with a country code (like 1 for US), add +
    // Otherwise assume it's a US number
    if (cleaned.length >= 11) {
      cleaned = "+" + cleaned;
    } else {
      cleaned = "+1" + cleaned;
    }
  }

  return cleaned;
};

module.exports = {
  sendWelcomeMessage,
  sendProductInquiry,
  sendSupportMessage,
};
