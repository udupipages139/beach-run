import { Router } from 'express';
import { CATEGORIES } from '../config/categories.js';
import { createOrderController } from '../controllers/orderController.js';
import { verifyPaymentController } from '../controllers/paymentController.js';
import { handleRazorpayWebhookController } from '../controllers/webhookController.js';
import { getTicketController, upload, uploadScreenshotController } from '../controllers/ticketController.js';
import { adminAuthMiddleware } from '../middleware/auth.js';
import {
  adminLoginController,
  adminLogoutController,
  adminMeController,
  adminStatsController,
  adminRegistrationsController,
  getAdminRegistrationsController,
  adminCheckInController,
  adminLookupController,
  adminManualCheckInController,
  adminResendEmailController,
  adminApproveController,
  adminScreenshotController,
  adminExportController,
  adminCheckInCountController
} from '../controllers/adminController.js';

const router = Router();

// ─── Public API ───────────────────────────────────────────────────────────────

// Categories
router.get('/categories', (_req, res) => {
  return res.json({ success: true, categories: Object.values(CATEGORIES) });
});

// Registration + Razorpay order
router.post('/registrations', createOrderController);
router.post('/orders/create', createOrderController); // legacy alias

// Payment verify
router.post('/payments/verify', verifyPaymentController);

// Razorpay Webhook (raw body needed for HMAC — handled in app.ts)
router.post('/webhooks/razorpay', handleRazorpayWebhookController);

// Ticket display (unguessable ticketId)
router.get('/tickets/:ticketId', getTicketController);

// Screenshot upload (authenticated via registrationId)
router.post('/registrations/:id/screenshot', upload.single('screenshot'), uploadScreenshotController);

// ─── Admin Auth (rate-limited in app.ts) ─────────────────────────────────────

router.post('/admin/login', adminLoginController);
router.post('/admin/logout', adminLogoutController);
router.get('/admin/me', adminAuthMiddleware, adminMeController);

// ─── Admin Protected Routes ───────────────────────────────────────────────────

router.get('/admin/stats', adminAuthMiddleware, adminStatsController);

// Legacy + new registrations endpoints
router.get('/admin/registrations', adminAuthMiddleware, adminRegistrationsController);

// Check-in (QR scan)
router.post('/admin/checkin', adminAuthMiddleware, adminCheckInController);

// Manual lookup by any identifier
router.post('/admin/lookup', adminAuthMiddleware, adminLookupController);

// Manual check-in from lookup
router.post('/admin/manual-checkin', adminAuthMiddleware, adminManualCheckInController);

// Email resend
router.post('/admin/registrations/:id/resend', adminAuthMiddleware, adminResendEmailController);

// Manual approve
router.post('/admin/registrations/:id/approve', adminAuthMiddleware, adminApproveController);

// Screenshot signed URL
router.get('/admin/registrations/:id/screenshot', adminAuthMiddleware, adminScreenshotController);

// CSV Export
router.get('/admin/export.csv', adminAuthMiddleware, adminExportController);

// Checked-in count (for scanner badge)
router.get('/admin/checkin-count', adminAuthMiddleware, adminCheckInCountController);

export default router;
