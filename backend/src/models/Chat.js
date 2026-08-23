/**
 * Pulse AI — Chat Model (PostgreSQL)
 *
 * Handles conversations and messages with proper relations.
 */

const { query, getClient } = require("../lib/database");

const Chat = {
  // ─── Conversations ──────────────────────────────────────

  async findByUser(userId) {
    const { rows } = await query(
      `SELECT c.*, COUNT(m.id)::int as message_count
       FROM conversations c
       LEFT JOIN messages m ON m.conversation_id = c.id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.updated_at DESC`,
      [userId]
    );
    return rows;
  },

  async findConversationById(id) {
    const { rows } = await query("SELECT * FROM conversations WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async createConversation({ id, userId, title = "New conversation" }) {
    const { rows } = await query(
      `INSERT INTO conversations (id, user_id, title)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, title]
    );
    return rows[0];
  },

  async updateConversationTitle(id, title) {
    await query(
      `UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2`,
      [title, id]
    );
  },

  async touchConversation(id) {
    await query("UPDATE conversations SET updated_at = NOW() WHERE id = $1", [id]);
  },

  async deleteConversation(id) {
    // Messages cascade-delete via FK constraint
    const { rowCount } = await query("DELETE FROM conversations WHERE id = $1", [id]);
    return rowCount > 0;
  },

  // ─── Messages ───────────────────────────────────────────

  async getMessages(conversationId, limit = 20) {
    const { rows } = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversationId, limit]
    );
    return rows;
  },

  async addMessage(conversationId, { role, content }) {
    const client = await getClient();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `INSERT INTO messages (conversation_id, role, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [conversationId, role, content]
      );

      await client.query(
        "UPDATE conversations SET updated_at = NOW() WHERE id = $1",
        [conversationId]
      );

      await client.query("COMMIT");
      return rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  // ─── Helpers ────────────────────────────────────────────

  async findOrCreateConversation({ id, userId, title }) {
    let conv = await this.findConversationById(id);
    if (!conv || conv.user_id !== userId) {
      conv = await this.createConversation({ id, userId, title });
    }
    return conv;
  },

  async generateTitle(conversationId, firstMessage) {
    const title = firstMessage.length > 80 ? firstMessage.slice(0, 80) + "..." : firstMessage;
    await this.updateConversationTitle(conversationId, title);
  },
};

module.exports = Chat;
