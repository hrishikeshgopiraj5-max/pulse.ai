/**
 * Pulse AI — OpenRouter AI Client
 *
 * Calls OpenRouter's OpenAI-compatible chat completions API.
 * Handles model fallback silently — the user never sees which model responded.
 * Retries with the next model if one hits rate limits or errors.
 */

const config = require("../config");
const logger = require("./logger");

const SYSTEM_PROMPT = `You are Pulse AI, a healthcare guidance assistant. You help people understand health information, navigate care decisions, and connect with the right healthcare support.

Your rules:
- Provide clear, accessible health information in plain language — no jargon.
- Always clarify that you are not a doctor and cannot diagnose conditions or prescribe medication.
- When a concern sounds serious, urgent, or requires professional evaluation, strongly recommend consulting a qualified healthcare provider.
- For medication questions, provide general information only and recommend speaking with a pharmacist or doctor.
- Never fabricate medical facts. If unsure, say so honestly.
- Be warm, professional, and reassuring without being dismissive of concerns.
- Keep responses concise and actionable.
- Always end with a helpful next step when appropriate.

Important disclaimer: You are an AI information assistant, not a medical professional. Your responses are for educational and informational purposes only.`;

/**
 * Build the messages array for the OpenRouter API.
 * @param {string} userMessage
 * @param {Array} conversationHistory - Optional previous messages [{role, content}]
 * @returns {Array}
 */
function buildMessages(userMessage, conversationHistory = []) {
  const messages = [{ role: "system", content: SYSTEM_PROMPT }];

  // Add conversation history (last 10 messages to stay within context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: userMessage });
  return messages;
}

/**
 * Try a single model call.
 * @param {string} model
 * @param {Array} messages
 * @param {AbortSignal} signal
 * @returns {Promise<{content: string, model: string}|null>}
 */
async function callModel(model, messages, signal) {
  try {
    const response = await fetch(`${config.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pulse-ai.app",
        "X-Title": "Pulse AI",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
      signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown");
      logger.warn({ model, status: response.status, err: errText }, "Model call failed");
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    return { content, model };
  } catch (err) {
    if (err.name === "AbortError") return null;
    logger.warn({ model, err: err.message }, "Model call error");
    return null;
  }
}

/**
 * Send a chat message to OpenRouter with automatic model fallback.
 * The user never sees which model was used.
 *
 * @param {string} userMessage
 * @param {Array} conversationHistory
 * @returns {Promise<{content: string}>}
 */
async function chat(userMessage, conversationHistory = []) {
  if (!config.OPENROUTER_API_KEY) {
    return {
      content:
        "Pulse AI is currently unavailable. The API key has not been configured yet. Please contact the administrator.",
    };
  }

  const messages = buildMessages(userMessage, conversationHistory);

  // Build model list: primary first, then fallbacks
  const models = [config.OPENROUTER_PRIMARY_MODEL, ...config.OPENROUTER_FALLBACK_MODELS];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    for (const model of models) {
      const result = await callModel(model, messages, controller.signal);
      if (result) {
        logger.debug({ model: result.model }, "Model responded successfully");
        return { content: result.content };
      }
      // Brief pause before trying next model
      await new Promise((r) => setTimeout(r, 500));
    }

    // All models failed
    return {
      content:
        "I'm having trouble connecting right now. Please try again in a moment. If this persists, contact support.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { chat, SYSTEM_PROMPT };
