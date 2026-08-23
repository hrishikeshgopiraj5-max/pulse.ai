/**
 * Pulse AI — Early Access Routes (v1)
 */

const { Router } = require("express");
const EarlyAccessController = require("../../controllers/EarlyAccessController");
const { validate } = require("../../middleware/validate");
const { schemas } = require("../../lib/validation");

const router = Router();

router.post("/", validate(schemas.earlyAccess), EarlyAccessController.subscribe);
router.get("/count", EarlyAccessController.count);
router.get("/", EarlyAccessController.list);

module.exports = router;
