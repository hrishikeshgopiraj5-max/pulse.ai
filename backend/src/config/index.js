/**
 * Pulse AI — Configuration
 *
 * Loads .env, validates required variables, and exports a frozen config object.
 */

const path = require("node:path");
const fs = require("node:fs");

// Load .env file
const envPath = path.join(__dirname, "..", "..", "..", ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

// ─── Fail fast in production ─────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const required = ["JWT_SECRET", "DATABASE_URL"];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`\n❌ Missing required environment variable: ${key}\n`);
      process.exit(1);
    }
  }
}

const config = Object.freeze({
  // Environment
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  IS_DEV: process.env.NODE_ENV !== "production",

  // Server
  PORT: parseInt(process.env.PORT, 10) || 8000,
  HOST: process.env.HOST || "0.0.0.0",

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Frontend URL (for CORS)
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || "pulse-ai-dev-secret-change-in-production",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:8000", "http://127.0.0.1:3000"],

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || "",

  // Admin
  ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY || "",

  // OpenRouter AI
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || "",
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  OPENROUTER_PRIMARY_MODEL: process.env.OPENROUTER_PRIMARY_MODEL || "deepseek/deepseek-chat-v3-0324:free",
  OPENROUTER_FALLBACK_MODELS: process.env.OPENROUTER_FALLBACK_MODELS
    ? process.env.OPENROUTER_FALLBACK_MODELS.split(",").map((m) => m.trim())
    : ["google/gemma-2-9b-it:free", "mistralai/mistral-7b-instruct:free", "meta-llama/llama-3.1-8b-instruct:free"],
});

module.exports = config;
