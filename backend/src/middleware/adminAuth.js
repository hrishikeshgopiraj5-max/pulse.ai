/**
 * Pulse AI — Admin Auth Middleware
 *
 * Key-based admin authentication with timing-safe comparison.
 * Set ADMIN_SECRET_KEY in your .env to protect admin endpoints.
 *
 * SECURITY NOTES:
 * - Uses crypto.timingSafeEqual to prevent timing attacks
 * - Logs all failed auth attempts for audit
 * - Returns generic errors to prevent enumeration
 */

const config = require("../config");
const crypto = require("crypto");
const logger = require("../lib/logger");

/**
 * Timing-safe string comparison.
 * Prevents attackers from measuring response time to guess the key.
 */
function safeCompare(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) {
    // Compare a dummy value of same length to prevent length-based timing
    crypto.timingSafeEqual(Buffer.from(a), Buffer.from(a));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Require admin secret key via X-Admin-Key header.
 * Returns 401/403 if key is missing or invalid.
 */
function requireAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey) {
    logger.warn({ ip: req.ip, path: req.path }, "Admin auth: missing key");
    return res.status(401).json({ detail: "Admin authentication required." });
  }

  if (!config.ADMIN_SECRET_KEY) {
    logger.error("ADMIN_SECRET_KEY not set in environment. Admin endpoints are inaccessible.");
    return res.status(503).json({ detail: "Admin authentication not configured on this server." });
  }

  // Timing-safe comparison to prevent timing attacks
  if (!safeCompare(adminKey, config.ADMIN_SECRET_KEY)) {
    logger.warn({ ip: req.ip, path: req.path }, "Admin auth: invalid key attempted");
    return res.status(403).json({ detail: "Invalid admin key." });
  }

  // Key is valid — continue
  logger.info({ ip: req.ip, path: req.path }, "Admin auth: valid key");
  next();
}

module.exports = { requireAdmin };
