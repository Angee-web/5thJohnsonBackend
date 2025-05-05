module.exports = {
  // Default SEO values
  defaults: {
    title: "Premium Clothing | 5thJohnson",
    description:
      "Shop premium quality clothing at 5thJohnson. Discover our collection of sustainable fashion and modern apparel.",
    image: "/images/default-social.jpg",
    logo: "/images/logo.png",
    twitter: "@5thJohnson",
    language: "en",
    themeColor: "#4a90e2",
  },

  // Site information for schema.org
  site: {
    name: "5thJohnson",
    url: process.env.BASE_URL || "https://www.5thjohnson.com",
    logo: "/images/logo.png",
    contactEmail: "contact@5thjohnson.com",
    contactPhone: "+1-123-456-7890",
    socialProfiles: {
      twitter: "https://twitter.com/5thJohnson",
      facebook: "https://facebook.com/5thJohnson",
      instagram: "https://instagram.com/5thJohnson",
    },
    address: {
      streetAddress: "123 Fashion Avenue",
      addressLocality: "New York",
      addressRegion: "NY",
      postalCode: "10001",
      addressCountry: "US",
    },
  },

  // Analytics IDs
  analytics: {
    googleAnalyticsId: process.env.GA_MEASUREMENT_ID,
    facebookPixelId: process.env.FB_PIXEL_ID,
  },

  // Robots configurations
  robots: {
    production: "index, follow",
    development: "noindex, nofollow",
    userBlocked: "noindex, nofollow",
  },

  // URL patterns for canonical URLs
  urlPatterns: {
    product: "/products/{slug}",
    collection: "/collections/{slug}",
    page: "/{slug}",
  },
};
