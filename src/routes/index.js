const express = require("express");
const router = express.Router();
const { seoMiddleware } = require("../middleware/seoMiddleware");

// Client routes
const clientProductRoutes = require("./client/productRoutes");
const clientCollectionRoutes = require("./client/collectionRoutes");
const clientFavoriteRoutes = require("./client/favoriteRoutes");
const clientReviewRoutes = require("./client/reviewRoutes");
const clientContactRoutes = require("./client/contactRoutes");
const clientWhatsappRoutes = require("./client/whatsappRoutes");
const clientAuthRoutes = require("./client/authRoutes");

// Admin routes
const adminProductRoutes = require("./admin/productRoutes");
const adminCollectionRoutes = require("./admin/collectionRoutes");
const adminMessageRoutes = require("./admin/messageRoutes");
const adminReviewRoutes = require("./admin/reviewRoutes");
const adminAuthRoutes = require("./admin/authRoutes");

// Apply SEO middleware to client routes
router.use(seoMiddleware);

// Client API Routes
router.use("/api/products", clientProductRoutes);
router.use("/api/collections", clientCollectionRoutes);
router.use("/api/favorites", clientFavoriteRoutes);
router.use("/api/reviews", clientReviewRoutes);
router.use("/api/contact", clientContactRoutes);
router.use("/api/whatsapp", clientWhatsappRoutes);
router.use("/api/user/auth", clientAuthRoutes);

// Admin API Routes
router.use("/api/admin/products", adminProductRoutes);
router.use("/api/admin/collections", adminCollectionRoutes);
router.use("/api/admin/messages", adminMessageRoutes);
router.use("/api/admin/reviews", adminReviewRoutes);
router.use("/api/admin/auth", adminAuthRoutes);

// Health check endpoint
router.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "5thJohnson API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
