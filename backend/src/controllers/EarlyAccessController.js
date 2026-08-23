/**
 * Pulse AI — Early Access Controller
 *
 * HTTP layer for early access endpoints.
 */

const EarlyAccessService = require("../services/EarlyAccessService");
const { success } = require("../lib/response");
const logger = require("../lib/logger");

const EarlyAccessController = {
  /**
   * POST /api/v1/early-access
   */
  subscribe(req, res, next) {
    try {
      const result = EarlyAccessService.subscribe({
        email: req.body.email,
        source: req.body.source,
      });
      logger.info({ email: result.email }, "Early access sign-up");
      res.status(201).json(success("You're on the list! We'll be in touch.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/early-access/count
   */
  count(req, res, next) {
    try {
      const count = EarlyAccessService.getCount();
      res.json({ count });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/early-access?page=1&limit=50 (admin)
   */
  list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 50;
      const result = EarlyAccessService.list(page, limit);
      res.json(success("Sign-ups retrieved.", result));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = EarlyAccessController;
