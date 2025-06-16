const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");

// Route to send emails
router.post("/send", emailController.sendEmail);

module.exports = router;