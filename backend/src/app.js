/**
 * Pulse AI — Express Application (API Only)
 *
 * Decoupled from frontend. Frontend lives on Vercel, backend on Render.
 * No static file serving — that's Vercel's job.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const routes = require("./routes");
const { requestId } = require("./middleware/requestId");
const { requestLogger } = require("./middleware/requestLogger");
const { sanitize } = require("./middleware/sanitize");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// ─── Trust proxy (Render, Vercel, etc.) ─────────────────────
if (config.IS_PROD) {
  app.set("trust proxy", 1);
}

// ─── Request ID ─────────────────────────────────────────────
app.use(requestId);

// ─── Security Headers ───────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://www.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://openrouter.ai", "https://pulse-ai-*.onrender.com"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// ─── CORS ───────────────────────────────────────────────────
app.use(
  cors({
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-Admin-Key"],
  })
);

// ─── Rate Limiting ──────────────────────────────────────────
app.use(
  "/api",
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { detail: "Too many requests. Please try again later." },
  })
);

// ─── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Input Sanitization ──────────────────────────────────
app.use(sanitize);

// ─── Request Logging ────────────────────────────────────────
app.use(requestLogger);

// ─── API Routes ─────────────────────────────────────────────
app.use("/api", routes);

// ─── Health check at root (for Render) ─────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "pulse-ai-api", version: "0.1.0" });
});

// ─── Error Handling ─────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
