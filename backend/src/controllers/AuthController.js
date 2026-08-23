/**
 * Pulse AI — Auth Controller
 *
 * HTTP layer — receives requests, delegates to AuthService, sends responses.
 * Controllers contain ZERO business logic.
 */

const AuthService = require("../services/AuthService");
const { success } = require("../lib/response");
const logger = require("../lib/logger");

const AuthController = {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      logger.info({ userId: result.user.id }, "User registered");
      res.status(201).json(success("Account created successfully.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      logger.info({ userId: result.user.id }, "User logged in");
      res.json(success("Login successful.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/auth/refresh
   */
  refresh(req, res, next) {
    try {
      const result = AuthService.refresh(req.body.refreshToken);
      res.json(success("Tokens refreshed.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/auth/me (protected)
   */
  me(req, res, next) {
    try {
      const profile = AuthService.getProfile(req.user.sub);
      res.json(success("Profile retrieved.", { user: profile }));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AuthController;
