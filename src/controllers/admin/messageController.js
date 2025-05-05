const ContactMessage = require("../../models/ContactMessage");
const emailService = require("../../services/emailService");
const { successResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * Get all contact messages
 * @route GET /api/admin/messages
 */
/**
 * Get all messages with pagination and filtering
 */
const getMessages = async (req, res, next) => {
  try {
    // Extract query parameters
    const { 
      page = 1, 
      limit = 20, 
      status, 
      sort = "createdAt:desc",
      search,
      showDeleted = false // New parameter to control visibility of deleted messages
    } = req.query;

    // Build query
    const query = {};
    
    // Unless explicitly requested, exclude deleted messages
    if (!showDeleted || showDeleted !== "true") {
      query.isDeleted = { $ne: true };
    }

    // Apply status filter if provided
    if (status) {
      query.status = status;
    }

    // Apply search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }

    // Rest of your function remains the same...
    
    // ...
  } catch (error) {
    next(error);
  }
};

/**
 * Get message by ID
 * @route GET /api/admin/messages/:id
 */
const getMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { showDeleted = false } = req.query;
    
    // Build query with ID
    const query = { _id: id };
    
    // Unless explicitly requested, exclude deleted messages
    if (showDeleted !== "true") {
      query.isDeleted = { $ne: true };
    }

    const message = await ContactMessage.findOne(query);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    return successResponse(res, { message }, "Message fetched successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to a message
 * @route POST /api/admin/messages/:id/respond
 */
/**
 * Respond to a message
 */
const respondToMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "Response text is required",
      });
    }

    // Debug log
    console.log(`Adding response to message ${id}:`, response);

    // Find the message by ID
    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Update the message with the response
    message.responseMessage = response; 
    message.responseStatus = "responded"; // This should match your DB field name
    message.status = "responded"; // Change from responseStatus to status
    message.isRead = true; 
     
       await message.save();

    // Check if the update worked
    console.log("Updated message:", message.responseMessage);

    // Send email notification if applicable
    try {
      await emailService.sendResponseEmail(message.email, message.name, response, message.subject);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Continue execution even if email fails
    }

    return successResponse(res, { message }, "Response added successfully");
  } catch (error) {
    console.error("Error responding to message:", error);
    next(error);
  }
};


/**
 * Update message status (with toggle functionality)
 * @route PUT /api/admin/messages/:id/status
 */
const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "responded", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // First get the current message to determine toggles
    const currentMessage = await ContactMessage.findById(id);
    
    if (!currentMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }
    
    // Determine read status based on status change
    let isRead = currentMessage.isRead;
    
    // If changing to "pending", mark as unread unless explicitly set
    if (status === "pending" && currentMessage.status !== "pending") {
      isRead = false;
    }
    
    // If changing to "responded", always mark as read
    if (status === "responded") {
      isRead = true;
    }
    
    // If changing to "closed", always mark as read
    if (status === "closed") {
      isRead = true; 
    }
    
    // If toggle flag is provided, invert the read status
    if (req.body.toggleRead !== undefined) {
      isRead = !currentMessage.isRead;
    }

    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      id,
      {
        status: status,
        responseStatus: status, // Add this line to update both fields
        isRead: isRead,
      },
      { new: true }
    );

    return successResponse(
      res, 
      `Status updated to ${status} and read status is now ${isRead ? 'read' : 'unread'}`, 
      { message: updatedMessage }
    );
  } catch (error) {
    console.error("Error updating message status:", error);
    next(error);
  }
};

/**
 * Delete message (soft delete)
 * @route DELETE /api/admin/messages/:id
 */
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the message first
    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Update instead of delete (soft delete)
    message.status = "closed";
    message.responseStatus = "closed"; // Update both fields
    message.isRead = false; // Mark as unread
    message.isDeleted = true; // Optional: add a deletion flag
    await message.save();

    return successResponse(res, "Message marked as deleted successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Delete message response
 * @route DELETE /api/admin/messages/:id/response
 */
const deleteMessageResponse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the message first
    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if there's a response to delete
    if (!message.responseMessage) {
      return res.status(400).json({
        success: false,
        message: "This message doesn't have a response to delete",
      });
    }

    // Remove the response and update status
    message.responseMessage = "";
    message.status = "pending"; 
    message.responseStatus = "pending"; // Update both fields
    message.isRead = false;  // Mark as unread since it needs attention again
    
    await message.save();

    return successResponse(
      res, 
      "Response has been deleted and message returned to pending status", 
      { message }
    );
  } catch (error) {
    console.error("Error deleting message response:", error);
    next(error);
  }
};

module.exports = {
  getMessages,
  getMessageById,
  respondToMessage,
  updateMessageStatus,
  deleteMessage,
  deleteMessageResponse,
  // Add any other functions you want to expose here
};
