const express = require("express");
const router = express.Router();
// const { seoMiddleware } = require("../middleware/seoMiddleware");

// Client routes
const clientProductRoutes = require("./client/productRoutes");
const clientCollectionRoutes = require("./client/collectionRoutes");
const clientFavoriteRoutes = require("./client/favoriteRoutes");
const clientReviewRoutes = require("./client/reviewRoutes");
const clientContactRoutes = require("./client/contactRoutes");
const clientWhatsappRoutes = require("./client/whatsappRoutes");
const clientAuthRoutes = require("./client/authRoutes");
const emailRoutes = require("./client/emailRoutes");

// Admin routes
const adminProductRoutes = require("./admin/productRoutes");
const adminCollectionRoutes = require("./admin/collectionRoutes");
const adminMessageRoutes = require("./admin/messageRoutes");
const adminReviewRoutes = require("./admin/reviewRoutes");
const adminAuthRoutes = require("./admin/authRoutes");

// // Apply SEO middleware to client routes
// router.use(seoMiddleware);

// Client Routes
router.use("/products", clientProductRoutes);
router.use("/collections", clientCollectionRoutes);
router.use("/favorites", clientFavoriteRoutes);
router.use("/reviews", clientReviewRoutes);
router.use("/contact", clientContactRoutes);
router.use("/whatsapp", clientWhatsappRoutes);
router.use("/user/auth", clientAuthRoutes);
router.use("/email", emailRoutes);

// Admin Routes
router.use("/admin/products", adminProductRoutes);
router.use("/admin/collections", adminCollectionRoutes);
router.use("/admin/messages", adminMessageRoutes);
router.use("/admin/reviews", adminReviewRoutes);
router.use("/admin/auth", adminAuthRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "5thJohnson is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
