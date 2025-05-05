module.exports = [
  {
    name: "Jennifer Adams",
    email: "jennifer.a@example.com",
    subject: "Product availability inquiry",
    message:
      "Hello, I'm interested in the Wool Blend Overcoat in Camel color, size M. Could you please let me know when it will be back in stock? Thank you!",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  },
  {
    name: "Thomas Clark",
    email: "thomas.c@example.com",
    subject: "Sizing question",
    message:
      "Hi there, I'm typically between sizes L and XL in most brands. Which would you recommend for your Classic Cotton T-Shirts? I prefer a slightly loose fit. Thanks!",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
  },
  {
    name: "Lisa Johnson",
    email: "lisa.j@example.com",
    subject: "International shipping inquiry",
    message:
      "Hello, I love your products and would like to place an order. Do you ship to Canada, and if so, what are the shipping costs and estimated delivery times? Thank you!",
    status: "responded",
    response: {
      message:
        "Hello Lisa, thank you for your interest in our products! Yes, we do ship to Canada. Shipping costs are calculated based on weight and typically range from $15-25. Estimated delivery time is 7-10 business days. Please let me know if you have any other questions!",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    name: "David Wilson",
    email: "david.w@example.com",
    subject: "Return policy question",
    message:
      "Hi, I recently received my order of Slim Fit Jeans but they don't fit me well. What is your return policy and how can I initiate a return? Thanks in advance.",
    status: "responded",
    response: {
      message:
        "Hello David, I'm sorry to hear the jeans didn't fit as expected. Our return policy allows returns within 30 days of purchase for a full refund or exchange. To initiate a return, please message us on WhatsApp with your order number and we'll guide you through the process. Would you prefer an exchange for a different size or a refund?",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), // 4 days ago
  },
  {
    name: "Michelle Rodriguez",
    email: "michelle.r@example.com",
    subject: "Custom order possibility",
    message:
      "Hello 5thJohnson team, I'm looking to purchase 10 of your Tailored Dress Shirts for our company's executive team. Is it possible to get them customized with our company logo? And would there be a discount for a bulk order? Looking forward to your response.",
    status: "closed",
    response: {
      message:
        "Hi Michelle, thank you for considering us for your company's needs! Yes, we can definitely customize our shirts with your logo. For bulk orders of 10 or more items, we offer a 15% discount. I'd be happy to discuss the customization options and process in more detail. Could you provide your contact number so our sales team can reach out to you directly? Alternatively, feel free to message us on WhatsApp for faster communication.",
      sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
  },
];
