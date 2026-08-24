/**
 * Pulse AI — Chat Routes (v1)
 *
 * All chat endpoints require backend JWT authentication.
 * JWT is issued via /auth/firebase-session after Firebase login + approval check.
 */

const { Router } = require("express");
const AIController = require("../../controllers/AIController");
const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { schemas } = require("../../lib/validation");
const { chatLimiter } = require("../../middleware/rateLimit");

const router = Router();

// All chat routes require backend JWT auth
router.use(authenticate);
router.use(chatLimiter);

router.post("/", validate(schemas.chat), AIController.sendMessage);
router.get("/conversations", AIController.listConversations);
router.get("/:id", AIController.getConversation);
router.delete("/:id", AIController.deleteConversation);

module.exports = router;
