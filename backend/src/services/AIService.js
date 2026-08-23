/**
 * Pulse AI — AI Service (PostgreSQL)
 * Now includes analytics tracking for medical topics.
 */

const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/Chat");
const { chat } = require("../lib/ai");
const { searchKnowledge } = require("../lib/medical-knowledge");
const { NotFoundError } = require("../lib/errors");

// ═══════════════════════════════════════════════════════════
// IN-MEMORY ANALYTICS (persists across requests in same process)
// For production: store in DB or Redis
// ═══════════════════════════════════════════════════════════
const analytics = {
  totalQueries: 0,
  topicCounts: {},    // { "diabetes": 5, "headache": 12, ... }
  hourlyQueries: {},  // { "2026-08-24T14": 3, ... }
  nonMedicalBlocked: 0,
  emergencyDetected: 0,
  modelUsage: {},     // { "deepseek/...": 45, ... }
  recentQueries: [],  // last 50 queries (for admin dashboard)
};

function trackQuery(message, keywords, model, isEmergency) {
  analytics.totalQueries++;

  // Track topics
  keywords.forEach((kw) => {
    analytics.topicCounts[kw] = (analytics.topicCounts[kw] || 0) + 1;
  });

  // Track hourly volume
  const hour = new Date().toISOString().slice(0, 13);
  analytics.hourlyQueries[hour] = (analytics.hourlyQueries[hour] || 0) + 1;

  // Track model usage
  if (model) {
    analytics.modelUsage[model] = (analytics.modelUsage[model] || 0) + 1;
  }

  // Track emergencies
  if (isEmergency) {
    analytics.emergencyDetected++;
  }

  // Track non-medical blocked
  const nonMedicalKeywords = ["code", "weather", "politics", "recipe", "math", "sports", "game", "movie", "song", "joke", "story"];
  if (nonMedicalKeywords.some(kw => message.toLowerCase().includes(kw))) {
    analytics.nonMedicalBlocked++;
  }

  // Store recent queries (keep last 50)
  analytics.recentQueries.unshift({
    message: message.substring(0, 100),
    topics: keywords.slice(0, 5),
    timestamp: new Date().toISOString(),
    emergency: isEmergency,
  });
  if (analytics.recentQueries.length > 50) {
    analytics.recentQueries = analytics.recentQueries.slice(0, 50);
  }
}

function getAnalytics() {
  // Sort topics by count (most popular first)
  const topTopics = Object.entries(analytics.topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([topic, count]) => ({ topic, count }));

  return {
    totalQueries: analytics.totalQueries,
    nonMedicalBlocked: analytics.nonMedicalBlocked,
    emergencyDetected: analytics.emergencyDetected,
    topTopics,
    modelUsage: analytics.modelUsage,
    hourlyQueries: Object.entries(analytics.hourlyQueries)
      .slice(-24)
      .map(([hour, count]) => ({ hour, count })),
    recentQueries: analytics.recentQueries,
  };
}

// ═══════════════════════════════════════════════════════════
// EMERGENCY DETECTION
// ═══════════════════════════════════════════════════════════
function detectEmergency(message) {
  const msg = message.toLowerCase();
  const emergencyPatterns = [
    /chest.*pain.*breath|breath.*chest.*pain|heart.*attack/i,
    /stroke|one.*side.*weak|numb.*one.*side|cant.*speak|slurred.*speech/i,
    /seizure|convuls|fit.*last/i,
    /suicid|want.*die|kill.*myself|end.*life|self.*harm/i,
    /unconscious|cant.*wake|not.*responding/i,
    /severe.*bleed|uncontrol.*bleed|hemorrhag/i,
    /blue.*lips|blue.*nail|cant.*breathe|throat.*clos|tongue.*swell/i,
    /poison|overdose|swallow.*pill|took.*tablets/i,
    /anaphyla|severe.*allergi|swell.*throat|swell.*tongue/i,
    /high.*fever.*rash|fever.*confus|rigid.*belly/i,
    /burn.*face|burn.*hand|burn.*body|severe.*burn/i,
    /blood.*vomit|black.*stool|vomit.*blood/i,
  ];

  return emergencyPatterns.some((pattern) => pattern.test(msg));
}

// ═══════════════════════════════════════════════════════════
// MAIN CHAT SERVICE
// ═══════════════════════════════════════════════════════════
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

    // Build history for AI context (last 12 messages)
    const historyForAI = messages.slice(-12).map(({ role, content }) => ({ role, content }));

    // Search knowledge base for analytics (which topics matched)
    const kbResults = searchKnowledge(message);
    const matchedTopics = kbResults.flatMap((r) => r.matchedKeywords || []);
    const isEmergency = detectEmergency(message);

    // Call AI (model fallback happens silently)
    const { content } = await chat(message, historyForAI);

    // Track analytics
    trackQuery(message, matchedTopics, null, isEmergency);

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

  // Analytics (used by admin dashboard)
  getAnalytics,
};

module.exports = AIService;
