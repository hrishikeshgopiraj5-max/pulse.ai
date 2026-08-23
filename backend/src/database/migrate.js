/**
 * Pulse AI — Database Migration
 *
 * Reads database/schema.sql and applies it to the connected PostgreSQL database.
 * Run with: npm run db:migrate
 * Reset with: npm run db:reset
 */

const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");

// Load .env
require("dotenv").config({ path: path.join(__dirname, "..", "..", "..", ".env") });

const schemaPath = path.join(__dirname, "..", "..", "..", "database", "schema.sql");

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ No DATABASE_URL found. Set it in your .env file.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    const isReset = process.argv.includes("--reset");

    if (isReset) {
      console.log("⚠️  Dropping all tables...");
      await client.query(`
        DROP TABLE IF EXISTS messages CASCADE;
        DROP TABLE IF EXISTS conversations CASCADE;
        DROP TABLE IF EXISTS early_access_signups CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
      `);
      console.log("✅ Tables dropped.");
    }

    console.log("📦 Running migrations...");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    await client.query(schema);
    console.log("✅ Migrations complete.");

    // Verify
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `);
    console.log("\n📋 Tables:", rows.map((r) => r.table_name).join(", "));
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
