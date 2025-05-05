/**
 * Generate Schema.org structured data for different page types
 */

// Product schema
const productSchema = (product) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images.map((img) => img.url),
    description: product.description,
    sku: product.sku,
    mpn: product._id,
    brand: {
      "@type": "Brand",
      name: "5thJohnson",
    },
    offers: {
      "@type": "Offer",
      url: `${process.env.BASE_URL}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.finalPrice || product.price,
      priceValidUntil:
        product.saleEndDate ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
      availability:
        product.inventory > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "5thJohnson",
      },
    },
    review: product.reviews?.map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      author: {
        "@type": "Person",
        name: review.name,
      },
      reviewBody: review.comment,
    })),
    aggregateRating:
      product.reviewsCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avgRating,
            reviewCount: product.reviewsCount,
          }
        : undefined,
  };
};

// Organization schema
const organizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "5thJohnson",
    url: process.env.BASE_URL,
    logo: `${process.env.BASE_URL}/images/logo/logo.png`,
    sameAs: [
      "https://www.facebook.com/5thjohnson",
      "https://www.instagram.com/5thjohnson",
      "https://twitter.com/5thjohnson",
      "https://www.pinterest.com/5thjohnson",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-555-5555",
      contactType: "customer service",
    },
  };
};

// Breadcrumb schema
const breadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

// Category schema
const collectionSchema = (collection, products) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${collection.name} Collection | 5thJohnson`,
    description: collection.description,
    url: `${process.env.BASE_URL}/collections/${collection.slug}`,
    hasPart: products.map((product) => ({
      "@type": "Product",
      name: product.name,
      url: `${process.env.BASE_URL}/products/${product.slug}`,
    })),
  };
};


// FAQ schema
const faqSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

module.exports = {
  productSchema,
  organizationSchema,
  breadcrumbSchema,
  collectionSchema,
  faqSchema,
};
