/**
 * Pulse AI — Rate Limiting Middleware
 *
 * Different rate limits for different endpoint types:
 * - Auth endpoints: strict (prevent brute force)
 * - Chat endpoints: moderate (prevent abuse)
 * - Admin endpoints: lenient (admin is trusted)
 * - Public endpoints: standard
 */

const rateLimit = require("express-rate-limit");

/**
 * Auth endpoint rate limiter (login, register, early-access signup)
 * 10 requests per 15 minutes per IP — prevents brute force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many attempts. Please try again in 15 minutes." },
  keyGenerator: (req) => req.ip,
});

/**
 * Chat endpoint rate limiter
 * 30 requests per 15 minutes per user — prevents API abuse.
 */
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many messages. Please wait before sending more." },
  keyGenerator: (req) => req.user?.uid || req.ip,
});

/**
 * Admin endpoint rate limiter
 * 60 requests per 15 minutes — admin is trusted but still limited.
 */
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many admin requests. Please wait." },
  keyGenerator: (req) => req.ip,
});

/**
 * General API rate limiter (applied globally in app.js)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many requests. Please try again later." },
});

module.exports = { authLimiter, chatLimiter, adminLimiter, generalLimiter };
