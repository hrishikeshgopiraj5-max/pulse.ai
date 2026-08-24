/**
 * Migration: Create user_health_profiles table
 * Stores personal health data so AI can give personalized responses.
 */

const { query } = require("../../src/lib/database");

async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS user_health_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,

      -- Demographics
      date_of_birth DATE,
      gender VARCHAR(20),
      height_cm DECIMAL(5,1),
      weight_kg DECIMAL(5,1),
      blood_type VARCHAR(5),

      -- Medical conditions
      known_conditions TEXT[],
      past_surgeries TEXT[],
      family_medical_history TEXT[],

      -- Allergies & medications
      allergies TEXT[],
      current_medications JSONB DEFAULT '[]'::jsonb,
      -- Format: [{ name: "Metformin", dosage: "500mg", frequency: "Twice daily" }]

      -- Lifestyle
      smoking_status VARCHAR(20),      -- never, former, current
      alcohol_use VARCHAR(20),         -- never, occasional, regular
      exercise_frequency VARCHAR(30),  -- none, light, moderate, intense
      dietary_restrictions TEXT[],     -- vegetarian, vegan, halal, gluten-free, etc.

      -- Emergency
      emergency_contact_name VARCHAR(255),
      emergency_contact_phone VARCHAR(30),

      -- Metadata
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_health_profile_user ON user_health_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_health_profile_email ON user_health_profiles(email);
  `);

  console.log("✅ user_health_profiles table created");
}

async function down() {
  await query(`DROP TABLE IF EXISTS user_health_profiles`);
  console.log("✅ user_health_profiles table dropped");
}

module.exports = { up, down };

// Run directly: node database/migrations/create_health_profiles.js
if (require.main === module) {
  const path = require("path");
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

  (async () => {
    try {
      await up();
      process.exit(0);
    } catch (err) {
      console.error("Migration failed:", err);
      process.exit(1);
    }
  })();
}
