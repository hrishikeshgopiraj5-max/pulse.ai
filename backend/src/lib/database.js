/**
 * Pulse AI — Database
 *
 * PostgreSQL via `pg`. Compatible with Neon.tech, Supabase, or any Postgres host.
 * When DATABASE_URL is not set (local dev), falls back to in-memory store.
 */

const { Pool } = require("pg");
const config = require("../config");
const logger = require("./logger");

let pool = null;
let useInMemory = false;

// ─── In-memory fallback store ────────────────────────────────
const memoryStore = {};

function memQuery(tableName) {
  if (!memoryStore[tableName]) memoryStore[tableName] = [];
  return memoryStore[tableName];
}

// ─── PostgreSQL Pool ──────────────────────────────────────────

function initPool() {
  if (!config.DATABASE_URL) {
    logger.warn("No DATABASE_URL — using in-memory store (dev mode only)");
    useInMemory = true;
    return null;
  }

  pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: config.IS_PROD ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on("error", (err) => {
    logger.error({ err }, "Unexpected database pool error");
  });

  logger.info("PostgreSQL pool connected");
  return pool;
}

function getPool() {
  if (!pool && !useInMemory) initPool();
  return pool;
}

/**
 * Execute a query. Falls back to in-memory operations when no DB is configured.
 *
 * For in-memory mode, supports simple operations:
 * - "SELECT * FROM x WHERE y = $1" → filter
 * - "INSERT INTO x ..." → push
 * - "SELECT COUNT(*)::int as count FROM x" → length
 * - Everything else → empty result
 */
async function query(text, params = []) {
  // PostgreSQL mode
  if (pool) {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 500) logger.warn({ query: text.slice(0, 100), duration: `${duration}ms` }, "Slow query");
    return result;
  }

  // In-memory fallback for local dev
  return memoryFallback(text, params);
}

function memoryFallback(text, params) {
  const lower = text.toLowerCase().trim();

  // Detect table name
  const tableMatch = lower.match(/from\s+(\w+)|into\s+(\w+)|update\s+(\w+)|delete\s+from\s+(\w+)/);
  const table = tableMatch ? (tableMatch[1] || tableMatch[2] || tableMatch[3] || tableMatch[4]) : null;
  const store = table ? memQuery(table) : [];

  // COUNT
  if (lower.includes("count(*)")) {
    return { rows: [{ count: store.length }], rowCount: store.length };
  }

  // SELECT with WHERE email = $1
  if (lower.startsWith("select") && lower.includes("where")) {
    const field = lower.match(/where\s+(\w+)/)?.[1];
    const value = params[0];
    const rows = field ? store.filter((r) => r[field] === value) : store;
    return { rows, rowCount: rows.length };
  }

  // SELECT all
  if (lower.startsWith("select")) {
    const rows = lower.includes("limit") ? store.slice(0, parseInt(params[0]) || 50) : [...store];
    return { rows, rowCount: rows.length };
  }

  // INSERT
  if (lower.startsWith("insert")) {
    const colsMatch = text.match(/\(([^)]+)\)\s*VALUES/i);
    const cols = colsMatch ? colsMatch[1].split(",").map((c) => c.trim()) : [];
    const record = {};
    cols.forEach((col, i) => { record[col] = params[i]; });
    if (!record.id) record.id = require("uuid").v4();
    if (!record.created_at) record.created_at = new Date().toISOString();
    if (!record.updated_at) record.updated_at = new Date().toISOString();
    store.push(record);
    return { rows: [record], rowCount: 1 };
  }

  // UPDATE
  if (lower.startsWith("update")) {
    const id = params[params.length - 1];
    const idx = store.findIndex((r) => r.id === id);
    if (idx >= 0) {
      const sets = lower.match(/set\s+(.+?)\s+where/i)?.[1] || "";
      const setPairs = sets.split(",").map((s) => s.trim().split("=")[0].trim());
      setPairs.forEach((col, i) => { store[idx][col] = params[i]; });
      store[idx].updated_at = new Date().toISOString();
      return { rows: [store[idx]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // DELETE
  if (lower.startsWith("delete")) {
    const id = params[0];
    const idx = store.findIndex((r) => r.id === id);
    if (idx >= 0) {
      store.splice(idx, 1);
      return { rows: [], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // BEGIN / COMMIT / ROLLBACK — no-op
  if (lower === "begin" || lower === "commit" || lower === "rollback") {
    return { rows: [], rowCount: 0 };
  }

  // RETURNING clause after INSERT — just return the inserted record
  if (lower.includes("returning")) {
    return { rows: store.length ? [store[store.length - 1]] : [], rowCount: store.length ? 1 : 0 };
  }

  return { rows: [], rowCount: 0 };
}

async function getClient() {
  if (pool) return pool.connect();
  // In-memory: return a mock client
  return {
    query: async (text, params) => query(text, params),
    release: () => {},
  };
}

async function closePool() {
  if (pool) {
    await pool.end();
    logger.info("PostgreSQL pool closed");
  }
}

module.exports = { initPool, getPool, query, getClient, closePool };
