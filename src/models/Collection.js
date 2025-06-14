const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const collectionSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Collection name is required"],
      trim: true,
      maxlength: [100, "Collection name cannot exceed 100 characters"]
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, "Collection description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    image: {
      url: String,
      publicId: String,
      altText: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    metadata: {
      productCount: {
        type: Number,
        default: 0
      },
      seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
      }
    }
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true }
  }
);

// Add text index for search
collectionSchema.index({ 
  name: "text",
  description: "text"
});

// Create slug from name before saving
collectionSchema.pre("save", function(next) {
  if (this.newArrival || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  next();
});

// Virtual for products in this collection
collectionSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "collections"
});

// Update product count
collectionSchema.statics.updateProductCount = async function (collectionId) {
  const Product = mongoose.model("Product");

  const count = await Product.countDocuments({
    collections: collectionId,
    isActive: true
  });

  await this.findByIdAndUpdate(collectionId, {
    "metadata.productCount": count
  });
};

const Collection = mongoose.model("Collection", collectionSchema);

module.exports = Collection;