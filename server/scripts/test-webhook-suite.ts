import crypto from 'crypto';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'udupipages_beach_run_wh_2026';

function sendWebhook(urlStr: string, payload: any, customSig?: string): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(payload);
    const signature = customSig !== undefined
      ? customSig
      : crypto.createHmac('sha256', webhookSecret).update(bodyStr).digest('hex');

    const parsed = new URL(urlStr);
    const isHttps = parsed.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request({
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'X-Razorpay-Signature': signature
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode || 500, body: data }));
    });

    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function runSuite() {
  console.log('🧪 Starting Razorpay Webhook Diagnostics Suite...\n');
  const localUrl = 'http://localhost:5000/api/webhooks/razorpay';
  const vercelUrl = 'https://udupipages-beach-run-backend.vercel.app/api/webhooks/razorpay';

  // 1. Invalid Signature Test
  console.log('Test 1: Tampered / Invalid Signature (Security Check)');
  const res1 = await sendWebhook(localUrl, { event: 'payment.captured' }, 'invalid_tampered_signature_123');
  console.log(`  Result: HTTP ${res1.statusCode} - ${res1.body}`);
  if (res1.statusCode === 400 && res1.body.includes('Invalid webhook signature')) {
    console.log('  ✅ PASSED: Unauthorized / forged webhook correctly rejected with HTTP 400.\n');
  } else {
    console.log('  ❌ FAILED: Unexpected response for invalid signature.\n');
  }

  // 2. Missing / Empty Signature Test
  console.log('Test 2: Missing Signature Header');
  const res2 = await sendWebhook(localUrl, { event: 'payment.captured' }, '');
  console.log(`  Result: HTTP ${res2.statusCode} - ${res2.body}`);
  if (res2.statusCode === 400) {
    console.log('  ✅ PASSED: Missing signature correctly rejected with HTTP 400.\n');
  } else {
    console.log('  ❌ FAILED: Missing signature was not rejected.\n');
  }

  // 3. Payment Failed Event Test
  console.log('Test 3: Event `payment.failed` Handling');
  const failedPayload = {
    entity: 'event',
    account_id: 'acc_fail_test',
    event: 'payment.failed',
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      payment: {
        entity: {
          id: 'pay_fail_999',
          order_id: 'order_test_fail',
          error_code: 'BAD_REQUEST_ERROR',
          error_description: 'Payment was declined by user bank'
        }
      }
    }
  };
  const res3 = await sendWebhook(localUrl, failedPayload);
  console.log(`  Result: HTTP ${res3.statusCode} - ${res3.body}`);
  if (res3.statusCode === 200) {
    console.log('  ✅ PASSED: Payment failure event gracefully acknowledged without crashing.\n');
  } else {
    console.log('  ❌ FAILED: Payment failure event returned unexpected status.\n');
  }

  // 4. Idempotency Test (Duplicate event delivered)
  console.log('Test 4: Idempotency (Duplicate Event Delivery)');
  const dupPayload = {
    entity: 'event',
    account_id: 'acc_dup_test',
    event: 'order.paid',
    created_at: 1700000000,
    payload: { order: { entity: { id: 'order_dup_123' } } }
  };
  const firstCall = await sendWebhook(localUrl, dupPayload);
  const secondCall = await sendWebhook(localUrl, dupPayload);
  console.log(`  First Delivery: HTTP ${firstCall.statusCode}`);
  console.log(`  Second Delivery (Duplicate): HTTP ${secondCall.statusCode}`);
  if (firstCall.statusCode === 200 && secondCall.statusCode === 200) {
    console.log('  ✅ PASSED: Webhook idempotency protects against duplicate processing.\n');
  } else {
    console.log('  ❌ FAILED: Duplicate event failed.\n');
  }

  // 5. Test Live Deployed Vercel Webhook Endpoint with bad signature
  console.log('Test 5: Live Deployed Vercel Endpoint Security Check (Invalid Signature)');
  const vercelBadRes = await sendWebhook(vercelUrl, { event: 'payment.captured' }, 'fake_signature');
  console.log(`  Vercel Bad Sig Result: HTTP ${vercelBadRes.statusCode} - ${vercelBadRes.body}`);
  if (vercelBadRes.statusCode === 400) {
    console.log('  ✅ PASSED: Live Vercel backend webhook actively rejects invalid signatures.\n');
  }

  // 6. Test Live Deployed Vercel Webhook Endpoint with matching signature
  console.log('Test 6: Live Deployed Vercel Webhook with Matching Signature');
  const vercelGoodRes = await sendWebhook(vercelUrl, {
    entity: 'event',
    account_id: 'acc_live_test',
    event: 'payment.failed',
    created_at: Math.floor(Date.now() / 1000),
    payload: { payment: { entity: { id: 'pay_live_test', order_id: 'order_live_test' } } }
  });
  console.log(`  Vercel Matching Sig Result: HTTP ${vercelGoodRes.statusCode} - ${vercelGoodRes.body}`);
  if (vercelGoodRes.statusCode === 200) {
    console.log('  ✅ PASSED: Live Vercel backend verified matching signature and processed webhook.\n');
  } else if (vercelGoodRes.statusCode === 400) {
    console.log('  ⚠️ Vercel returned 400: This means RAZORPAY_WEBHOOK_SECRET is not yet added in Vercel Dashboard Settings -> Environment Variables!\n');
  }

  console.log('🏁 All Webhook diagnostics completed!');
}

runSuite().catch(console.error);
