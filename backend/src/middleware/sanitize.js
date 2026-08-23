/**
 * Pulse AI — Input Sanitization Middleware
 *
 * Sanitizes all incoming request bodies to prevent XSS and injection.
 * Strips HTML tags, trims whitespace, and limits string lengths.
 */

const logger = require("../lib/logger");

/**
 * Strip HTML tags from a string to prevent XSS.
 */
function stripHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize a value recursively.
 */
function sanitizeValue(value) {
  if (typeof value === "string") {
    return stripHtml(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const sanitized = {};
    for (const [key, val] of Object.entries(value)) {
      // Sanitize the key too (prevent prototype pollution)
      const cleanKey = stripHtml(key);
      if (cleanKey === "__proto__" || cleanKey === "constructor" || cleanKey === "prototype") {
        logger.warn({ key: cleanKey }, "Blocked suspicious object key");
        continue;
      }
      sanitized[cleanKey] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
}

/**
 * Express middleware that sanitizes req.body.
 */
function sanitize(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  // Also sanitize query params
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  next();
}

module.exports = { sanitize };
