/**
 * Pulse AI — Early Access Service (PostgreSQL)
 */

const { v4: uuidv4 } = require("uuid");
const { EarlyAccess } = require("../models");
const { ConflictError, NotFoundError } = require("../lib/errors");

const EarlyAccessService = {
  async subscribe({ email, firebase_uid, name, source = "website" }) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await EarlyAccess.findByEmail(normalizedEmail);
    if (existing) {
      // If already exists, return existing entry (allow re-submission)
      return {
        id: existing.id,
        email: existing.email,
        status: existing.status,
        subscribedAt: existing.subscribed_at,
      };
    }

    const entry = await EarlyAccess.create({
      id: uuidv4(),
      email: normalizedEmail,
      firebase_uid: firebase_uid || null,
      name: name || null,
      source,
    });
    return { id: entry.id, email: entry.email, status: entry.status, subscribedAt: entry.subscribed_at };
  },

  async getStatus(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const entry = await EarlyAccess.findByEmail(normalizedEmail);
    if (!entry) return null;
    return {
      id: entry.id,
      email: entry.email,
      status: entry.status,
      emailVerified: entry.email_verified,
      subscribedAt: entry.subscribed_at,
      reviewedAt: entry.reviewed_at,
    };
  },

  async getStatusById(id) {
    const entry = await EarlyAccess.findById(id);
    if (!entry) return null;
    return {
      id: entry.id,
      email: entry.email,
      name: entry.name,
      status: entry.status,
    };
  },

  async approve(id, admin_note) {
    const entry = await EarlyAccess.findById(id);
    if (!entry) throw new NotFoundError("Sign-up not found.");
    if (entry.status === "approved") return { alreadyApproved: true };

    const updated = await EarlyAccess.updateStatus(id, {
      status: "approved",
      admin_note: admin_note || "Approved by admin",
      reviewed_at: new Date().toISOString(),
    });
    return updated;
  },

  async reject(id, admin_note) {
    const entry = await EarlyAccess.findById(id);
    if (!entry) throw new NotFoundError("Sign-up not found.");
    if (entry.status === "rejected") return { alreadyRejected: true };

    const updated = await EarlyAccess.updateStatus(id, {
      status: "rejected",
      admin_note: admin_note || "Rejected by admin",
      reviewed_at: new Date().toISOString(),
    });
    return updated;
  },

  async getCount() {
    return EarlyAccess.count();
  },

  async getCounts() {
    const total = await EarlyAccess.count();
    const pending = await EarlyAccess.countByStatus("pending");
    const approved = await EarlyAccess.countByStatus("approved");
    const rejected = await EarlyAccess.countByStatus("rejected");
    return { total, pending, approved, rejected };
  },

  async list(page = 1, limit = 50, status = null) {
    const result = await EarlyAccess.paginate({ page, limit, status });
    return {
      data: result.data.map((r) => ({
        id: r.id,
        email: r.email,
        firebase_uid: r.firebase_uid,
        name: r.name,
        source: r.source,
        status: r.status,
        emailVerified: r.email_verified,
        adminNote: r.admin_note,
        subscribedAt: r.subscribed_at,
        reviewedAt: r.reviewed_at,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  },
};

module.exports = EarlyAccessService;
