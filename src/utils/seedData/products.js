module.exports = [
  {
    name: "Classic Cotton T-Shirt",
    description:
      "A comfortable, everyday t-shirt made from 100% organic cotton. Features a classic fit and comes in multiple colors.",
    price: 29.99,
    salePrice: null,
    sku: "TCT-001",
    isActive: true,
    stock: 120,
    collections: ["Casual Wear", "Summer Collection"],
    variants: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL"],
        required: true,
      },
      {
        name: "Color",
        options: ["White", "Black", "Navy", "Gray"],
        required: true,
      },
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/tshirt_white_front_azubjn.jpg",
        publicId: "5thJohnson/products/tshirt_white_front_azubjn",
        altText: "White T-Shirt Front",
        isFeatured: true,
      },
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/tshirt_white_back_nlfjxw.jpg",
        publicId: "5thJohnson/products/tshirt_white_back_nlfjxw",
        altText: "White T-Shirt Back",
        isFeatured: false,
      },
    ],
    featured: false,
    onSale: false,
    newArrival: false,
    metaTitle: "Classic Cotton T-Shirt | 5thJohnson",
    metaDescription:
      "Premium quality 100% organic cotton t-shirt with classic fit in multiple colors.",
    slug: "classic-cotton-t-shirt",
  },
  {
    name: "Slim Fit Jeans",
    description:
      "Modern slim fit jeans with a slight stretch for comfort. Made from high-quality denim with a classic 5-pocket design.",
    price: 59.99,
    salePrice: 49.99,
    sku: "JNS-002",
    isActive: true,
    stock: 85,
    collections: ["Casual Wear"],
    variants: [
      {
        name: "Size",
        options: ["28", "30", "32", "34", "36"],
        required: true,
      },
      {
        name: "Color",
        options: ["Dark Blue", "Light Blue", "Black"],
        required: true,
      },
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/jeans_dark_front_cdabvt.jpg",
        publicId: "5thJohnson/products/jeans_dark_front_cdabvt",
        altText: "Dark Blue Jeans Front",
        isFeatured: true,
      },
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/jeans_dark_back_mfbzrx.jpg",
        publicId: "5thJohnson/products/jeans_dark_back_mfbzrx",
        altText: "Dark Blue Jeans Back",
        isFeatured: false,
      },
    ],
    featured: true,
    onSale: true,
    newArrival: false,
    metaTitle: "Slim Fit Jeans | 5thJohnson",
    metaDescription:
      "Modern slim fit jeans with comfortable stretch denim in multiple washes.",
    slug: "slim-fit-jeans",
  },
  {
    name: "Wool Blend Overcoat",
    description:
      "Sophisticated wool blend overcoat designed to keep you warm and stylish during colder months. Features a classic silhouette with modern detailing.",
    price: 149.99,
    salePrice: null,
    sku: "COT-003",
    isActive: true,
    stock: 40,
    collections: ["Winter Essentials", "Formal Collection"],
    variants: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL"],
        required: true,
      },
      {
        name: "Color",
        options: ["Charcoal", "Camel", "Navy"],
        required: true,
      },
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/coat_charcoal_front_guvend.jpg",
        publicId: "5thJohnson/products/coat_charcoal_front_guvend",
        altText: "Charcoal Overcoat Front",
        isFeatured: true,
      },
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/coat_charcoal_back_rizvkl.jpg",
        publicId: "5thJohnson/products/coat_charcoal_back_rizvkl",
        altText: "Charcoal Overcoat Back",
        isFeatured: false,
      },
    ],
    featured: true,
    onSale: false,
    newArrival: true,
    metaTitle: "Wool Blend Overcoat | 5thJohnson",
    metaDescription:
      "Sophisticated wool blend overcoat with classic design for cold-weather elegance.",
    slug: "wool-blend-overcoat",
  },
  {
    name: "Active Performance Leggings",
    description:
      "High-performance leggings designed for maximum comfort and flexibility during workouts. Features moisture-wicking fabric and a hidden pocket.",
    price: 45.99,
    salePrice: null,
    sku: "APL-004",
    isActive: true,
    stock: 70,
    collections: ["Sports & Active"],
    variants: [
      {
        name: "Size",
        options: ["XS", "S", "M", "L", "XL"],
        required: true,
      },
      {
        name: "Color",
        options: ["Black", "Navy", "Maroon", "Olive"],
        required: true,
      },
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/leggings_black_front_hpdgcz.jpg",
        publicId: "5thJohnson/products/leggings_black_front_hpdgcz",
        altText: "Black Performance Leggings Front",
        isFeatured: true,
      },
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/leggings_black_back_qisowx.jpg",
        publicId: "5thJohnson/products/leggings_black_back_qisowx",
        altText: "Black Performance Leggings Back",
        isFeatured: false,
      },
    ],
    featured: false,
    onSale: false,
    newArrival: true,
    metaTitle: "Active Performance Leggings | 5thJohnson",
    metaDescription:
      "High-performance workout leggings with moisture-wicking technology and hidden pocket.",
    slug: "active-performance-leggings",
  },
  {
    name: "Tailored Dress Shirt",
    description:
      "Crisp, tailored dress shirt made from premium cotton with a modern slim fit. Perfect for professional settings or formal occasions.",
    price: 65.99,
    salePrice: 55.99,
    sku: "TDS-005",
    isActive: true,
    stock: 60,
    collections: ["Formal Collection"],
    variants: [
      {
        name: "Size",
        options: ["15", "15.5", "16", "16.5", "17", "17.5"],
        required: true,
      },
      {
        name: "Color",
        options: ["White", "Light Blue", "Pink", "Lavender"],
        required: true,
      },
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/dress_shirt_white_front_abdcjk.jpg",
        publicId: "5thJohnson/products/dress_shirt_white_front_abdcjk",
        altText: "White Dress Shirt Front",
        isFeatured: true,
      },
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/dress_shirt_white_back_qrcbna.jpg",
        publicId: "5thJohnson/products/dress_shirt_white_back_qrcbna",
        altText: "White Dress Shirt Back",
        isFeatured: false,
      },
    ],
    featured: true,
    onSale: true,
    newArrival: false,
    metaTitle: "Tailored Dress Shirt | 5thJohnson",
    metaDescription:
      "Premium cotton dress shirt with tailored fit for professional and formal occasions.",
    slug: "tailored-dress-shirt",
  },
  {
    name: "Summer Linen Shorts",
    description:
      "Lightweight linen-blend shorts perfect for warm weather. Features a comfortable elastic waistband with drawstring and side pockets.",
    price: 39.99,
    salePrice: null,
    sku: "SLS-006",
    isActive: true,
    stock: 95,
    collections: ["Summer Collection", "Casual Wear"],
    variants: [
      {
        name: "Size",
        options: ["S", "M", "L", "XL"],
        required: true,
      },
      {
        name: "Color",
        options: ["Beige", "Light Blue", "Navy", "Olive"],
        required: true,
      },
    ],
    images: [
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/shorts_beige_front_bcdfei.jpg",
        publicId: "5thJohnson/products/shorts_beige_front_bcdfei",
        altText: "Beige Linen Shorts Front",
        isFeatured: true,
      },
      {
        url: "https://res.cloudinary.com/dstx0nacn/image/upload/v1622567863/5thJohnson/products/shorts_beige_back_defghi.jpg",
        publicId: "5thJohnson/products/shorts_beige_back_defghi",
        altText: "Beige Linen Shorts Back",
        isFeatured: false,
      },
    ],
    featured: false,
    onSale: false,
    newArrival: true,
    metaTitle: "Summer Linen Shorts | 5thJohnson",
    metaDescription:
      "Lightweight linen-blend shorts with elastic waistband for summer comfort.",
    slug: "summer-linen-shorts",
  },
];
