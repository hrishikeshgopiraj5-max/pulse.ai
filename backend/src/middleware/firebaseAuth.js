/**
 * Pulse AI — Firebase Auth Middleware
 *
 * Verifies Firebase ID tokens sent as Bearer tokens.
 * Three levels: requireAuth, optionalAuth, requireApproved.
 *
 * SECURITY:
 * - Validates token format before verification
 * - Handles expired tokens gracefully
 * - Logs all auth failures for audit
 * - Does not leak internal error details to client
 */

const config = require("../config");
const logger = require("../lib/logger");

let auth = null;
let firebaseReady = false;

try {
  if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
    const { initializeApp, cert, getApps } = require("firebase-admin/app");
    const { getAuth } = require("firebase-admin/auth");

    // Fix newlines in private key — Render stores them as literal \n
    const privateKey = config.FIREBASE_PRIVATE_KEY
      .replace(/\\\\n/g, "\n")
      .replace(/\\n/g, "\n");

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: config.FIREBASE_PROJECT_ID,
          clientEmail: config.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }
    auth = getAuth();
    firebaseReady = true;
  }
} catch (err) {
  logger.error({ err: err.message, stack: err.stack }, "Firebase Admin SDK initialization failed");
}

// Import models at module level (not inside functions)
const { EarlyAccess } = require("../models");

if (firebaseReady) {
  logger.info("Firebase Admin SDK initialized");
} else {
  logger.warn("Firebase not configured — chat auth requires Firebase credentials on Render");
}

/**
 * Extract and validate Bearer token from Authorization header.
 * Returns the token string or null.
 */
function extractBearerToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.split(" ")[1];
  if (!token || token.length < 10) return null; // Firebase tokens are long
  return token;
}

/**
 * Required Firebase authentication.
 * Verifies the token and sets req.user.
 */
async function requireAuth(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({ detail: "Authentication required." });
  }

  if (!firebaseReady) {
    return res.status(503).json({ detail: "Authentication service not configured." });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token, true); // checkRevoked = true
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
    };
    next();
  } catch (err) {
    // Distinguish between expired and invalid tokens
    if (err.code === "auth/id-token-expired") {
      logger.warn({ uid: err.customData?.uid }, "Firebase token expired");
      return res.status(401).json({ detail: "Token expired. Please log in again." });
    }
    logger.warn({ err: err.message }, "Firebase token verification failed");
    return res.status(401).json({ detail: "Invalid authentication token." });
  }
}

/**
 * Optional Firebase authentication.
 * Sets req.user if valid token provided, continues without user if not.
 */
async function optionalAuth(req, res, next) {
  if (!firebaseReady) return next();

  const token = extractBearerToken(req);
  if (token) {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
      };
    } catch {
      // Continue without user — optional auth
    }
  }
  next();
}

/**
 * Required Firebase authentication + early access approval check.
 * Verifies the token, then ensures the user has been approved by admin.
 * Used for chat endpoints — only approved users can access AI.
 */
async function requireApproved(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({ detail: "Authentication required." });
  }

  if (!firebaseReady) {
    return res.status(503).json({ detail: "Authentication service not configured." });
  }

  try {
    // Step 1: Verify Firebase token
    const decodedToken = await auth.verifyIdToken(token, true);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
    };

    // Step 2: Check early access approval status
    const entry = await EarlyAccess.findByFirebaseUid(req.user.uid);

    if (!entry) {
      logger.warn({ uid: req.user.uid, email: req.user.email }, "Chat access denied: no early access record");
      return res.status(403).json({ detail: "You have not signed up for early access yet." });
    }
    if (entry.status === "pending") {
      logger.warn({ uid: req.user.uid, email: req.user.email }, "Chat access denied: pending approval");
      return res.status(403).json({ detail: "Your account is pending admin approval. Please wait for approval before using Pulse AI.", status: "pending" });
    }
    if (entry.status === "rejected") {
      logger.warn({ uid: req.user.uid, email: req.user.email }, "Chat access denied: rejected");
      return res.status(403).json({ detail: "Your early access request was not approved.", status: "rejected" });
    }

    // Approved — attach the early access record and continue
    req.earlyAccess = entry;
    next();
  } catch (err) {
    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({ detail: "Token expired. Please log in again." });
    }
    logger.error({ err: err.message }, "Auth/approval check failed unexpectedly");
    return res.status(401).json({ detail: "Invalid authentication token." });
  }
}

module.exports = { requireAuth, optionalAuth, requireApproved };
