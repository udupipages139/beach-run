/**
 * simulate-webhook.ts — Signs and POSTs a fake payment.captured event
 * Usage: npx tsx scripts/simulate-webhook.ts <razorpay_order_id> [razorpay_payment_id]
 * Example: npx tsx scripts/simulate-webhook.ts order_seed_abc123
 */
import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';
import http from 'http';

const orderId = process.argv[2] || `order_mock_${Date.now()}`;
const paymentId = process.argv[3] || `pay_sim_${Date.now()}`;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_placeholder';
const apiUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5000';

const payload = {
  entity: 'event',
  account_id: 'acc_test_sim',
  event: 'payment.captured',
  created_at: Math.floor(Date.now() / 1000),
  payload: {
    payment: {
      entity: {
        id: paymentId,
        entity: 'payment',
        order_id: orderId,
        amount: 59900,
        currency: 'INR',
        status: 'captured',
        method: 'upi',
        captured: true,
        email: 'test@example.com',
        contact: '+919876543210'
      }
    }
  }
};

const body = JSON.stringify(payload);
const signature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');

const urlObj = new URL(`${apiUrl}/api/webhooks/razorpay`);

const options: http.RequestOptions = {
  hostname: urlObj.hostname,
  port: urlObj.port || 80,
  path: urlObj.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'X-Razorpay-Signature': signature
  }
};

console.log(`\n🚀 Simulating Razorpay webhook: payment.captured`);
console.log(`  Order ID:   ${orderId}`);
console.log(`  Payment ID: ${paymentId}`);
console.log(`  Signature:  ${signature.slice(0, 20)}...`);
console.log(`  Target:     ${apiUrl}/api/webhooks/razorpay\n`);

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`✅ Response [${res.statusCode}]: ${data}`);
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.write(body);
req.end();
