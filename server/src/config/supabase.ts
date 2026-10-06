import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;

if (
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== 'https://your-project.supabase.co'
) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    console.log('[Supabase] Client initialized successfully.');
  } catch (err) {
    console.warn('[Supabase] Failed to initialize client. Falling back to in-memory store:', err);
    supabase = null;
  }
} else {
  console.log('[Supabase] Credentials not configured. Running with in-memory fallback store.');
}

export default supabase;
