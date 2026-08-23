/**
 * Pulse AI — Server Entry Point
 */

const app = require("./app");
const config = require("./config");
const logger = require("./lib/logger");
const { initPool, closePool } = require("./lib/database");

// Initialize database connection pool
initPool();

const server = app.listen(config.PORT, config.HOST, () => {
  logger.info(`
  ┌─────────────────────────────────────────────┐
  │                                             │
  │   ⚡ Pulse AI API running                   │
  │                                             │
  │   → Local:   http://${config.HOST}:${config.PORT}          │
  │   → API:     http://${config.HOST}:${config.PORT}/api      │
  │   → Health:  http://${config.HOST}:${config.PORT}/api/v1/health│
  │   → Env:     ${config.NODE_ENV.padEnd(28)}│
  │   → DB:      ${config.DATABASE_URL ? "PostgreSQL" : "No DB (dev mode)".padEnd(28)}│
  │                                             │
  └─────────────────────────────────────────────┘
  `);
});

// ─── Graceful Shutdown ──────────────────────────────────────
async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    await closePool();
    process.exit(0);
  });
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});
process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception. Exiting.");
  process.exit(1);
});
