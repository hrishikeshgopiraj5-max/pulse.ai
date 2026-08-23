/**
 * Pulse AI — Early Access Service (PostgreSQL)
 */

const { v4: uuidv4 } = require("uuid");
const { EarlyAccess } = require("../models");
const { ConflictError } = require("../lib/errors");

const EarlyAccessService = {
  async subscribe({ email, source = "website" }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await EarlyAccess.findByEmail(normalizedEmail);
    if (existing) throw new ConflictError("This email is already on the early access list.");

    const entry = await EarlyAccess.create({ id: uuidv4(), email: normalizedEmail, source });
    return { email: entry.email, subscribedAt: entry.subscribed_at };
  },

  async getCount() {
    return EarlyAccess.count();
  },

  async list(page = 1, limit = 50) {
    const result = await EarlyAccess.paginate({ page, limit });
    return {
      data: result.data.map(({ email, source, subscribed_at }) => ({ email, source, subscribedAt: subscribed_at })),
      total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages,
    };
  },
};

module.exports = EarlyAccessService;
