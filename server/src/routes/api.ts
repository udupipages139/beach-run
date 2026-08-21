import { Router } from 'express';
import { CATEGORIES } from '../config/categories.js';
import { createOrderController } from '../controllers/orderController.js';
import { verifyPaymentController } from '../controllers/paymentController.js';
import { handleRazorpayWebhookController } from '../controllers/webhookController.js';

const router = Router();

// GET /api/categories — Return public category metadata & pricing
router.get('/categories', (req, res) => {
  return res.json({ success: true, categories: Object.values(CATEGORIES) });
});

// POST /api/orders/create — Create Razorpay Order or process Free registration
router.post('/orders/create', createOrderController);

// POST /api/payments/verify — Server-side signature verification after Razorpay Checkout
router.post('/payments/verify', verifyPaymentController);

// POST /api/webhooks/razorpay — Independent webhook handler for payment.captured
router.post('/webhooks/razorpay', handleRazorpayWebhookController);

export default router;
