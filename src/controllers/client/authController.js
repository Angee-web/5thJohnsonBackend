const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { successResponse, errorResponse } = require("../../utils/apiResponses");
const logger = require("../../utils/logger");

/**
 * User registration
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "Email already in use", 400);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    // Save user
    await user.save();

    // Migrate favorites from session if they exist
    if (req.clientSession && req.clientSession.favorites.length > 0) {
      user.favorites = req.clientSession.favorites;
      await user.save();

      // Clear session favorites
      req.clientSession.favorites = [];
      await req.clientSession.save();
    }

    // Generate token
    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      "Registration successful",
      201
    );
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    next(error);
  }
};

/**
 * User login
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return errorResponse(res, "Invalid credentials", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Migrate favorites from session if they exist
    if (req.clientSession && req.clientSession.favorites.length > 0) {
      // Merge session favorites with user favorites (avoiding duplicates)
      const combinedFavorites = [
        ...new Set([
          ...user.favorites.map((id) => id.toString()),
          ...req.clientSession.favorites.map((id) => id.toString()),
        ]),
      ].map((id) => mongoose.Types.ObjectId(id));

      user.favorites = combinedFavorites;
      await user.save();

      // Clear session favorites
      req.clientSession.favorites = [];
      await req.clientSession.save();
    }

    // Generate token
    const token = generateToken(user._id);

    return successResponse(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
      "Login successful"
    );
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, { user }, "User profile retrieved");
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

module.exports = {
  register,
  login,
  getProfile,
};
