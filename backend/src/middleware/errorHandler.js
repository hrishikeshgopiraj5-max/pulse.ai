/**
 * Pulse AI — Error Handler
 *
 * Catches all errors. Operational errors (AppError) are sent as-is.
 * Unknown errors get a generic 500 response.
 */

const logger = require("../lib/logger");
const { error } = require("../lib/response");
const { AppError } = require("../lib/errors");

/**
 * 404 handler — route not matched.
 */
function notFoundHandler(req, res, next) {
  const err = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(err);
}

/**
 * Global error handler — last middleware in the chain.
 */
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;

  // Log unexpected errors with full stack
  if (!err.isOperational || statusCode >= 500) {
    logger.error({ err, requestId: req.id }, "Unhandled error");
  } else {
    logger.warn({ err, requestId: req.id }, err.message);
  }

  // Send response — never leak internals in production
  // But log the full error for debugging
  if (statusCode >= 500) {
    logger.error({ err: { message: err.message, code: err.code, detail: err.detail, stack: err.stack }, requestId: req.id, path: req.originalUrl, method: req.method }, "500 error details");
  }
  const message = err.isOperational ? err.message : "An unexpected error occurred.";
  const meta = {};

  // Only include request ID in non-production for debugging
  if (process.env.NODE_ENV !== "production") {
    meta.requestId = req.id;
  }

  res.status(statusCode).json(error(message, meta));
}

module.exports = { notFoundHandler, errorHandler };
