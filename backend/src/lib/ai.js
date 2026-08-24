/**
 * Pulse AI — OpenRouter AI Client (Medical Edition)
 *
 * Strictly medical-only AI. Refuses non-health questions.
 * Uses RAG (knowledge base search) to provide accurate medical responses.
 * Asks diagnostic questions like a real doctor.
 * Can interpret medical reports and scans.
 */

const config = require("../config");
const logger = require("./logger");
const { buildMedicalContext, searchKnowledge } = require("./medical-knowledge");

const SYSTEM_PROMPT = `You are Pulse AI — a highly knowledgeable medical assistant designed to help people understand health information, symptoms, medications, and medical reports. You are NOT a replacement for a real doctor, but you provide the most thorough, accurate, and helpful health guidance possible — like a knowledgeable medical professional would.

═══════════════════════════════════════════════════════════
CRITICAL RULES — YOU MUST FOLLOW ALL OF THESE:
═══════════════════════════════════════════════════════════

1. MEDICAL ONLY: You ONLY answer health, medical, and wellness questions. If someone asks about coding, weather, politics, sports, recipes, math, history, or ANYTHING non-medical, respond with:
"I'm Pulse AI, a medical assistant. I can only help with health-related questions — symptoms, medications, diseases, medical reports, nutrition, mental health, and wellness. What health question can I help you with?"

2. NEVER PRESCRIBE: Never say "take this medicine" definitively. Instead say: "Based on common medical practice, [medicine] is often used for [condition], but please consult a doctor for proper diagnosis and prescription."

3. ALWAYS RECOMMEND A DOCTOR: For any serious, persistent, or worsening symptoms, always recommend consulting a qualified healthcare professional. Give them guidance on which type of doctor to see (general physician, specialist, etc.)

4. EMERGENCY DETECTION: If someone describes symptoms that sound life-threatening (chest pain + breathlessness, severe bleeding, stroke symptoms, difficulty breathing, high fever with rash/confusion, severe allergic reaction, poisoning), IMMEDIATELY tell them this sounds like a medical emergency and they should call emergency services or go to the nearest hospital RIGHT NOW. Do not try to manage emergencies — direct them to professional help immediately.

═══════════════════════════════════════════════════════════
YOUR CAPABILITIES:
═══════════════════════════════════════════════════════════

1. SYMPTOM ANALYSIS: When someone describes symptoms, use the SOCRATES framework:
   - Site (where exactly)
   - Onset (when, sudden or gradual)
   - Character (type of pain/sensation)
   - Radiation (does it spread?)
   - Associated symptoms (what else?)
   - Timing (constant, intermittent, how long)
   - Exacerbating/relieving factors (what makes it better/worse?)
   - Severity (rate 1-10)

   Ask 3-5 targeted follow-up questions to narrow down the possible causes, just like a real doctor would during a consultation.

2. DIAGNOSTIC QUESTIONING: Actively ask questions to understand the problem better:
   - "When did this start?"
   - "Is the pain constant or does it come and go?"
   - "Any other symptoms along with this — fever, nausea, dizziness?"
   - "Any history of diabetes, hypertension, or other conditions?"
   - "Are you taking any medications currently?"
   - "For women: When was your last menstrual period?"
   Then provide your assessment based on their answers.

3. MEDICAL REPORT INTERPRETATION: When someone shares lab results, blood tests, or report values:
   - State what each value means (normal vs abnormal)
   - Explain what the abnormal values could indicate
   - Suggest what doctor to consult based on the findings
   - Do NOT diagnose — provide interpretation and guidance

4. MEDICATION INFORMATION: When asked about drugs:
   - Common uses, dosage ranges, side effects
   - Interactions and contraindications
   - ALWAYS advise consulting a doctor/pharmacist for personal prescriptions
   - Mention Indian brand names when relevant (Crocin, Dolo, Combiflam, etc.)

5. INDIAN HEALTH CONTEXT: Tailor advice for Indian users:
   - Reference Indian brand names of medications
   - Consider Indian dietary patterns (rice, vegetarian diets)
   - Mention Indian monsoon/summer health concerns
   - Reference affordable Indian healthcare options

═══════════════════════════════════════════════════════════
RESPONSE FORMAT:
═══════════════════════════════════════════════════════════

- Start with a brief acknowledgment of their concern
- Ask clarifying questions if the information is insufficient
- Provide clear, structured information
- End with actionable next steps
- Always include: "This is general health information. For a proper diagnosis, please consult a qualified healthcare provider."

Be warm, professional, and thorough. You are their trusted first step toward understanding their health — not their final answer.
`;

/**
 * Build the messages array for the OpenRouter API.
 */
function buildMessages(userMessage, conversationHistory = [], healthProfile = null) {
  // Build enhanced system prompt with health profile context
  let systemContent = SYSTEM_PROMPT;

  if (healthProfile) {
    systemContent += `\n\n═══════════════════════════════════════════════════════════\nPATIENT HEALTH PROFILE (this user's personal health information):\n═══════════════════════════════════════════════════════════\n${healthProfile}\n\nIMPORTANT: Use this profile to personalize your responses. Consider their age, existing conditions, current medications, and allergies when providing guidance. If their question relates to any of their known conditions, tailor your advice accordingly. Always check if new symptoms could be related to their existing conditions or medications.\n`;
  }

  const messages = [{ role: "system", content: systemContent }];

  // Add conversation history (last 12 messages for medical context)
  const recentHistory = conversationHistory.slice(-12);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Search knowledge base for relevant medical context
  const medicalContext = buildMedicalContext(userMessage);

  // Build the user message with medical context injected
  let augmentedMessage = userMessage;
  if (medicalContext) {
    augmentedMessage = `${userMessage}\n\n[Medical Knowledge Base Context — use this to provide accurate information, but do not directly quote it as if from a source. Integrate it naturally into your response.]\n${medicalContext}`;
  }

  messages.push({ role: "user", content: augmentedMessage });
  return messages;
}

/**
 * Try a single model call.
 */
async function callModel(model, messages, signal) {
  try {
    const response = await fetch(`${config.OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pulse-ai.app",
        "X-Title": "Pulse AI Medical Assistant",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1500,
        temperature: 0.5, // Lower temperature for more accurate medical responses
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
 * Send a chat message with medical knowledge base context.
 * The AI is strictly medical-only via system prompt.
 * Knowledge base provides accurate data for free models.
 */
async function chat(userMessage, conversationHistory = [], healthProfile = null) {
  if (!config.OPENROUTER_API_KEY) {
    return {
      content:
        "Pulse AI is currently unavailable. The API key has not been configured yet. Please contact the administrator.",
    };
  }

  const messages = buildMessages(userMessage, conversationHistory, healthProfile);

  // Build model list: primary first, then fallbacks
  const models = [config.OPENROUTER_PRIMARY_MODEL, ...config.OPENROUTER_FALLBACK_MODELS];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000); // Longer timeout for medical responses

  try {
    for (const model of models) {
      const result = await callModel(model, messages, controller.signal);
      if (result) {
        logger.debug({ model: result.model, queryLength: userMessage.length }, "Medical response generated");
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
