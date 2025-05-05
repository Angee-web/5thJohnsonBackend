/**
 * Template for welcome message on WhatsApp
 * @param {Object} data - Data to populate template
 * @returns {Object} WhatsApp message object
 */
module.exports = (data) => {
  const { name = "there" } = data;

  return {
    type: "text",
    body: `Hello ${name}! 👋 Welcome to 5thJohnson. We're excited to help you find the perfect clothing items. Feel free to ask any questions about our products, sizes, or styling advice. Our team is here to assist you!`,
  };
};
