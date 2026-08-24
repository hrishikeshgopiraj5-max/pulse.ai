/**
 * Pulse AI — v1 Route Aggregator
 */

const { Router } = require("express");
const authRoutes = require("./auth");
const earlyAccessRoutes = require("./earlyAccess");
const chatRoutes = require("./chat");
const healthProfileRoutes = require("./healthProfile");
const { success } = require("../../lib/response");

const router = Router();

// ─── Health Check ────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json(
    success("Health check passed", {
      service: "pulse-ai",
      version: "0.1.0",
      uptime: `${Math.floor(process.uptime())}s`,
      environment: process.env.NODE_ENV || "development",
    })
  );
});

// ─── Feature Routes ──────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/early-access", earlyAccessRoutes);
router.use("/chat", chatRoutes);
router.use("/health-profile", healthProfileRoutes);

module.exports = router;
