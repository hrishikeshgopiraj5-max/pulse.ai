/**
 * Pulse AI — Auth Routes (v1)
 *
 * Thin route definitions. All logic lives in controllers and services.
 */

const { Router } = require("express");
const AuthController = require("../../controllers/AuthController");
const { authenticate } = require("../../middleware/authenticate");
const { validate } = require("../../middleware/validate");
const { schemas } = require("../../lib/validation");

const router = Router();

router.post("/register", validate(schemas.register), AuthController.register);
router.post("/login", validate(schemas.login), AuthController.login);
router.post("/refresh", validate(schemas.refresh), AuthController.refresh);
router.get("/me", authenticate, AuthController.me);

module.exports = router;
