/**
 * Supabase Database Setup — Udupipages Beach Run 2026
 * Run this once to create the required tables in Supabase SQL Editor
 * or execute via: npx tsx src/config/setupDb.ts
 */
import { supabase } from './supabase.js';

export const SETUP_SQL = `
-- ============================================================
-- Udupipages Beach Run 2026 — Full DB Schema
-- ============================================================

-- Registrations table (primary)
CREATE TABLE IF NOT EXISTS registrations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number     TEXT UNIQUE NOT NULL,
  full_name               TEXT NOT NULL,
  email                   TEXT NOT NULL,
  phone                   TEXT NOT NULL,
  age                     INTEGER NOT NULL,
  category_id             TEXT NOT NULL,
  category_name           TEXT NOT NULL,
  tshirt_size             TEXT NOT NULL DEFAULT 'M',
  experience              TEXT,
  emergency_contact_name  TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  amount_inr              INTEGER NOT NULL DEFAULT 0,

  payment_status          TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','FAILED','REFUNDED')),
  razorpay_order_id       TEXT UNIQUE,
  razorpay_payment_id     TEXT UNIQUE,
  razorpay_signature      TEXT,
  transaction_id          TEXT UNIQUE,
  payment_screenshot_url  TEXT,
  screenshot_uploaded_at  TIMESTAMPTZ,

  ticket_id               UUID UNIQUE,
  qr_token                TEXT UNIQUE,
  bib_number              INTEGER UNIQUE,

  email_sent              BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at           TIMESTAMPTZ,
  email_attempts          INTEGER NOT NULL DEFAULT 0,

  checked_in              BOOLEAN NOT NULL DEFAULT FALSE,
  checked_in_at           TIMESTAMPTZ,
  checked_in_by           TEXT,

  admin_note              TEXT,
  manually_approved       BOOLEAN NOT NULL DEFAULT FALSE,
  manually_approved_by    TEXT,
  manually_approved_at    TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Check-in log (every scan attempt)
CREATE TABLE IF NOT EXISTS checkin_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id  UUID REFERENCES registrations(id) ON DELETE SET NULL,
  scanned_token    TEXT NOT NULL,
  method           TEXT NOT NULL CHECK (method IN ('QR','MANUAL')),
  result           TEXT NOT NULL CHECK (result IN ('SUCCESS','DUPLICATE','INVALID','UNPAID')),
  admin_id         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook event log (idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id TEXT UNIQUE NOT NULL,
  event_type        TEXT NOT NULL,
  payload           JSONB,
  processed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin accounts
CREATE TABLE IF NOT EXISTS admins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BIB counter per category
CREATE TABLE IF NOT EXISTS bib_counters (
  category_id TEXT PRIMARY KEY,
  next_bib    INTEGER NOT NULL DEFAULT 1
);

INSERT INTO bib_counters (category_id, next_bib) VALUES
  ('3k_fun', 1001),
  ('5k',     2001),
  ('10k',    3001),
  ('15k',    4001)
ON CONFLICT (category_id) DO NOTHING;

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_reg_payment_status   ON registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_reg_razorpay_order   ON registrations(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_reg_ticket_id        ON registrations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_reg_qr_token         ON registrations(qr_token);
CREATE INDEX IF NOT EXISTS idx_reg_transaction_id   ON registrations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reg_email            ON registrations(email);
`;

async function runSetup() {
  if (!supabase) {
    console.error('[setupDb] Supabase client not initialized. Check your .env file.');
    process.exit(1);
  }

  console.log('[setupDb] Running Supabase DB schema setup...');
  const { error } = await supabase.rpc('exec_sql', { sql: SETUP_SQL }).select();
  if (error) {
    // Supabase anon key can't run DDL — this is expected; run via SQL editor
    console.warn('[setupDb] Could not run DDL via RPC (expected with anon key).');
    console.log('[setupDb] Please paste the SQL from SETUP_SQL into the Supabase SQL Editor manually.');
    console.log('[setupDb] SQL saved below:\n');
    console.log(SETUP_SQL);
  } else {
    console.log('[setupDb] ✅ Schema applied successfully.');
  }
}

if (process.argv[1]?.endsWith('setupDb.ts') || process.argv[1]?.endsWith('setupDb.js')) {
  runSetup();
}
