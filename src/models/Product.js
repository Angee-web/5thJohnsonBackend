const mongoose = require("mongoose");
const slugify = require("slugify");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: null,
      min: [0, "Sale price cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      maxlength: [50, "SKU cannot exceed 50 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    collections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
    variants: [
      {
        name: String,
        options: [String],
        required: Boolean,
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
        },
        publicId: {
          type: String,
          required: [true, "Public ID is required"],
        },
        altText: String,
        isFeatured: {
          type: Boolean,
          default: false,
        },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    // suppressReservedKeysWarning: true,
  }
);

// Add this pre-find middleware to handle existing queries that might look for isNew
ProductSchema.pre('find', function() {
  // If someone is querying for isNew, modify query to use newArrival
  if (this.getQuery().isNew !== undefined) {
    const isNewValue = this.getQuery().isNew;
    delete this.getQuery().isNew;
    this.getQuery().newArrival = isNewValue;
  }
});

// Add similar middleware for findOne, findOneAndUpdate, etc.
['findOne', 'findOneAndUpdate', 'updateMany', 'updateOne', 'count', 'countDocuments'].forEach(method => {
  ProductSchema.pre(method, function() {
    if (this.getQuery().isNew !== undefined) {
      const isNewValue = this.getQuery().isNew;
      delete this.getQuery().isNew;
      this.getQuery().newArrival = isNewValue;
    }
  });
});


// Add virtual for reviews
ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

// Middleware to create slug from name before saving
ProductSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// Static method to update product rating
ProductSchema.statics.updateProductRating = async function (productId) {
  const Review = mongoose.model("Review");

  // Get all approved reviews for this product
  const reviews = await Review.find({
    product: productId,
    isApproved: true,
  });

  // Calculate average rating
  if (reviews.length === 0) {
    // If no reviews, set rating to 0
    await this.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  } else {
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    // Update product with new rating
    await this.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviewCount: reviews.length,
    });
  }
};

ProductSchema.methods.getFeaturedImage = function () {
  // Return the first featured image, or the first image, or a default image
  const featuredImage = this.images.find((img) => img.isFeatured);

  if (featuredImage) {
    return {
      url: featuredImage.url,
      alt: featuredImage.altText || this.name,
    };
  }

  // If no featured image, return the first image
  if (this.images && this.images.length > 0) {
    return {
      url: this.images[0].url,
      alt: this.images[0].altText || this.name,
    };
  }

  // If no images, return a default placeholder
  return {
    url: "https://via.placeholder.com/800x600?text=No+Image",
    alt: "No image available",
  };
};

// Add this near the end of your file, before exporting the model
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model("Product", ProductSchema);
