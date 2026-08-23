/**
 * Pulse AI — Firebase Auth Middleware
 *
 * Verifies Firebase ID tokens sent as Bearer tokens.
 * Falls back to local JWT if Firebase is not configured.
 */

const config = require("../config");

let admin;
let firebaseReady = false;

try {
  admin = require("firebase-admin");

  if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
    if (!admin.apps || admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.FIREBASE_PROJECT_ID,
          clientEmail: config.FIREBASE_CLIENT_EMAIL,
          privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    }
    firebaseReady = true;
  }
} catch (err) {
  // firebase-admin not available
}

const logger = require("../lib/logger");

if (firebaseReady) {
  logger.info("Firebase Admin SDK initialized");
} else {
  logger.warn("Firebase not configured — chat auth requires Firebase credentials on Render");
}

/**
 * Required Firebase authentication.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Authentication required." });
  }

  const idToken = header.split(" ")[1];

  if (!firebaseReady) {
    return res.status(503).json({ detail: "Authentication service not configured." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || null,
    };
    next();
  } catch (err) {
    logger.warn({ err: err.message }, "Firebase token verification failed");
    return res.status(401).json({ detail: "Invalid or expired token." });
  }
}

/**
 * Optional Firebase authentication.
 */
async function optionalAuth(req, res, next) {
  if (!firebaseReady) return next();

  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(header.split(" ")[1]);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || null,
      };
    } catch {
      // Continue without user
    }
  }
  next();
}

/**
 * Required Firebase authentication + early access approval check.
 * Verifies the token, then ensures the user has been approved by admin.
 */
async function requireApproved(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Authentication required." });
  }

  if (!firebaseReady) {
    return res.status(503).json({ detail: "Authentication service not configured." });
  }

  try {
    // Step 1: Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(header.split(" ")[1]);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || null,
    };

    // Step 2: Check early access approval status
    const { EarlyAccess } = require("../models");
    const entry = await EarlyAccess.findByFirebaseUid(req.user.uid);

    if (!entry) {
      return res.status(403).json({ detail: "You have not signed up for early access yet." });
    }
    if (entry.status === "pending") {
      return res.status(403).json({ detail: "Your account is pending admin approval. Please wait for approval before using Pulse AI.", status: "pending" });
    }
    if (entry.status === "rejected") {
      return res.status(403).json({ detail: "Your early access request was not approved.", status: "rejected" });
    }

    // Approved — attach the early access record and continue
    req.earlyAccess = entry;
    next();
  } catch (err) {
    logger.warn({ err: err.message }, "Auth/approval check failed");
    return res.status(401).json({ detail: "Invalid or expired token." });
  }
}

module.exports = { requireAuth, optionalAuth, requireApproved };
