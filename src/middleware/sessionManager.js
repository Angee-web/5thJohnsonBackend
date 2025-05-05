const { v4: uuidv4 } = require("uuid");
const constants = require("../config/constants");
const Session = require("../models/Session");
const logger = require("../utils/logger");

// // In sessionManager.js
// console.log("Session found:", !!session);
// console.log("Favorites count:", session?.favorites?.length || 0);

/**
 * Session management middleware
 * Creates and manages client sessions for tracking favorites and preferences
 */
const sessionManager = async (req, res, next) => {
  try {
    // Get session ID from cookie
    let sessionId = req.cookies[constants.AUTH.SESSION_COOKIE_NAME];

    // If session ID exists, validate it
    if (sessionId) {
      const session = await Session.findOne({ sessionId });

      if (session) {
        // Attach session to request
        req.clientSession = session;

        // Update last active timestamp
        session.lastActive = Date.now();
        await session.save();
      } else {
        // Invalid or expired session, create new one
        sessionId = null;
      }
    }

    // If no valid session, create one
    if (!sessionId) {
      const newSessionId = uuidv4();
      const newSession = new Session({
        sessionId: newSessionId,
        favorites: [],
        lastActive: Date.now(),
      });

      // Save session to database
      await newSession.save();

      // Attach session to request
      req.clientSession = newSession;

      // Set session cookie
      res.cookie(constants.AUTH.SESSION_COOKIE_NAME, newSessionId, {
        maxAge: constants.AUTH.SESSION_EXPIRY,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    next();
  } catch (error) {
    logger.error(`Session manager error: ${error.message}`);

    // Continue without session if there's an error
    next();
  }
};

/**
 * Clear client session
 */
const clearSession = async (req, res, next) => {
  try {
    const sessionId = req.cookies[constants.AUTH.SESSION_COOKIE_NAME];

    if (sessionId) {
      // Remove from database
      await Session.findOneAndDelete({ sessionId });

      // Clear cookie
      res.clearCookie(constants.AUTH.SESSION_COOKIE_NAME);
    }

    res.json({
      success: true,
      message: "Session cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sessionManager,
  clearSession,
};
