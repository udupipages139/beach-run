import dotenv from 'dotenv';
dotenv.config();
import { supabase } from '../src/config/supabase.js';

async function main() {
  console.log('Testing Supabase & Registrations...');
  if (!supabase) {
    console.log('Supabase is not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY.');
    return;
  }
  const { data, error, count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Supabase query error:', error);
  } else {
    console.log(`\n=== REGISTRATIONS IN DATABASE ===`);
    console.log(`Total count in 'registrations' table: ${count}`);
    if (data && data.length > 0) {
      console.log('First 5 records:');
      data.slice(0, 5).forEach((r, idx) => {
        console.log(`${idx + 1}. [${r.registration_number}] ${r.full_name} | ${r.email} | Status: ${r.payment_status} | Cat: ${r.category_id} | Amount: Rs.${r.amount_inr}`);
      });
    } else {
      console.log('Table is currently empty.');
    }
  }
}

main().catch(console.error);
