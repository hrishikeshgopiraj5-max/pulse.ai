/**
 * Pulse AI — AI Controller
 *
 * HTTP handlers for chat endpoints.
 */

const AIService = require("../services/AIService");
const { success } = require("../lib/response");
const logger = require("../lib/logger");

const AIController = {
  /**
   * POST /api/v1/chat
   * Send a message (creates new conversation if no conversationId provided).
   */
  async sendMessage(req, res, next) {
    try {
      const { conversationId, message } = req.body;
      const userId = req.user.sub;

      const result = await AIService.sendMessage({
        conversationId,
        userId,
        message,
      });

      logger.debug({ conversationId: result.conversationId }, "Chat message handled");
      res.json(success("Message received.", result));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/chat/conversations
   * List all conversations for the current user.
   */
  async listConversations(req, res, next) {
    try {
      const conversations = AIService.getConversations(req.user.sub);
      res.json(success("Conversations retrieved.", { conversations }));
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/chat/:id
   * Get a specific conversation with full message history.
   */
  async getConversation(req, res, next) {
    try {
      const conversation = AIService.getConversation(req.params.id, req.user.sub);
      res.json(success("Conversation retrieved.", { conversation }));
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/chat/:id
   * Delete a conversation.
   */
  async deleteConversation(req, res, next) {
    try {
      AIService.deleteConversation(req.params.id, req.user.sub);
      res.json(success("Conversation deleted."));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = AIController;
