/**
 * Pulse AI — Early Access Model (PostgreSQL)
 */

const { query } = require("../lib/database");

const EarlyAccess = {
  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM early_access_signups WHERE email = $1", [email]);
    return rows[0] || null;
  },

  async create({ id, email, source = "website" }) {
    const { rows } = await query(
      `INSERT INTO early_access_signups (id, email, source)
       VALUES ($1, $2, $3)
       RETURNING id, email, source, subscribed_at`,
      [id, email, source]
    );
    return rows[0];
  },

  async count() {
    const { rows } = await query("SELECT COUNT(*)::int as count FROM early_access_signups");
    return rows[0].count;
  },

  async paginate({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const { rows: data } = await query(
      "SELECT * FROM early_access_signups ORDER BY subscribed_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    const { rows } = await query("SELECT COUNT(*)::int as count FROM early_access_signups");
    const total = rows[0].count;
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};

module.exports = EarlyAccess;
