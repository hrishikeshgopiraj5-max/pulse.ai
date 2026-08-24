/**
 * Pulse AI — Health Profile Model (PostgreSQL)
 * Stores personal health data for personalized AI responses.
 */

const { query } = require("../lib/database");

const HealthProfile = {
  async findByUserId(userId) {
    const { rows } = await query("SELECT * FROM user_health_profiles WHERE user_id = $1", [userId]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM user_health_profiles WHERE email = $1", [email.toLowerCase().trim()]);
    return rows[0] || null;
  },

  async upsert(userId, email, data) {
    const normalizedEmail = email.toLowerCase().trim();

    const fields = [
      "user_id", "email", "date_of_birth", "gender", "height_cm", "weight_kg",
      "blood_type", "known_conditions", "past_surgeries", "family_medical_history",
      "allergies", "current_medications", "smoking_status", "alcohol_use",
      "exercise_frequency", "dietary_restrictions", "emergency_contact_name",
      "emergency_contact_phone"
    ];

    const values = [
      userId, normalizedEmail,
      data.date_of_birth || null,
      data.gender || null,
      data.height_cm || null,
      data.weight_kg || null,
      data.blood_type || null,
      data.known_conditions || [],
      data.past_surgeries || [],
      data.family_medical_history || [],
      data.allergies || [],
      JSON.stringify(data.current_medications || []),
      data.smoking_status || null,
      data.alcohol_use || null,
      data.exercise_frequency || null,
      data.dietary_restrictions || [],
      data.emergency_contact_name || null,
      data.emergency_contact_phone || null,
    ];

    const setClauses = fields.slice(2).map((f, i) => `${f} = $${i + 3}`);
    const placeholders = fields.map((_, i) => `$${i + 1}`);

    const sql = `
      INSERT INTO user_health_profiles (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT (user_id) DO UPDATE SET
        ${setClauses.join(",\n        ")},
        updated_at = NOW()
      RETURNING *
    `;

    const { rows } = await query(sql, values);
    return rows[0];
  },

  async delete(userId) {
    const { rowCount } = await query("DELETE FROM user_health_profiles WHERE user_id = $1", [userId]);
    return rowCount > 0;
  },

  /**
   * Get a formatted summary string for AI context.
   * This is injected into the AI prompt so it knows the user's health background.
   */
  buildSummary(profile) {
    if (!profile) return null;

    const parts = [];

    if (profile.gender || profile.date_of_birth) {
      const age = profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
      const genderStr = profile.gender || "unspecified";
      parts.push(`Age/Gender: ${age ? age + " years" : "unknown"}, ${genderStr}`);
    }

    if (profile.height_cm && profile.weight_kg) {
      const bmi = (profile.weight_kg / ((profile.height_cm / 100) ** 2)).toFixed(1);
      parts.push(`Height/Weight: ${profile.height_cm}cm, ${profile.weight_kg}kg (BMI: ${bmi})`);
    }

    if (profile.blood_type) {
      parts.push(`Blood type: ${profile.blood_type}`);
    }

    if (profile.known_conditions?.length) {
      parts.push(`Known conditions: ${profile.known_conditions.join(", ")}`);
    }

    if (profile.allergies?.length) {
      parts.push(`Allergies: ${profile.allergies.join(", ")}`);
    }

    if (profile.current_medications?.length) {
      const meds = profile.current_medications.map(m => {
        if (typeof m === 'string') return m;
        return `${m.name}${m.dosage ? ` (${m.dosage})` : ""}${m.frequency ? ` - ${m.frequency}` : ""}`;
      });
      parts.push(`Current medications: ${meds.join(", ")}`);
    }

    if (profile.past_surgeries?.length) {
      parts.push(`Past surgeries: ${profile.past_surgeries.join(", ")}`);
    }

    if (profile.family_medical_history?.length) {
      parts.push(`Family medical history: ${profile.family_medical_history.join(", ")}`);
    }

    if (profile.smoking_status || profile.alcohol_use || profile.exercise_frequency) {
      const lifestyle = [profile.smoking_status, profile.alcohol_use, profile.exercise_frequency].filter(Boolean).join(", ");
      parts.push(`Lifestyle: ${lifestyle}`);
    }

    if (profile.dietary_restrictions?.length) {
      parts.push(`Dietary restrictions: ${profile.dietary_restrictions.join(", ")}`);
    }

    return parts.length > 0 ? parts.join("\n") : null;
  },
};

module.exports = HealthProfile;
