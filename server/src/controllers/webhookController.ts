import { Request, Response } from 'express';
import crypto from 'crypto';
import { getWebhookSecret } from '../config/razorpay.js';
import { RegistrationService, finalizeTicket } from '../services/registrationService.js';

export const handleRazorpayWebhookController = async (req: Request, res: Response) => {
  // Always respond 200 quickly after signature verification
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = getWebhookSecret();
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));

    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const isPlaceholderSecret = webhookSecret === 'webhook_secret_placeholder' || !webhookSecret;

    if (!isPlaceholderSecret && signature !== expected) {
      console.warn('[WebhookController] Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Respond immediately to Razorpay
    res.status(200).json({ status: 'ok' });

    // Process async
    const payload = req.body;
    const eventType: string = payload.event;
    const razorpayEventId: string = payload.account_id
      ? `${payload.account_id}_${payload.created_at}_${eventType}`
      : `${payload.created_at}_${eventType}`;

    console.log(`[WebhookController] Event: ${eventType} | ID: ${razorpayEventId}`);

    // Idempotency check
    if (await RegistrationService.isWebhookProcessed(razorpayEventId)) {
      console.log(`[WebhookController] Already processed event: ${razorpayEventId}`);
      return;
    }

    await RegistrationService.markWebhookProcessed(razorpayEventId, eventType, payload);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId && razorpayPaymentId) {
        const updated = await RegistrationService.markAsPaid(razorpayOrderId, razorpayPaymentId);
        if (updated) {
          await finalizeTicket(updated.id);
          console.log(`[WebhookController] ✅ Finalized via webhook: ${updated.registrationNumber}`);
        }
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      if (razorpayOrderId) {
        // We just log; no DB update needed unless you want to mark FAILED
        console.log(`[WebhookController] Payment failed for order: ${razorpayOrderId}`);
      }
    }
  } catch (error: any) {
    console.error('[WebhookController] Error:', error.message);
    if (!res.headersSent) {
      res.status(200).json({ status: 'ok' }); // always 200
    }
  }
};
