/**
 * Generate structured meta tags for each page type
 */
const generateMetaTags = (pageType, data) => {
  const baseUrl = process.env.BASE_URL;
  const siteName = "5thJohnson - Premium Clothing Collection";

  const metaTags = {
    home: {
      title: "5thJohnson | Premium Clothing & Fashion Apparel",
      description:
        "Discover premium quality clothing at 5thJohnson. Shop our collection of sustainable fashion, activewear, and casual apparel for men and women.",
      canonical: baseUrl,
      ogType: "website",
    },
    product: {
      title: `${data.name} | 5thJohnson Clothing`,
      description:
        data.description.length > 160
          ? `${data.description.substring(0, 157)}...`
          : data.description,
      canonical: `${baseUrl}/products/${data.slug}`,
      ogType: "product",
      structuredData: {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: data.name,
        image: data.images[0]?.url || "",
        description: data.description,
        brand: {
          "@type": "Brand",
          name: "5thJohnson",
        },
        offers: {
          "@type": "Offer",
          price: data.price,
          priceCurrency: "USD",
          availability:
            data.inventory > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      },
    },
    category: {
      title: `${data.name} Clothing Collection | 5thJohnson`,
      description: `Shop our ${
        data.name
      } collection at 5thJohnson. Find premium quality ${data.name.toLowerCase()} for every occasion.`,
      canonical: `${baseUrl}/categories/${data.slug}`,
      ogType: "website",
    },
    // Add other page types as needed
  };

  return metaTags[pageType] || metaTags.home;
};

module.exports = { generateMetaTags };
