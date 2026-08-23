/**
 * Pulse AI — Early Access Controller
 *
 * HTTP layer for early access endpoints.
 */

const EarlyAccessService = require("../services/EarlyAccessService");
const AIService = require("../services/AIService");
const { success } = require("../lib/response");
const logger = require("../lib/logger");

const EarlyAccessController = {
  /**
   * POST /api/v1/early-access
   */
  async subscribe(req, res, next) {
    try {
      const result = await EarlyAccessService.subscribe({
        email: req.body.email,
        firebase_uid: req.body.firebase_uid,
        name: req.body.name,
        source: req.body.source,
      });
      logger.info({ email: result.email }, "Early access sign-up");
      res.status(201).json(success("You're on the list! We'll be in touch.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/early-access/status?email=...
   */
  async getStatus(req, res, next) {
    try {
      const result = await EarlyAccessService.getStatus(req.query.email);
      if (!result) {
        return res.status(404).json({ detail: "Email not found." });
      }
      res.json(success("Status retrieved.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/early-access/count
   */
  async count(req, res, next) {
    try {
      const counts = await EarlyAccessService.getCounts();
      res.json({ count: counts.total, counts });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/early-access?page=1&limit=50&status=pending (admin)
   */
  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const status = req.query.status || null;
      const result = await EarlyAccessService.list(page, limit, status);
      res.json(success("Sign-ups retrieved.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/early-access/:id/approve (admin)
   */
  async approve(req, res, next) {
    try {
      const result = await EarlyAccessService.approve(req.params.id, req.body.admin_note);
      logger.info({ id: req.params.id }, "Early access approved");
      res.json(success("User approved.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/early-access/:id/reject (admin)
   */
  async reject(req, res, next) {
    try {
      const result = await EarlyAccessService.reject(req.params.id, req.body.admin_note);
      logger.info({ id: req.params.id }, "Early access rejected");
      res.json(success("User rejected.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/early-access/analytics (admin)
   * Returns chat analytics: topic popularity, query counts, model usage
   */
  analytics(req, res, next) {
    try {
      const data = AIService.getAnalytics();
      res.json(success("Analytics retrieved.", data));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = EarlyAccessController;
