
const { transporter, noReplyEmail } = require("../../config/nodemailer");
const logger = require("../utils/logger");

/**
 * Send an email
 * @route POST /api/email/send
 */
const sendEmail = async (req, res, next) => {
  try {
    const { to, subject, message } = req.body;

    // Validate input
    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields (to, subject, message) are required",
      });
    }

    // Send email using Nodemailer
    const mailOptions = {
      from: noReplyEmail, // Sender email (configured in nodemailer.js)
      to, // Recipient email
      subject, // Email subject
      text: message, // Plain text message
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent: ${info.messageId}`);
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: { messageId: info.messageId },
    });
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};

module.exports = { sendEmail };