/**
 * Pulse AI — Request Logger
 *
 * Logs method, URL, status code, and response time for every request.
 */

const logger = require("../lib/logger");

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.id,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, "Request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "Client error");
    } else {
      logger.info(logData, "Request handled");
    }
  });

  next();
}

module.exports = { requestLogger };
