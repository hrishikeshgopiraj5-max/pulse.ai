/**
 * Pulse AI — Health Profile Routes (v1)
 *
 * All routes require authentication.
 */

const { Router } = require("express");
const HealthProfileController = require("../../controllers/HealthProfileController");
const { authenticate } = require("../../middleware/authenticate");

const router = Router();

// All health profile routes require authentication
router.use(authenticate);

router.get("/", HealthProfileController.getProfile);
router.put("/", HealthProfileController.upsertProfile);
router.delete("/", HealthProfileController.deleteProfile);
router.get("/summary", HealthProfileController.getSummary);

module.exports = router;
