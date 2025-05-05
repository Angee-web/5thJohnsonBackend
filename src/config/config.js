const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../.env") });

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 7000,
  baseUrl: process.env.BASE_URL || "http://localhost:7000",

  // Make sure we're using the MongoDB URI from the environment variable
  mongoURI: process.env.MONGO_URI,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },

  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    from: {
      name: process.env.EMAIL_FROM,
      address: process.env.EMAIL_FROM_ADDRESS,
    },
    admin: process.env.EMAIL_ADMIN,
  },

  whatsapp: {
    apiKey: process.env.WHATSAPP_API_KEY,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessId: process.env.WHATSAPP_BUSINESS_ID,
    webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET,
  },
};
