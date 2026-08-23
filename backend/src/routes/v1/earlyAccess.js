/**
 * Pulse AI — Early Access Routes (v1)
 */

const { Router } = require("express");
const EarlyAccessController = require("../../controllers/EarlyAccessController");
const { requireAdmin } = require("../../middleware/adminAuth");

const router = Router();

// Public routes
router.post("/", EarlyAccessController.subscribe);
router.get("/status", EarlyAccessController.getStatus);
router.get("/count", requireAdmin, EarlyAccessController.count);

// Admin routes (protected by admin key)
router.get("/", requireAdmin, EarlyAccessController.list);
router.post("/:id/approve", requireAdmin, EarlyAccessController.approve);
router.post("/:id/reject", requireAdmin, EarlyAccessController.reject);

module.exports = router;
