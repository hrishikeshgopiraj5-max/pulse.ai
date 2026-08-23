/**
 * Pulse AI — Validation Schemas
 *
 * Lightweight request body validation.
 * Each schema has a validate(body) method returning null on success or an error string.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const schemas = {
  register: {
    fields: ["email", "password"],
    validate(body) {
      const errors = [];

      if (!body.email || !EMAIL_RE.test(body.email)) {
        errors.push("A valid email address is required.");
      }
      if (!body.password || !PASSWORD_RE.test(body.password)) {
        errors.push("Password must be at least 8 characters with at least one letter and one number.");
      }
      if (body.name !== undefined && body.name !== null && typeof body.name !== "string") {
        errors.push("Name must be a string.");
      }

      return errors.length > 0 ? errors.join(" ") : null;
    },
  },

  login: {
    fields: ["email", "password"],
    validate(body) {
      const errors = [];

      if (!body.email || !EMAIL_RE.test(body.email)) {
        errors.push("A valid email address is required.");
      }
      if (!body.password || typeof body.password !== "string") {
        errors.push("Password is required.");
      }

      return errors.length > 0 ? errors.join(" ") : null;
    },
  },

  refresh: {
    fields: ["refreshToken"],
    validate(body) {
      if (!body.refreshToken || typeof body.refreshToken !== "string") {
        return "Refresh token is required.";
      }
      return null;
    },
  },

  earlyAccess: {
    fields: ["email"],
    validate(body) {
      const errors = [];

      if (!body.email || !EMAIL_RE.test(body.email)) {
        errors.push("A valid email address is required.");
      }

      // firebase_uid is optional but if provided, must be a string
      if (body.firebase_uid !== undefined && typeof body.firebase_uid !== "string") {
        errors.push("firebase_uid must be a string.");
      }

      // name is optional but if provided, must be a string and reasonable length
      if (body.name !== undefined && body.name !== null) {
        if (typeof body.name !== "string") {
          errors.push("Name must be a string.");
        } else if (body.name.length > 255) {
          errors.push("Name must be 255 characters or fewer.");
        }
      }

      // source is optional but if provided, must be a known value
      const validSources = ["website", "app", "referral", "other"];
      if (body.source && !validSources.includes(body.source)) {
        errors.push(`Source must be one of: ${validSources.join(", ")}`);
      }

      return errors.length > 0 ? errors.join(" ") : null;
    },
  },

  chat: {
    fields: ["message"],
    validate(body) {
      if (!body.message || typeof body.message !== "string" || body.message.trim().length === 0) {
        return "A message is required.";
      }
      if (body.message.length > 2000) {
        return "Message must be 2000 characters or fewer.";
      }
      return null;
    },
  },
};

module.exports = { schemas };
