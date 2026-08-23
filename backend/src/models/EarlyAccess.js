/**
 * Pulse AI — Early Access Model (PostgreSQL)
 */

const { query } = require("../lib/database");

const EarlyAccess = {
  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM early_access_signups WHERE email = $1", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM early_access_signups WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async findByFirebaseUid(uid) {
    const { rows } = await query("SELECT * FROM early_access_signups WHERE firebase_uid = $1", [uid]);
    return rows[0] || null;
  },

  async create({ id, email, firebase_uid, name, source = "website" }) {
    const { rows } = await query(
      `INSERT INTO early_access_signups (id, email, firebase_uid, name, source, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, email, firebase_uid, name, source, status, email_verified, subscribed_at`,
      [id, email, firebase_uid, name, source]
    );
    return rows[0];
  },

  async updateStatus(id, { status, admin_note, reviewed_at }) {
    const { rows } = await query(
      `UPDATE early_access_signups
       SET status = $1, admin_note = $2, reviewed_at = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, firebase_uid, name, status, admin_note, reviewed_at`,
      [status, admin_note || null, reviewed_at || new Date().toISOString(), id]
    );
    return rows[0] || null;
  },

  async setEmailVerified(email) {
    const { rows } = await query(
      `UPDATE early_access_signups SET email_verified = TRUE, updated_at = NOW()
       WHERE email = $1 RETURNING id, email, email_verified`,
      [email]
    );
    return rows[0] || null;
  },

  async count() {
    const { rows } = await query("SELECT COUNT(*)::int as count FROM early_access_signups");
    return rows[0].count;
  },

  async countByStatus(status) {
    const { rows } = await query(
      "SELECT COUNT(*)::int as count FROM early_access_signups WHERE status = $1",
      [status]
    );
    return rows[0].count;
  },

  async paginate({ page = 1, limit = 50, status = null } = {}) {
    const offset = (page - 1) * limit;
    let dataQuery, countQuery, params;

    if (status) {
      dataQuery = "SELECT * FROM early_access_signups WHERE status = $1 ORDER BY subscribed_at DESC LIMIT $2 OFFSET $3";
      countQuery = "SELECT COUNT(*)::int as count FROM early_access_signups WHERE status = $1";
      params = [status, limit, offset];
    } else {
      dataQuery = "SELECT * FROM early_access_signups ORDER BY subscribed_at DESC LIMIT $1 OFFSET $2";
      countQuery = "SELECT COUNT(*)::int as count FROM early_access_signups";
      params = [limit, offset];
    }

    const { rows: data } = await query(dataQuery, params);
    const { rows } = await query(countQuery, status ? [status] : []);
    const total = rows[0].count;
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};

module.exports = EarlyAccess;
