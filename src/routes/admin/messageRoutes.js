const express = require("express");
const router = express.Router();
const messageController = require("../../controllers/admin/messageController");
const { adminAuth } = require("../../middleware/adminAuth");
const validate = require("../../middleware/validator");
const { messageValidators } = require("../../utils/validators");

// Protect all routes with admin authentication
router.use(adminAuth);

/**
 * @route   GET /api/admin/messages
 * @desc    Get all contact messages
 * @access  Admin
 */
router.get("/", messageController.getMessages);

/**
 * @route   GET /api/admin/messages/:id
 * @desc    Get a message by ID
 * @access  Admin
 */
router.get(
  "/:id",
  validate(messageValidators.getMessage),
  messageController.getMessageById
);

/**
 * @route   PUT /api/admin/messages/:id/status
 * @desc    Update message status
 * @access  Admin
 */
router.put(
  "/:id/status",
  validate(messageValidators.updateStatus),
  messageController.updateMessageStatus
);

/**
 * @route   POST /api/admin/messages/:id/respond
 * @desc    Respond to a message
 * @access  Admin
 */
router.post(
  "/:id/respond",
  validate(messageValidators.respondToMessage),
  messageController.respondToMessage
);

/**
 * @route   DELETE /api/admin/messages/:id
 * @desc    Delete a message
 * @access  Admin
 */
router.delete(
  "/:id",
  validate(messageValidators.deleteMessage),
  messageController.deleteMessage
);

/**
 * @desc Delete message response
 * @route DELETE /api/admin/messages/:id/response
 * @access Admin
 */
router.delete(
  "/:id/response",
  validate(messageValidators.deleteResponse),
  messageController.deleteMessageResponse
);

module.exports = router;
