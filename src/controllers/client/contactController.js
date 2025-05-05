const ContactMessage = require("../../models/ContactMessage");
const emailService = require("../../services/emailService");
const { successResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * Submit a contact form message
 * @route POST /api/contact
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Create contact message record
    const contactMessage = new ContactMessage({
      name,
      email,
      subject,
      message,
      status: "pending",
      // Store request metadata
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    await contactMessage.save();

    // Send confirmation email to customer
    try {
      await emailService.sendContactConfirmation(contactMessage);
    } catch (emailError) {
      logger.error(
        `Failed to send contact confirmation email: ${emailError.message}`
      );
      // Continue even if email fails - don't fail the request
    }

    // Send notification email to admin
    try {
      await emailService.sendAdminNotification(contactMessage);
    } catch (emailError) {
      logger.error(
        `Failed to send admin notification email: ${emailError.message}`
      );
      // Continue even if email fails
    }

    return successResponse(
      res,
      { id: contactMessage._id },
      "Your message has been sent. Thank you for contacting us!",
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactForm,
};
