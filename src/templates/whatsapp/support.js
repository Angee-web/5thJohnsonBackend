/**
 * Template for support message on WhatsApp
 * @param {Object} data - Data to populate template
 * @returns {Object} WhatsApp message object
 */
module.exports = (data) => {
  const { issue, name = "there" } = data;

  return {
    type: "text",
    body: `Hello ${name}! Thank you for contacting 5thJohnson support.\n\n${
      issue ? `Regarding your issue: "${issue}"\n\n` : ""
    }Our team will assist you shortly. We typically respond within 1-2 hours during business hours (9 AM - 6 PM, Monday to Friday).\n\nThank you for your patience!`,
  };
};
