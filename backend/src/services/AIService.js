/**
 * Pulse AI — AI Service (PostgreSQL)
 */

const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/Chat");
const { chat } = require("../lib/ai");
const { NotFoundError } = require("../lib/errors");

const AIService = {
  async sendMessage({ conversationId, userId, message }) {
    const conversation = await Chat.findOrCreateConversation({
      id: conversationId || uuidv4(),
      userId,
    });

    // Save user message
    await Chat.addMessage(conversation.id, { role: "user", content: message });

    // Auto-generate title from first message
    const messages = await Chat.getMessages(conversation.id);
    if (messages.length === 1) {
      await Chat.generateTitle(conversation.id, message);
    }

    // Build history for AI context (last 10 messages)
    const historyForAI = messages.slice(-10).map(({ role, content }) => ({ role, content }));

    // Call AI (model fallback happens silently)
    const { content } = await chat(message, historyForAI);

    // Save assistant reply
    await Chat.addMessage(conversation.id, { role: "assistant", content });

    return {
      conversationId: conversation.id,
      message: { role: "assistant", content, timestamp: new Date().toISOString() },
    };
  },

  async getConversations(userId) {
    const conversations = await Chat.findByUser(userId);
    return conversations.map((c) => ({
      id: c.id, title: c.title, messageCount: c.message_count,
      createdAt: c.created_at, updatedAt: c.updated_at,
    }));
  },

  async getConversation(conversationId, userId) {
    const conv = await Chat.findConversationById(conversationId);
    if (!conv || conv.user_id !== userId) throw new NotFoundError("Conversation not found.");

    const messages = await Chat.getMessages(conversationId);
    return {
      id: conv.id, title: conv.title, messages,
      createdAt: conv.created_at, updatedAt: conv.updated_at,
    };
  },

  async deleteConversation(conversationId, userId) {
    const conv = await Chat.findConversationById(conversationId);
    if (!conv || conv.user_id !== userId) throw new NotFoundError("Conversation not found.");
    await Chat.deleteConversation(conversationId);
  },
};

module.exports = AIService;
