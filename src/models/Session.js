const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60, // Auto-expire after 30 days (in seconds)
    },
  },
  {
    timestamps: true,
  }
);

// Add index to improve query performance
sessionSchema.index({ lastActive: 1 });

// Delete expired sessions
sessionSchema.statics.deleteExpired = async function () {
  const expiryDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
  return this.deleteMany({ lastActive: { $lt: expiryDate } });
};

// Get favorites for a session
sessionSchema.methods.getFavorites = async function () {
  await this.populate("favorites");
  return this.favorites;
};

// Add a product to favorites
sessionSchema.methods.addFavorite = async function (productId) {
  if (!this.favorites.includes(productId)) {
    this.favorites.push(productId);
    await this.save();
  }
  return this.favorites;
};

// Remove a product from favorites
sessionSchema.methods.removeFavorite = async function (productId) {
  this.favorites = this.favorites.filter(
    (id) => id.toString() !== productId.toString()
  );
  await this.save();
  return this.favorites;
};

// Clear all favorites
sessionSchema.methods.clearFavorites = async function () {
  this.favorites = [];
  await this.save();
  return this.favorites;
};

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
