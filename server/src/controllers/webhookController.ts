import { Request, Response } from 'express';
import crypto from 'crypto';
import { getWebhookSecret } from '../config/razorpay.js';
import { RegistrationService } from '../services/registrationService.js';

export const handleRazorpayWebhookController = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = getWebhookSecret();

    // Use raw request body buffer for accurate HMAC computation
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('[WebhookController] Invalid Razorpay webhook signature header');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const payload = req.body;
    const eventType = payload.event;

    console.log(`[WebhookController] Received valid Razorpay Webhook Event: ${eventType}`);

    if (eventType === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (razorpayOrderId && razorpayPaymentId) {
        const updatedReg = await RegistrationService.markAsPaid(razorpayOrderId, razorpayPaymentId);
        console.log(`[WebhookController] Registration marked PAID via Webhook for Order: ${razorpayOrderId}`);
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('[WebhookController] Error processing webhook:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
