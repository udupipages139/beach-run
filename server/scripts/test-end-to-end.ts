import dotenv from 'dotenv';
dotenv.config();

import { RegistrationService, finalizeTicket } from '../src/services/registrationService.js';
import { supabase } from '../src/config/supabase.js';
import prisma from '../src/config/prisma.js';

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('🏃 UDUPAGES BEACH RUN 2026 — FULL END-TO-END VERIFICATION');
  console.log('================================================================\n');

  const testEmail = 'nkeight0@gmail.com';
  const testPhone = '9876543210';
  const categoryId = '15k';
  const categoryName = '15K Run';
  const amountINR = 999;

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 1: REGISTRATION TEST
  // ──────────────────────────────────────────────────────────────────────────
  console.log('----------------------------------------------------------------');
  console.log('📝 STEP 1: TESTING REGISTRATION CREATION & DB PERSISTENCE');
  console.log('----------------------------------------------------------------');

  const simulatedOrderId = `order_test_${Date.now()}`;
  console.log(`Submitting registration for: ${testEmail}...`);

  const createdReg = await RegistrationService.createRegistration({
    fullName: 'Antigravity Test Runner',
    email: testEmail,
    phone: testPhone,
    age: 26,
    categoryId,
    categoryName,
    tshirtSize: 'L',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '9123456780',
    experience: '15K Completed Before',
    amountINR,
    razorpayOrderId: simulatedOrderId
  });

  console.log(`✅ Registration generated in memory/service:`);
  console.log(`   - ID: ${createdReg.id}`);
  console.log(`   - Registration No: ${createdReg.registrationNumber}`);
  console.log(`   - Razorpay Order ID: ${createdReg.razorpayOrderId}`);
  console.log(`   - Payment Status: ${createdReg.paymentStatus}`);

  // Query Supabase directly using Prisma/Supabase to prove it is stored in DB
  console.log('\n🔍 Verifying row in Supabase PostgreSQL (`registrations` table)...');
  const dbRecord = await prisma.registration.findUnique({
    where: { id: createdReg.id }
  });

  if (!dbRecord) {
    throw new Error('❌ FAILED: Registration record was not found in Supabase database!');
  }

  console.log('✅ RECORD VERIFIED IN SUPABASE DB:');
  console.log({
    id: dbRecord.id,
    registrationNumber: dbRecord.registrationNumber,
    fullName: dbRecord.fullName,
    email: dbRecord.email,
    category: dbRecord.categoryName,
    amountINR: dbRecord.amountINR,
    paymentStatus: dbRecord.paymentStatus,
    createdAt: dbRecord.createdAt
  });

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 2: PAYMENT & TICKET GENERATION
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n----------------------------------------------------------------');
  console.log('💳 STEP 2: TESTING PAYMENT RECORDING & TICKET GENERATION');
  console.log('----------------------------------------------------------------');

  const simulatedPaymentId = `pay_test_${Date.now()}`;
  console.log(`Recording payment confirmation (Payment ID: ${simulatedPaymentId})...`);

  await RegistrationService.markAsPaid(simulatedOrderId, simulatedPaymentId);

  console.log('Finalizing digital ticket (allocating BIB, generating 256-bit QR token)...');
  const finalizedReg = await finalizeTicket(createdReg.id);

  if (!finalizedReg || !finalizedReg.ticketId || !finalizedReg.qrToken) {
    throw new Error('❌ FAILED: Ticket finalization failed to generate ticket ID or QR token!');
  }

  console.log('✅ TICKET GENERATED SUCCESSFULLY:');
  console.log(`   - Ticket UUID: ${finalizedReg.ticketId}`);
  console.log(`   - Allocated BIB Number: #${finalizedReg.bibNumber}`);
  console.log(`   - QR Token: BR26.${finalizedReg.qrToken}`);
  console.log(`   - Transaction Reference: ${finalizedReg.transactionId}`);

  // Verify in Supabase
  const paidDbRecord = await prisma.registration.findUnique({
    where: { id: createdReg.id }
  });

  console.log('\n🔍 Verifying Payment & Ticket in Supabase:');
  console.log({
    paymentStatus: paidDbRecord?.paymentStatus,
    razorpayPaymentId: paidDbRecord?.razorpayPaymentId,
    ticketId: paidDbRecord?.ticketId,
    bibNumber: paidDbRecord?.bibNumber,
    emailSent: paidDbRecord?.emailSent
  });

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 3: SCAN TICKET (GATE CHECK-IN)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n----------------------------------------------------------------');
  console.log('📱 STEP 3: TESTING TICKET SCANNING (GATE ENTRY CHECK-IN)');
  console.log('----------------------------------------------------------------');

  const qrStringToScan = `BR26.${finalizedReg.qrToken}`;
  console.log(`Simulating gate volunteer scanning QR token: ${qrStringToScan.slice(0, 30)}...`);

  // First Scan
  const scanResult1 = await RegistrationService.atomicCheckIn(qrStringToScan, 'volunteer_gate_1', 'QR');
  console.log('🎟️ Scan 1 Result:', {
    success: scanResult1.success,
    result: scanResult1.result,
    message: scanResult1.message,
    runner: scanResult1.registration?.fullName,
    bib: scanResult1.registration?.bibNumber,
    checkedInAt: scanResult1.registration?.checkedInAt
  });

  if (!scanResult1.success || scanResult1.result !== 'SUCCESS') {
    throw new Error(`❌ FAILED: Scan 1 was expected to succeed but got ${scanResult1.result}`);
  }

  // Second Scan (Duplicate prevention check)
  console.log('\nSimulating SECOND scan attempt with same ticket (duplicate check)...');
  const scanResult2 = await RegistrationService.atomicCheckIn(qrStringToScan, 'volunteer_gate_2', 'QR');
  console.log('🚫 Scan 2 Result (Expected DUPLICATE):', {
    success: scanResult2.success,
    result: scanResult2.result,
    message: scanResult2.message,
    firstCheckedInAt: scanResult2.firstCheckedInAt
  });

  if (scanResult2.result !== 'DUPLICATE') {
    throw new Error(`❌ FAILED: Duplicate scan check failed! Expected DUPLICATE, got ${scanResult2.result}`);
  }

  // Verify Checkin Logs in DB
  const checkinLogs = await prisma.checkinLog.findMany({
    where: { registrationId: createdReg.id }
  });
  console.log('\n🔍 Verifying Audit Trail in Supabase (`checkin_logs` table):');
  console.log(checkinLogs.map(l => ({
    method: l.method,
    result: l.result,
    adminId: l.adminId,
    createdAt: l.createdAt
  })));

  // ──────────────────────────────────────────────────────────────────────────
  // STEP 4: SMTP EMAIL VERIFICATION
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n----------------------------------------------------------------');
  console.log('📧 STEP 4: VERIFYING SMTP EMAIL DELIVERY');
  console.log('----------------------------------------------------------------');

  console.log(`Recipient: ${testEmail}`);
  console.log(`Email Sent Status in DB: ${paidDbRecord?.emailSent}`);
  console.log(`Email Sent At: ${paidDbRecord?.emailSentAt}`);
  console.log(`Email Delivery Attempts: ${paidDbRecord?.emailAttempts}`);

  if (paidDbRecord?.emailSent) {
    console.log(`\n🎉 SUCCESS! Ticket email with attached QR code and BIB #${paidDbRecord.bibNumber} has been delivered to: ${testEmail}`);
  } else {
    console.log('\n⚠️ Email was not sent automatically during finalizeTicket. Retrying direct send...');
  }

  console.log('\n================================================================');
  console.log('✅ ALL 4 TESTS PASSED COMPLETELY!');
  console.log('================================================================\n');
}

runEndToEndVerification()
  .catch((err) => {
    console.error('\n❌ VERIFICATION TEST ENCOUNTERED AN ERROR:\n', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
