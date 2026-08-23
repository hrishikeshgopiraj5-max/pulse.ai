/**
 * Pulse AI — Chat Routes (v1)
 *
 * All chat endpoints require Firebase authentication.
 */

const { Router } = require("express");
const AIController = require("../../controllers/AIController");
const { requireAuth } = require("../../middleware/firebaseAuth");
const { validate } = require("../../middleware/validate");
const { schemas } = require("../../lib/validation");

const router = Router();

// All chat routes require Firebase auth
router.use(requireAuth);

router.post("/", validate(schemas.chat), AIController.sendMessage);
router.get("/conversations", AIController.listConversations);
router.get("/:id", AIController.getConversation);
router.delete("/:id", AIController.deleteConversation);

module.exports = router;
