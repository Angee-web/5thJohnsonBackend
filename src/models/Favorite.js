const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
      ref: "Session",
    },
    product: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a product can only be favorited once per session
favoriteSchema.index({ sessionId: 1, product: 1 }, { unique: true });

// Index to improve performance when looking up by sessionId
favoriteSchema.index({ sessionId: 1 });

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
