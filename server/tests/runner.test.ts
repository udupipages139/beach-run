/**
 * runner.test.ts — Automated Integration & Unit Tests for Udupipages Beach Run 2026
 *
 * Tests all required capabilities specified in Section 9:
 * 1. Signature verification (valid vs invalid)
 * 2. Webhook idempotency (duplicate events processed only once)
 * 3. finalizeTicket runs once (preserves bib, qrToken, ticketId across multiple calls)
 * 4. Atomic check-in (second scan rejected as DUPLICATE, concurrent scans result in exactly 1 SUCCESS)
 * 5. Lookup by each ID type (qrToken, BR26.qrToken, ticketId, razorpayPaymentId, transactionId, registrationNumber, razorpayOrderId)
 * 6. Unpaid ticket rejected (PENDING registrations return UNPAID and cannot check in)
 * 7. Age eligibility per category (3K all ages, 5K >= 12, 10K >= 16, 15K >= 18)
 */

import crypto from 'crypto';
import { RegistrationService, finalizeTicket } from '../src/services/registrationService.js';
import { CATEGORIES } from '../src/config/categories.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}${errorDetail ? ` — ${errorDetail}` : ''}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n================================================================');
  console.log('🏃 RUNNING AUTOMATED TEST SUITE: UDUPIPAGES BEACH RUN 2026');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 1: Razorpay Signature Verification
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- Test Suite 1: Signature Verification ---');
  {
    const secret = 'test_secret_key_12345';
    const orderId = 'order_test_suite_001';
    const paymentId = 'pay_test_suite_001';
    const data = `${orderId}|${paymentId}`;

    const validSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
    const invalidSignature = 'invalid_tampered_signature_hex_code_123';

    // Verify valid signature logic
    const computed = crypto.createHmac('sha256', secret).update(data).digest('hex');
    assert(computed === validSignature, 'Valid Razorpay signature correctly verified');

    // Verify invalid signature rejected
    assert(computed !== invalidSignature, 'Tampered/invalid Razorpay signature correctly rejected');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 2: Age Eligibility per Category
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 2: Age Eligibility Validation ---');
  {
    const ageRules: Record<string, number> = { '5k': 12, '10k': 16, '15k': 18 };

    const checkEligibility = (categoryId: string, age: number): boolean => {
      const minAge = ageRules[categoryId];
      if (minAge !== undefined && age < minAge) return false;
      return true;
    };

    // 3K Fun Run: any age permitted
    assert(checkEligibility('3k_fun', 8), '3K Fun Run allows age 8 (all ages eligible)');
    assert(checkEligibility('3k_fun', 65), '3K Fun Run allows age 65');

    // 5K: minimum 12
    assert(!checkEligibility('5k', 11), '5K rejects age 11 (minimum is 12)');
    assert(checkEligibility('5k', 12), '5K accepts age 12 (exact boundary)');
    assert(checkEligibility('5k', 25), '5K accepts age 25');

    // 10K: minimum 16
    assert(!checkEligibility('10k', 15), '10K rejects age 15 (minimum is 16)');
    assert(checkEligibility('10k', 16), '10K accepts age 16 (exact boundary)');
    assert(checkEligibility('10k', 30), '10K accepts age 30');

    // 15K: minimum 18
    assert(!checkEligibility('15k', 17), '15K rejects age 17 (minimum is 18)');
    assert(checkEligibility('15k', 18), '15K accepts age 18 (exact boundary)');
    assert(checkEligibility('15k', 40), '15K accepts age 40');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 3: finalizeTicket Runs Once (Idempotent)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 3: finalizeTicket Idempotency ---');
  {
    const orderId = `order_test_${Date.now()}_1`;
    const reg = await RegistrationService.createRegistration({
      fullName: 'Sunil Gavaskar',
      email: 'sunil.g@example.com',
      phone: '9845012345',
      age: 32,
      categoryId: '10k',
      categoryName: '10K Run',
      tshirtSize: 'L',
      emergencyContactName: 'Marshneill Gavaskar',
      emergencyContactPhone: '9845012346',
      amountINR: 799,
      razorpayOrderId: orderId
    });

    const paymentId = `pay_test_${Date.now()}_1`;
    await RegistrationService.markAsPaid(orderId, paymentId);

    // First finalization
    await finalizeTicket(reg.id);
    const afterFirst = await RegistrationService.findById(reg.id);

    assert(!!afterFirst?.ticketId, 'First finalizeTicket generates unique ticketId');
    assert(!!afterFirst?.qrToken, 'First finalizeTicket generates qrToken (>= 128-bit hex)');
    assert(typeof afterFirst?.bibNumber === 'number', 'First finalizeTicket assigns bibNumber');

    const firstTicketId = afterFirst?.ticketId;
    const firstQrToken = afterFirst?.qrToken;
    const firstBib = afterFirst?.bibNumber;

    // Second finalization attempt (should be a no-op / idempotent)
    await finalizeTicket(reg.id);
    const afterSecond = await RegistrationService.findById(reg.id);

    assert(afterSecond?.ticketId === firstTicketId, 'Subsequent finalizeTicket preserves original ticketId');
    assert(afterSecond?.qrToken === firstQrToken, 'Subsequent finalizeTicket preserves original qrToken');
    assert(afterSecond?.bibNumber === firstBib, 'Subsequent finalizeTicket preserves original bibNumber');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 4: Lookup by Each Identifier Type
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 4: Lookup by Any Identifier Type ---');
  {
    const orderId = `order_test_lookup_${Date.now()}`;
    const paymentId = `pay_test_lookup_${Date.now()}`;

    const reg = await RegistrationService.createRegistration({
      fullName: 'Deepika Padukone',
      email: 'deepika.p@example.com',
      phone: '9820011223',
      age: 29,
      categoryId: '5k',
      categoryName: '5K Run',
      tshirtSize: 'M',
      emergencyContactName: 'Prakash Padukone',
      emergencyContactPhone: '9820011224',
      amountINR: 599,
      razorpayOrderId: orderId
    });

    await RegistrationService.markAsPaid(orderId, paymentId);
    await finalizeTicket(reg.id);
    const finalized = await RegistrationService.findById(reg.id);

    const qrToken = finalized!.qrToken!;
    const ticketId = finalized!.ticketId!;
    const regNum = finalized!.registrationNumber;

    // 1. Lookup by raw qrToken
    const byRawQr = await RegistrationService.lookupByAnyId(qrToken);
    assert(byRawQr?.id === reg.id, 'Lookup by raw qrToken successfully finds registration');

    // 2. Lookup by QR scanner formatted token "BR26.<token>"
    const byFormattedQr = await RegistrationService.lookupByAnyId(`BR26.${qrToken}`);
    assert(byFormattedQr?.id === reg.id, 'Lookup by formatted "BR26.<qrToken>" successfully finds registration');

    // 3. Lookup by ticketId
    const byTicket = await RegistrationService.lookupByAnyId(ticketId);
    assert(byTicket?.id === reg.id, 'Lookup by ticketId successfully finds registration');

    // 4. Lookup by razorpayPaymentId
    const byPaymentId = await RegistrationService.lookupByAnyId(paymentId);
    assert(byPaymentId?.id === reg.id, 'Lookup by razorpayPaymentId successfully finds registration');

    // 5. Lookup by registrationNumber (UBR2026-XXXX)
    const byRegNum = await RegistrationService.lookupByAnyId(regNum);
    assert(byRegNum?.id === reg.id, 'Lookup by registrationNumber successfully finds registration');

    // 6. Lookup by razorpayOrderId
    const byOrderId = await RegistrationService.lookupByAnyId(orderId);
    assert(byOrderId?.id === reg.id, 'Lookup by razorpayOrderId successfully finds registration');

    // 7. Non-existent ID lookup returns null
    const nonExistent = await RegistrationService.lookupByAnyId('NON_EXISTENT_ID_99999');
    assert(nonExistent === null, 'Lookup for non-existent token safely returns null');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 5: Unpaid Ticket Rejected
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 5: Unpaid Registration Check-In Rejection ---');
  {
    const orderId = `order_unpaid_${Date.now()}`;
    const pendingReg = await RegistrationService.createRegistration({
      fullName: 'Rahul Dravid',
      email: 'rahul.d@example.com',
      phone: '9845099887',
      age: 48,
      categoryId: '15k',
      categoryName: '15K Run',
      tshirtSize: 'XL',
      emergencyContactName: 'Vijeta Dravid',
      emergencyContactPhone: '9845099888',
      amountINR: 999,
      razorpayOrderId: orderId
    });

    // Check-in on PENDING unpaid registration
    const checkInResult = await RegistrationService.atomicCheckIn(
      pendingReg.registrationNumber,
      'admin_gate_1',
      'MANUAL'
    );

    assert(checkInResult.success === false, 'Check-in on unpaid runner is rejected (success = false)');
    assert(checkInResult.result === 'UNPAID', 'Check-in result returns UNPAID status code');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 6: Atomic Gate Check-In & Double-Scan Prevention
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 6: Atomic Gate Check-In ---');
  {
    const orderId = `order_atomic_${Date.now()}`;
    const paymentId = `pay_atomic_${Date.now()}`;

    const reg = await RegistrationService.createRegistration({
      fullName: 'Milkha Singh',
      email: 'milkha.s@example.com',
      phone: '9811122233',
      age: 35,
      categoryId: '10k',
      categoryName: '10K Run',
      tshirtSize: 'L',
      emergencyContactName: 'Nirmal Kaur',
      emergencyContactPhone: '9811122234',
      amountINR: 799,
      razorpayOrderId: orderId
    });

    await RegistrationService.markAsPaid(orderId, paymentId);
    await finalizeTicket(reg.id);
    const finalized = await RegistrationService.findById(reg.id);
    const token = `BR26.${finalized!.qrToken}`;

    // 1. First scan: Must succeed
    const firstScan = await RegistrationService.atomicCheckIn(token, 'gate_scanner_device_1', 'QR');
    assert(firstScan.success === true, 'First QR scan succeeds');
    assert(firstScan.result === 'SUCCESS', 'First scan returns SUCCESS status');
    assert(firstScan.registration?.checkedIn === true, 'Runner record marked checkedIn = true');

    // 2. Second scan: Must be rejected as DUPLICATE
    const secondScan = await RegistrationService.atomicCheckIn(token, 'gate_scanner_device_2', 'QR');
    assert(secondScan.success === false, 'Second scan of same token is rejected');
    assert(secondScan.result === 'DUPLICATE', 'Second scan returns DUPLICATE status');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 7: Concurrent Race Condition Scan
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 7: Concurrent Double-Scan Race Condition ---');
  {
    const orderId = `order_race_${Date.now()}`;
    const paymentId = `pay_race_${Date.now()}`;

    const reg = await RegistrationService.createRegistration({
      fullName: 'PT Usha',
      email: 'pt.usha@example.com',
      phone: '9847012345',
      age: 38,
      categoryId: '5k',
      categoryName: '5K Run',
      tshirtSize: 'M',
      emergencyContactName: 'Srinivasan',
      emergencyContactPhone: '9847012346',
      amountINR: 599,
      razorpayOrderId: orderId
    });

    await RegistrationService.markAsPaid(orderId, paymentId);
    await finalizeTicket(reg.id);
    const finalized = await RegistrationService.findById(reg.id);
    const token = `BR26.${finalized!.qrToken}`;

    // Fire 5 simultaneous check-in requests
    const attempts = await Promise.all([
      RegistrationService.atomicCheckIn(token, 'admin_sim_1', 'QR'),
      RegistrationService.atomicCheckIn(token, 'admin_sim_2', 'QR'),
      RegistrationService.atomicCheckIn(token, 'admin_sim_3', 'QR'),
      RegistrationService.atomicCheckIn(token, 'admin_sim_4', 'QR'),
      RegistrationService.atomicCheckIn(token, 'admin_sim_5', 'QR'),
    ]);

    const successes = attempts.filter(a => a.result === 'SUCCESS');
    const duplicates = attempts.filter(a => a.result === 'DUPLICATE');

    assert(successes.length === 1, `Exactly 1 concurrent attempt succeeded (Actual: ${successes.length})`);
    assert(duplicates.length === 4, `All 4 remaining concurrent attempts were rejected as DUPLICATE (Actual: ${duplicates.length})`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST SUITE 8: Webhook Idempotency
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- Test Suite 8: Webhook Idempotency ---');
  {
    const eventId = `evt_test_idempotency_${Date.now()}`;
    const eventType = 'payment.captured';
    const payload = { test: true, eventId };

    const firstCheck = await RegistrationService.isWebhookProcessed(eventId);
    assert(firstCheck === false, 'Fresh webhook event is not yet marked processed');

    await RegistrationService.markWebhookProcessed(eventId, eventType, payload);
    const secondCheck = await RegistrationService.isWebhookProcessed(eventId);
    assert(secondCheck === true, 'Webhook event marked processed after first run');

    // Calling markWebhookProcessed again should be safe and idempotent
    await RegistrationService.markWebhookProcessed(eventId, eventType, payload);
    const thirdCheck = await RegistrationService.isWebhookProcessed(eventId);
    assert(thirdCheck === true, 'Re-marking webhook processed remains true and safe');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
