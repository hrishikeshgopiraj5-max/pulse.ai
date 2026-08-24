/**
 * Pulse AI — Health Profile Controller
 * HTTP handlers for user health profile endpoints.
 */

const { HealthProfile } = require("../models");
const { success } = require("../lib/response");
const logger = require("../lib/logger");

const HealthProfileController = {
  /**
   * GET /api/v1/health-profile
   * Get the current user's health profile.
   */
  async getProfile(req, res, next) {
    try {
      const profile = await HealthProfile.findByUserId(req.user.sub);
      if (!profile) {
        return res.json(success("No health profile found.", { profile: null }));
      }
      res.json(success("Health profile retrieved.", { profile }));
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/health-profile
   * Create or update the current user's health profile.
   */
  async upsertProfile(req, res, next) {
    try {
      const profile = await HealthProfile.upsert(req.user.sub, req.user.email, req.body);
      logger.info({ userId: req.user.sub }, "Health profile saved");
      res.json(success("Health profile saved.", { profile }));
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/health-profile
   * Delete the current user's health profile.
   */
  async deleteProfile(req, res, next) {
    try {
      const deleted = await HealthProfile.delete(req.user.sub);
      if (!deleted) {
        return res.json(success("No profile to delete."));
      }
      logger.info({ userId: req.user.sub }, "Health profile deleted");
      res.json(success("Health profile deleted."));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/health-profile/summary
   * Get a formatted text summary of the profile for AI context.
   * Used internally by the chat service.
   */
  async getSummary(req, res, next) {
    try {
      const profile = await HealthProfile.findByUserId(req.user.sub);
      const summary = HealthProfile.buildSummary(profile);
      res.json(success("Profile summary.", { summary, hasProfile: !!profile }));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = HealthProfileController;
