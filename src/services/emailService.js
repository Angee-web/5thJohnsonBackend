const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("../config/nodemailer");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/errorHandler");

/**
 * Load email template and replace placeholders
 * @param {String} templateName - Name of the template file
 * @param {Object} data - Data to replace placeholders
 * @returns {Promise<String>} HTML content
 */
const loadTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "emails",
      `${templateName}.html`
    );
    let content = await fs.readFile(templatePath, "utf-8");

    // Replace placeholders
    for (const [key, value] of Object.entries(data)) {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
    }

    return content;
  } catch (error) {
    logger.error(
      `Error loading email template ${templateName}: ${error.message}`
    );
    throw new AppError("Email template not found", 500);
  }
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendEmail = async (options) => {
  try {
    const { from, to, subject, html, text } = options;

    // Set default from address if not provided
    const mailOptions = {
      from: from || `5thJohnson <${nodemailer.noReplyEmail}>`,
      to,
      subject,
      html,
      text,
    };

    const info = await nodemailer.transporter.sendMail(mailOptions);

    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw error;
  }
};

/**
 * Send contact form confirmation to customer
 * @param {Object} contactMessage - Contact message object
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendContactConfirmation = async (contactMessage) => {
  try {
    const { name, email, subject, message } = contactMessage;

    const templateData = {
      name,
      message,
      subject,
      date: new Date().toLocaleString(),
    };

    const html = await loadTemplate("contactConfirmation", templateData);

    return sendEmail({
      to: email,
      subject: "We've Received Your Message - 5thJohnson",
      html,
    });
  } catch (error) {
    logger.error(`Error sending contact confirmation: ${error.message}`);
    throw error;
  }
};

/**
 * Notify admin about new contact message
 * @param {Object} contactMessage - Contact message object
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendAdminNotification = async (contactMessage) => {
  try {
    const { name, email, subject, message } = contactMessage;

    const templateData = {
      name,
      email,
      subject,
      message,
      date: new Date().toLocaleString(),
    };

    const html = await loadTemplate("adminNotification", templateData);

    return sendEmail({
      to: nodemailer.adminEmail,
      subject: `New Contact Form Message: ${subject}`,
      html,
      replyTo: email,
    });
  } catch (error) {
    logger.error(`Error sending admin notification: ${error.message}`);
    throw error;
  }
};

/**
 * Send review response to customer
 * @param {Object} review - Review object with admin response
 * @returns {Promise<Object>} Nodemailer info object
 */
const sendReviewResponse = async (review) => {
  try {
    const { name, email, rating, comment, adminResponse, product, createdAt } =
      review;

    const templateData = {
      name,
      rating: "★".repeat(rating) + "☆".repeat(5 - rating),
      comment,
      response: adminResponse.response,
      productName: product.name,
      date: createdAt.toLocaleDateString(),
    };

    const html = await loadTemplate("reviewResponse", templateData);

    return sendEmail({
      to: email,
      subject: "Response to Your 5thJohnson Product Review",
      html,
    });
  } catch (error) {
    logger.error(`Error sending review response: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendContactConfirmation,
  sendAdminNotification,
  sendReviewResponse,
};
