const express = require("express");
const router = express.Router();
const backgroundController = require("../../controllers/admin/backgroundController");
const upload = require("../../middleware/multer"); // Multer middleware for file uploads
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadDir = path.resolve(__dirname, "../../tmp/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
/**
 * @route POST /api/admin/background/upload
 * @desc Upload a background image
 * @access Admin
 */
router.post("/upload", upload.single("image"), backgroundController.uploadBackgroundImage);

module.exports = router;