const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === "production";

// Set up the transporter
let transporter;

if (isProduction) {
  // Production configuration - using actual SMTP server
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // Development configuration - using Ethereal for testing
  // This creates a test account on Ethereal when the app starts
  (async function () {
    try {
      const testAccount = await nodemailer.createTestAccount();
      logger.info(`Created Ethereal test account: ${testAccount.user}`);

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      logger.error(`Error setting up test email: ${error.message}`);

      // Fallback to a simple transport that logs emails
      transporter = {
        sendMail: (options) => {
          logger.info("Email would have been sent:");
          logger.info(`From: ${options.from}`);
          logger.info(`To: ${options.to}`);
          logger.info(`Subject: ${options.subject}`);
          logger.info(`Content: ${options.text || options.html}`);
          return Promise.resolve({ messageId: `dev-${Date.now()}` });
        },
      };
    }
  })();
}

// Verify transporter connection
if (isProduction) {
  transporter.verify((error) => {
    if (error) {
      logger.error(`SMTP connection error: ${error.message}`);
    } else {
      logger.info("SMTP server connection established");
    }
  });
}

// Email addresses
const adminEmail = process.env.ADMIN_EMAIL || "admin@5thjohnson.com";
const supportEmail = process.env.SUPPORT_EMAIL || "support@5thjohnson.com";
const noReplyEmail = process.env.NO_REPLY_EMAIL || "noreply@5thjohnson.com";

module.exports = {
  transporter,
  adminEmail,
  supportEmail,
  noReplyEmail,
};
