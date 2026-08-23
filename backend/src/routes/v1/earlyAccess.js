/**
 * Pulse AI — Early Access Routes (v1)
 */

const { Router } = require("express");
const EarlyAccessController = require("../../controllers/EarlyAccessController");
const { requireAdmin } = require("../../middleware/adminAuth");
const { authLimiter, adminLimiter } = require("../../middleware/rateLimit");
const { validate } = require("../../middleware/validate");
const { schemas } = require("../../lib/validation");

const router = Router();

// Public routes (rate limited + validated)
router.post("/", authLimiter, validate(schemas.earlyAccess), EarlyAccessController.subscribe);
router.get("/status", EarlyAccessController.getStatus);

// Admin verify (validates key before showing dashboard)
router.get("/admin/verify", requireAdmin, EarlyAccessController.verifyAdmin);
router.get("/count", requireAdmin, adminLimiter, EarlyAccessController.count);

// Admin routes (protected by admin key + rate limited)
router.get("/", requireAdmin, adminLimiter, EarlyAccessController.list);
router.post("/:id/approve", requireAdmin, adminLimiter, EarlyAccessController.approve);
router.post("/:id/reject", requireAdmin, adminLimiter, EarlyAccessController.reject);
router.get("/analytics", requireAdmin, adminLimiter, EarlyAccessController.analytics);

module.exports = router;
