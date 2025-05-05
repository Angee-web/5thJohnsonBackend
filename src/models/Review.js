const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    response: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware - after saving review, update product rating
ReviewSchema.post("save", async function () {
  await this.constructor.calcAverageRating(this.product);
});

// Static method to calculate average rating
ReviewSchema.statics.calcAverageRating = async function (productId) {
  const Product = mongoose.model("Product");
  await Product.updateProductRating(productId);
};

module.exports = mongoose.model("Review", ReviewSchema);
