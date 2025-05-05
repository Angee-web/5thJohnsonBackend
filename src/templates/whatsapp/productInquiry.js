/**
 * Template for product inquiry message on WhatsApp
 * @param {Object} data - Data to populate template
 * @returns {Object} WhatsApp message object
 */
module.exports = (data) => {
  const {
    productId,
    productName,
    query = "I'm interested in this product",
  } = data;

  return {
    type: "text",
    body: `Product Inquiry: ${productName}\n\nCustomer Query: "${query}"\n\nProduct ID: ${productId}\n\nOur team will assist you with information about this product shortly. Thank you for your interest in 5thJohnson!`,
  };
};
