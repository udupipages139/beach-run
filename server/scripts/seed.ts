/**
 * Seed Script — creates 5 PAID + 1 PENDING test registrations
 * Usage: npx tsx scripts/seed.ts
 */
import dotenv from 'dotenv';
dotenv.config();

import { randomUUID, randomBytes } from 'crypto';
import { supabase } from '../src/config/supabase.js';
import { RegistrationService, finalizeTicket, generateQRBuffer } from '../src/services/registrationService.js';
import bcrypt from 'bcrypt';

const PAID_RUNNERS = [
  { fullName: 'Ramesh Bhat', email: 'ramesh.bhat@example.com', phone: '9876543210', age: 28, categoryId: '5k', categoryName: '5K Run', tshirtSize: 'M', experience: '5K / 10K Completed Before', emergencyContactName: 'Suma Bhat', emergencyContactPhone: '9876543211', amountINR: 599 },
  { fullName: 'Priya Shetty', email: 'priya.shetty@example.com', phone: '9845021234', age: 22, categoryId: '10k', categoryName: '10K Run', tshirtSize: 'S', experience: 'Half Marathon (21K) / 15K Completed', emergencyContactName: 'Raju Shetty', emergencyContactPhone: '9845021235', amountINR: 799 },
  { fullName: 'Arjun Kamath', email: 'arjun.kamath@example.com', phone: '9980012345', age: 35, categoryId: '15k', categoryName: '15K Run', tshirtSize: 'L', experience: 'Full Marathon / Experienced Runner', emergencyContactName: 'Deepa Kamath', emergencyContactPhone: '9980012346', amountINR: 999 },
  { fullName: 'Sneha Rao', email: 'sneha.rao@example.com', phone: '8123456789', age: 19, categoryId: '5k', categoryName: '5K Run', tshirtSize: 'XS', experience: 'First Time Runner (Beginner)', emergencyContactName: 'Mohan Rao', emergencyContactPhone: '8123456790', amountINR: 599 },
  { fullName: 'Venkat Nayak', email: 'venkat.nayak@example.com', phone: '7890123456', age: 42, categoryId: '3k_fun', categoryName: '3K Fun Run', tshirtSize: 'XL', experience: '5K / 10K Completed Before', emergencyContactName: 'Shanti Nayak', emergencyContactPhone: '7890123457', amountINR: 399 }
];

const PENDING_RUNNER = {
  fullName: 'Kiran D\'Souza', email: 'kiran.dsouza@example.com', phone: '9741234567', age: 25, categoryId: '10k', categoryName: '10K Run', tshirtSize: 'M', experience: '5K / 10K Completed Before', emergencyContactName: 'Mary DSouza', emergencyContactPhone: '9741234568', amountINR: 799
};

async function seedAdmin() {
  if (!supabase) {
    console.log('[Seed] Supabase not connected. Skipping admin seed.');
    return;
  }

  const email = (process.env.ADMIN_EMAIL || 'admin@udupipagesrun.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from('admins')
    .upsert({ email, password_hash: passwordHash }, { onConflict: 'email' });

  if (error) {
    console.warn('[Seed] Admin upsert error:', error.message);
  } else {
    console.log(`[Seed] ✅ Admin seeded: ${email}`);
  }
}

async function seedRegistrations() {
  console.log('\n[Seed] Seeding 5 PAID registrations...');

  for (const runner of PAID_RUNNERS) {
    try {
      const orderId = `order_seed_${randomUUID().slice(0, 8)}`;
      const paymentId = `pay_seed_${randomUUID().slice(0, 10)}`;

      const reg = await RegistrationService.createRegistration({
        ...runner,
        razorpayOrderId: orderId
      });

      await RegistrationService.markAsPaid(orderId, paymentId);
      await finalizeTicket(reg.id);

      // Refetch
      const updated = await RegistrationService.findById(reg.id);
      console.log(`  ✅ ${runner.fullName} | ${runner.categoryName} | Bib #${updated?.bibNumber} | Token: BR26.${updated?.qrToken?.slice(0, 12)}...`);
    } catch (e: any) {
      console.error(`  ❌ Failed to seed ${runner.fullName}:`, e.message);
    }
  }

  console.log('\n[Seed] Seeding 1 PENDING registration...');
  try {
    const orderId = `order_pending_${randomUUID().slice(0, 8)}`;
    const reg = await RegistrationService.createRegistration({
      ...PENDING_RUNNER,
      razorpayOrderId: orderId
    });
    console.log(`  ✅ ${PENDING_RUNNER.fullName} | PENDING | ID: ${reg.id}`);
  } catch (e: any) {
    console.error(`  ❌ Failed to seed PENDING:`, e.message);
  }
}

async function main() {
  console.log('=== UBR2026 Seed Script ===\n');
  await seedAdmin();
  await seedRegistrations();
  console.log('\n[Seed] ✅ Done! You can now test the admin scanner with these records.\n');
  process.exit(0);
}

main().catch(e => {
  console.error('[Seed] Fatal error:', e);
  process.exit(1);
});
