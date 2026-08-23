/**
 * Pulse AI — Request ID Middleware
 *
 * Attaches a unique ID to each request for log correlation and tracing.
 * If the client sends X-Request-ID, reuses it; otherwise generates one.
 */

const { v4: uuidv4 } = require("uuid");

function requestId(req, res, next) {
  const id = req.headers["x-request-id"] || uuidv4();
  req.id = id;
  res.setHeader("X-Request-ID", id);
  next();
}

module.exports = { requestId };
