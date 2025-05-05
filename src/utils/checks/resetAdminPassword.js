const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Get the Admin model - Using a flexible schema since we don't know the exact structure
    const Admin = mongoose.model(
      "Admin",
      new mongoose.Schema({}, { strict: false })
    );

    // Generate new hashed password
    const newPassword = "admin123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log(`Generated new hashed password for 'admin123'`);

    // Update admin user password
    const result = await Admin.updateOne(
      { username: "admin" },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Admin password has been reset to '${newPassword}'`);

      // Verify the update by finding the user
      const admin = await Admin.findOne({ username: "admin" });
      console.log("Updated admin user:", {
        id: admin._id,
        username: admin.username,
        passwordHash: admin.password.substring(0, 10) + "...", // Show part of the hash for verification
      });
    } else {
      console.log(
        "No admin user was updated. User might not exist or password already matches."
      );
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error(`Error resetting admin password: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Run the function
resetAdminPassword();
