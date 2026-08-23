/**
 * Pulse AI — Admin Auth Middleware
 *
 * Simple key-based admin authentication.
 * Set ADMIN_SECRET_KEY in your .env to protect admin endpoints.
 */

const config = require("../config");

/**
 * Require admin secret key via X-Admin-Key header.
 * Returns 401 if key is missing or invalid.
 */
function requireAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"];

  if (!adminKey) {
    return res.status(401).json({ detail: "Admin authentication required." });
  }

  if (!config.ADMIN_SECRET_KEY) {
    console.error("ADMIN_SECRET_KEY not set in environment. Admin endpoints are inaccessible.");
    return res.status(503).json({ detail: "Admin authentication not configured." });
  }

  if (adminKey !== config.ADMIN_SECRET_KEY) {
    return res.status(403).json({ detail: "Invalid admin key." });
  }

  next();
}

module.exports = { requireAdmin };
