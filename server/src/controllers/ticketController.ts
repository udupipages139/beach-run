/**
 * Ticket & Screenshot controllers
 */
import { Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { RegistrationService, generateQRBuffer } from '../services/registrationService.js';

// ─── GET /api/tickets/:ticketId ──────────────────────────────────────────────

export const getTicketController = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) return res.status(400).json({ success: false, error: 'Ticket ID required' });

    const reg = await RegistrationService.lookupByAnyId(ticketId);

    if (!reg || !reg.ticketId) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    if (reg.paymentStatus !== 'PAID') {
      return res.status(403).json({ success: false, error: 'Payment not confirmed for this ticket' });
    }

    // Generate fresh QR buffer
    const qrBuffer = await generateQRBuffer(reg.qrToken!);
    const qrBase64 = qrBuffer.toString('base64');

    return res.status(200).json({
      success: true,
      ticket: {
        ticketId: reg.ticketId,
        bibNumber: reg.bibNumber,
        fullName: reg.fullName,
        email: reg.email,
        phone: reg.phone,
        categoryName: reg.categoryName,
        categoryId: reg.categoryId,
        tshirtSize: reg.tshirtSize,
        age: reg.age,
        experience: reg.experience,
        emergencyContactName: reg.emergencyContactName,
        emergencyContactPhone: reg.emergencyContactPhone,
        amountINR: reg.amountINR,
        transactionId: reg.transactionId,
        registrationNumber: reg.registrationNumber,
        qrImageBase64: `data:image/png;base64,${qrBase64}`,
        checkedIn: reg.checkedIn,
        createdAt: reg.createdAt
      }
    });
  } catch (error: any) {
    console.error('[TicketController] Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve ticket' });
  }
};

// ─── Screenshot Upload ───────────────────────────────────────────────────────

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

export const uploadScreenshotController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const reg = await RegistrationService.findById(id);
    if (!reg) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    let screenshotUrl: string;

    if (supabase) {
      const fileName = `${id}_${Date.now()}.${file.mimetype.split('/')[1]}`;
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('[Screenshot] Supabase storage error:', error.message);
        screenshotUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      } else {
        screenshotUrl = `payment-proofs/${data.path}`;
      }
    } else {
      screenshotUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    await RegistrationService.saveScreenshotUrl(id, screenshotUrl);

    // Also save transactionId if provided
    if (transactionId) {
      if (supabase) {
        await supabase
          .from('registrations')
          .update({ transaction_id: transactionId, updated_at: new Date().toISOString() })
          .eq('id', id);
      } else {
        const inMemReg = await RegistrationService.findById(id);
        if (inMemReg) {
          inMemReg.transactionId = transactionId;
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Screenshot uploaded successfully',
      screenshotUrl
    });
  } catch (error: any) {
    console.error('[ScreenshotController] Error:', error);
    return res.status(500).json({ success: false, error: 'Upload failed', details: error.message });
  }
};
