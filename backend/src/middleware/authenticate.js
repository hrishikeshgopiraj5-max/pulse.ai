/**
 * Pulse AI — Authentication Middleware
 *
 * Verifies JWT Bearer tokens. Two variants:
 * - authenticate: rejects if no valid token (for protected routes)
 * - optionalAuth: attaches user if present, continues either way
 */

const { verifyAccessToken } = require("../lib/token");
const { UnauthorizedError } = require("../lib/errors");

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Authentication required. Please log in."));
  }

  const token = header.split(" ")[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return next(new UnauthorizedError("Invalid or expired token. Please log in again."));
  }

  req.user = payload;
  next();
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);
    if (payload) req.user = payload;
  }

  next();
}

module.exports = { authenticate, optionalAuth };
