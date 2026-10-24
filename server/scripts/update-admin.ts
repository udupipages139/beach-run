import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { supabase } from '../src/config/supabase.js';

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  console.log(`[Admin Update] Hashing password for admin: ${email}...`);
  const passwordHash = await bcrypt.hash(password, 12);

  if (supabase) {
    console.log('[Admin Update] Connecting to Supabase...');
    // Upsert the new admin
    const { error: upsertErr } = await supabase
      .from('admins')
      .upsert({ email, password_hash: passwordHash }, { onConflict: 'email' });

    if (upsertErr) {
      console.warn('[Admin Update] Warning: Could not upsert in Supabase admins table:', upsertErr.message);
    } else {
      console.log(`[Admin Update] ✅ Successfully updated Supabase admins table for ${email}`);
    }

    // Delete old default 'admin' and 'admin@udupipagesrun.com' if present
    const { error: delErr } = await supabase
      .from('admins')
      .delete()
      .in('email', ['admin', 'admin@udupipagesrun.com']);
    
    if (!delErr) {
      console.log('[Admin Update] 🧹 Removed obsolete default admin records from Supabase');
    }
  } else {
    console.log('[Admin Update] Supabase client not active. Env-based auth will be used.');
  }

  console.log('[Admin Update] Done! Ready for login.');
}

main().catch(err => {
  console.error('[Admin Update] Error:', err);
  process.exit(1);
});
