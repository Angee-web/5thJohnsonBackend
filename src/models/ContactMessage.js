const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    responseStatus: {
      type: String,
      enum: ["pending", "responded", "closed"],
      default: "pending",
    },
    responseMessage: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);
