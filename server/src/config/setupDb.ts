import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function runMigration() {
  if (!connectionString) {
    console.error('DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('[PostgreSQL] Connected to Supabase DB successfully.');

    const sql = `
-- 1. Create table if it doesn't already exist
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL,
    tshirt_size TEXT NOT NULL,
    experience TEXT NOT NULL DEFAULT '',
    emergency_contact TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '5K Run',
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    payment_id TEXT,
    order_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    email_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add columns idempotently if missing
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS tshirt_size TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '5K Run';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Alias columns for existing codebase compatibility
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS category_name TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS previous_experience TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- 3. Idempotently add UNIQUE constraint named unique_payment_id on payment_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_payment_id'
    ) THEN
        ALTER TABLE public.registrations 
        ADD CONSTRAINT unique_payment_id UNIQUE (payment_id);
    END IF;
END $$;
    `;

    await client.query(sql);
    console.log('[PostgreSQL] Migration completed successfully.');
    await client.end();
  } catch (err) {
    console.error('[PostgreSQL] Migration error:', err);
    process.exit(1);
  }
}

runMigration();
