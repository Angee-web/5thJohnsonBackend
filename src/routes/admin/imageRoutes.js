const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const imageController = require("../../controllers/admin/imageController");

// Setup multer storage for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "tmp/uploads/");
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

/**
 * @route POST /api/admin/background/upload
 * @desc Upload a background image
 * @access Admin
 */
router.post("/upload", upload.single("image"), imageController.uploadBackgroundImage);

module.exports = router;