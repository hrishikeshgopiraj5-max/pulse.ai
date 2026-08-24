-- ============================================================
-- Pulse AI — Migration: Add missing columns to early_access_signups
-- Run this on your production database (Neon/Supabase/Render)
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- Add name column if missing (required by signup flow)
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add status column if missing
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';

-- Add updated_at column if missing
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add email_verified column if missing
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Add admin_note column if missing
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Add reviewed_at column if missing
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Add firebase_uid column if missing
ALTER TABLE early_access_signups
  ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255);

-- Add CHECK constraint if missing
ALTER TABLE early_access_signups
  ADD CONSTRAINT early_access_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_early_access_email ON early_access_signups(email);
CREATE INDEX IF NOT EXISTS idx_early_access_status ON early_access_signups(status);
CREATE INDEX IF NOT EXISTS idx_early_access_firebase_uid ON early_access_signups(firebase_uid);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'early_access_signups'
ORDER BY ordinal_position;
