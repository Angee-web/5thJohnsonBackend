const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function checkAdmin() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // Get the Admin model - adjust the schema to match your admin model structure
    const AdminSchema = new mongoose.Schema(
      {
        username: String,
        email: String,
        password: String,
        name: String,
        isActive: Boolean,
      },
      { strict: false }
    );

    const Admin = mongoose.model("Admin", AdminSchema);

    // Check if admin user exists
    const adminUser = await Admin.findOne({
      $or: [{ email: "admin@5thjohnson.com" }, { username: "admin" }],
    }).lean();

    if (adminUser) {
      console.log("Admin user found:", {
        id: adminUser._id,
        username: adminUser.username,
        email: adminUser.email,
        name: adminUser.name,
        isActive: adminUser.isActive,
      });
    } else {
      console.log("Admin user not found! You may need to run your seeder.");
    }

    // Check collection name
    console.log("\nChecking admin collection name...");
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(
      "Available collections:",
      collections.map((c) => c.name)
    );

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error(`Error checking admin user: ${error.message}`);
    // If connected, disconnect on error
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Run the function
checkAdmin();
