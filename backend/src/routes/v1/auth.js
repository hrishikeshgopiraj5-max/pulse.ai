/**
 * Pulse AI — Auth Routes (v1)
 *
 * Thin route definitions. All logic lives in controllers and services.
 */

const { Router } = require("express");
const AuthController = require("../../controllers/AuthController");
const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { schemas } = require("../../lib/validation");
const { authLimiter } = require("../../middleware/rateLimit");
const { EarlyAccess } = require("../../models");
const { signAccessToken, signRefreshToken } = require("../../lib/token");
const { UnauthorizedError, ForbiddenError } = require("../../lib/errors");
const logger = require("../../lib/logger");

const router = Router();

// Standard auth routes (rate limited)
router.post("/register", authLimiter, validate(schemas.register), AuthController.register);
router.post("/login", authLimiter, validate(schemas.login), AuthController.login);
router.post("/refresh", validate(schemas.refresh), AuthController.refresh);
router.get("/me", authenticate, AuthController.me);

/**
 * POST /api/v1/auth/firebase-session
 *
 * Bridges Firebase Authentication → Backend JWT.
 * Frontend calls this after Firebase login + approval check.
 * Backend verifies the user exists in early_access_signups with status "approved",
 * then issues backend JWT tokens for chat API access.
 *
 * This works even when Firebase Admin SDK is not configured on the backend.
 */
router.post("/firebase-session", authLimiter, async (req, res, next) => {
  try {
    const { email, firebase_uid } = req.body;

    if (!email) {
      throw new UnauthorizedError("Email is required.");
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check early access approval status
    const entry = await EarlyAccess.findByEmail(normalizedEmail);

    if (!entry) {
      throw new UnauthorizedError("You haven't signed up for early access yet. Please sign up first.");
    }

    if (entry.status === "pending") {
      throw new ForbiddenError("Your account is pending admin approval. Please wait for approval before using Pulse AI.");
    }

    if (entry.status === "rejected") {
      throw new ForbiddenError("Your early access request was not approved.");
    }

    // User is approved — issue backend JWT tokens
    // Use the early_access_signups id as the user sub
    const tokenPayload = {
      sub: entry.id,
      email: normalizedEmail,
      name: entry.name || normalizedEmail.split("@")[0],
      firebase_uid: entry.firebase_uid || firebase_uid || null,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    logger.info({ userId: entry.id, email: normalizedEmail }, "Firebase session issued");

    res.json({
      success: true,
      message: "Session created.",
      data: {
        user: {
          id: entry.id,
          email: normalizedEmail,
          name: entry.name,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
