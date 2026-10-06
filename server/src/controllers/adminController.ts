/**
 * Admin Controller — Udupipages Beach Run 2026
 * All admin endpoints: auth, dashboard, registrations, checkin, lookup, approve, resend, screenshot, export
 */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { RegistrationService, generateQRBuffer } from '../services/registrationService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';
const JWT_EXPIRES = '8h';

// ─── Auth ──────────────────────────────────────────────────────────────────

export const adminLoginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    let isValid = false;
    let adminId = 'admin';

    if (supabase) {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (!error && data) {
        isValid = await bcrypt.compare(password, data.password_hash);
        adminId = data.id;
      }
    }

    // Fallback to credentials check (accepts admin / admin, admin@udupipagesrun.com, or env vars)
    if (!isValid) {
      const normalizedInput = email.trim().toLowerCase();
      const envEmail = (process.env.ADMIN_EMAIL || 'admin').toLowerCase();
      const envPass = process.env.ADMIN_PASSWORD || 'admin';

      if (
        (normalizedInput === 'admin' && (password === 'admin' || password === 'admin123')) ||
        (normalizedInput === 'admin@udupipagesrun.com' && (password === 'admin' || password === 'admin123')) ||
        (normalizedInput === envEmail && password === envPass)
      ) {
        isValid = true;
        adminId = 'admin_master';
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ adminId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.cookie('ubr_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000 // 8h
    });

    return res.status(200).json({ success: true, message: 'Logged in successfully', adminId });
  } catch (error: any) {
    console.error('[AdminController] Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
};

export const adminLogoutController = (_req: Request, res: Response) => {
  res.clearCookie('ubr_admin_token');
  return res.status(200).json({ success: true, message: 'Logged out' });
};

export const adminMeController = (req: Request, res: Response) => {
  return res.status(200).json({ success: true, admin: (req as any).admin });
};

// ─── Stats Dashboard ────────────────────────────────────────────────────────

export const adminStatsController = async (req: Request, res: Response) => {
  try {
    const { source, registrations } = await RegistrationService.getAllRegistrations();

    let totalRevenueINR = 0;
    let totalPaidCount = 0;
    let totalPendingCount = 0;
    let totalFailedCount = 0;
    let checkedInCount = 0;
    const categoryStats: Record<string, { count: number; name: string; revenue: number; checkedIn: number }> = {};

    registrations.forEach(reg => {
      if (!categoryStats[reg.categoryId]) {
        categoryStats[reg.categoryId] = { count: 0, name: reg.categoryName, revenue: 0, checkedIn: 0 };
      }
      categoryStats[reg.categoryId].count++;

      if (reg.paymentStatus === 'PAID') {
        totalPaidCount++;
        totalRevenueINR += reg.amountINR;
        categoryStats[reg.categoryId].revenue += reg.amountINR;
        if (reg.checkedIn) {
          checkedInCount++;
          categoryStats[reg.categoryId].checkedIn++;
        }
      } else if (reg.paymentStatus === 'PENDING') {
        totalPendingCount++;
      } else if (reg.paymentStatus === 'FAILED') {
        totalFailedCount++;
      }
    });

    return res.status(200).json({
      success: true,
      source,
      stats: {
        totalRegistrations: registrations.length,
        totalPaidCount,
        totalPendingCount,
        totalFailedCount,
        checkedInCount,
        totalRevenueINR,
        categoryStats
      },
      registrations
    });
  } catch (error: any) {
    console.error('[AdminController] Stats error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
};

// Keep legacy endpoint working
export const getAdminRegistrationsController = adminStatsController;

// ─── Registrations List ─────────────────────────────────────────────────────

export const adminRegistrationsController = async (req: Request, res: Response) => {
  return adminStatsController(req, res);
};

// ─── Check-In ────────────────────────────────────────────────────────────────

export const adminCheckInController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    const admin = (req as any).admin;
    const adminId = admin?.adminId || 'admin';

    const result = await RegistrationService.atomicCheckIn(token, adminId, 'QR');

    return res.status(200).json({
      success: result.success,
      result: result.result,
      message: result.message,
      registration: result.registration,
      firstCheckedInAt: result.firstCheckedInAt
    });
  } catch (error: any) {
    console.error('[AdminController] Check-in error:', error);
    return res.status(500).json({ success: false, error: 'Check-in failed', details: error.message });
  }
};

// ─── Manual Lookup ──────────────────────────────────────────────────────────

export const adminLookupController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    const reg = await RegistrationService.lookupByAnyId(token);
    if (!reg) {
      return res.status(200).json({ success: false, found: false, message: 'No record found for this identifier.' });
    }

    return res.status(200).json({ success: true, found: true, registration: reg });
  } catch (error: any) {
    console.error('[AdminController] Lookup error:', error);
    return res.status(500).json({ success: false, error: 'Lookup failed' });
  }
};

// ─── Manual Check-In (from lookup) ─────────────────────────────────────────

export const adminManualCheckInController = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token required' });
    }

    const admin = (req as any).admin;
    const adminId = admin?.adminId || 'admin';
    const result = await RegistrationService.atomicCheckIn(token, adminId, 'MANUAL');

    return res.status(200).json({
      success: result.success,
      result: result.result,
      message: result.message,
      registration: result.registration,
      firstCheckedInAt: result.firstCheckedInAt
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Manual check-in failed', details: error.message });
  }
};

// ─── Resend Ticket Email ─────────────────────────────────────────────────────

export const adminResendEmailController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sent = await RegistrationService.resendTicketEmail(id);
    return res.status(200).json({
      success: true,
      emailSent: sent,
      message: sent ? 'Email sent successfully' : 'Email could not be sent (check SMTP config)'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Resend failed', details: error.message });
  }
};

// ─── Manual Approve ──────────────────────────────────────────────────────────

export const adminApproveController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const admin = (req as any).admin;
    const adminId = admin?.adminId || 'admin';

    const reg = await RegistrationService.manuallyApprove(id, adminId, note || 'Admin manual approval');

    if (!reg) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration approved and ticket issued.',
      registration: reg
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Approval failed', details: error.message });
  }
};

// ─── View Screenshot (signed URL) ───────────────────────────────────────────

export const adminScreenshotController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reg = await RegistrationService.findById(id);
    if (!reg?.paymentScreenshotUrl) {
      return res.status(404).json({ success: false, error: 'No screenshot found' });
    }

    if (supabase && reg.paymentScreenshotUrl.startsWith('payment-proofs/')) {
      const { data, error } = await supabase.storage
        .from('payment-proofs')
        .createSignedUrl(reg.paymentScreenshotUrl.replace('payment-proofs/', ''), 300); // 5min

      if (!error && data?.signedUrl) {
        return res.status(200).json({ success: true, signedUrl: data.signedUrl });
      }
    }

    return res.status(200).json({ success: true, signedUrl: reg.paymentScreenshotUrl });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Failed to get screenshot URL' });
  }
};

// ─── Export CSV ──────────────────────────────────────────────────────────────

export const adminExportController = async (req: Request, res: Response) => {
  try {
    const { registrations } = await RegistrationService.getAllRegistrations();
    const headers = [
      'Registration #', 'Full Name', 'Email', 'Phone', 'Age',
      'Category', 'T-Shirt', 'Experience', 'Emergency Contact Name', 'Emergency Contact Phone',
      'Payment Status', 'Amount (INR)', 'Ticket ID', 'Bib Number',
      'Transaction ID', 'Razorpay Payment ID', 'Razorpay Order ID',
      'Checked In', 'Checked In At', 'Email Sent', 'Registration Date'
    ];

    const rows = registrations.map(r => [
      `"${r.registrationNumber}"`, `"${r.fullName}"`, `"${r.email}"`, `"${r.phone}"`,
      r.age, `"${r.categoryName}"`, `"${r.tshirtSize}"`, `"${r.experience || ''}"`,
      `"${r.emergencyContactName}"`, `"${r.emergencyContactPhone}"`,
      `"${r.paymentStatus}"`, r.amountINR, `"${r.ticketId || ''}"`, r.bibNumber || '',
      `"${r.transactionId || ''}"`, `"${r.razorpayPaymentId || ''}"`, `"${r.razorpayOrderId || ''}"`,
      r.checkedIn, `"${r.checkedInAt || ''}"`, r.emailSent,
      `"${new Date(r.createdAt).toLocaleString()}"`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="UBR2026_Registrations_${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Export failed', details: error.message });
  }
};

// ─── Checked-In Count ────────────────────────────────────────────────────────

export const adminCheckInCountController = async (req: Request, res: Response) => {
  try {
    const count = await RegistrationService.getCheckedInCount();
    return res.status(200).json({ success: true, count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: 'Failed to get count' });
  }
};
