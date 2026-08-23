/**
 * Pulse AI — User Model (PostgreSQL)
 */

const { query } = require("../lib/database");

const User = {
  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async create({ id, email, name, password_hash }) {
    const { rows } = await query(
      `INSERT INTO users (id, email, name, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, created_at, updated_at`,
      [id, email, name || null, password_hash]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await query("SELECT id, email, name, created_at FROM users ORDER BY created_at DESC");
    return rows;
  },

  async deleteById(id) {
    const { rowCount } = await query("DELETE FROM users WHERE id = $1", [id]);
    return rowCount > 0;
  },
};

module.exports = User;
