/**
 * Pulse AI — Structured Logger
 *
 * Uses pino for high-performance structured logging.
 * Pretty-prints in development, JSON in production.
 */

const pino = require("pino");
const config = require("../config");

const logger = pino({
  level: config.IS_DEV ? "debug" : "info",
  transport: config.IS_DEV
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
    : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ["req.headers.authorization", "password", "token"],
});

module.exports = logger;
