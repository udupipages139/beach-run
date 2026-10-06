/**
 * RegistrationService — Udupipages Beach Run 2026
 * Full-featured service: registration CRUD, payment, ticket finalization, QR, email, check-in.
 */
import { supabase } from '../config/supabase.js';
import { randomUUID, randomBytes } from 'crypto';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { CATEGORIES } from '../config/categories.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegistrationRecord {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  categoryId: string;
  categoryName: string;
  tshirtSize: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  experience?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amountINR: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
  ticketId?: string;
  qrToken?: string;
  bibNumber?: number;
  emailSent: boolean;
  emailAttempts: number;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  manuallyApproved?: boolean;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  // legacy compat
  status?: 'PENDING' | 'PAID' | 'FREE' | 'FAILED';
  amountInr?: number;
}

export interface CheckInResult {
  success: boolean;
  result: 'SUCCESS' | 'DUPLICATE' | 'INVALID' | 'UNPAID';
  registration?: RegistrationRecord;
  message: string;
  firstCheckedInAt?: string;
}

// ─── In-Memory Fallback ───────────────────────────────────────────────────────

const inMemoryRegistrations = new Map<string, RegistrationRecord>();
const inMemoryBibCounters: Record<string, number> = {
  '3k_fun': 1002, '5k': 2003, '10k': 3002, '15k': 4002
};
const inMemoryWebhookEvents = new Set<string>();

// Helper: generate realistic sample UPI payment screenshot SVG for demo records
function createSampleUpiProof(name: string, amount: number, utr: string, category: string): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="640" viewBox="0 0 420 640" fill="none">
  <rect width="420" height="640" rx="20" fill="#0A0F1D"/>
  <rect x="16" y="16" width="388" height="608" rx="16" fill="#131D31" stroke="#253553" stroke-width="2"/>
  
  <!-- Header App Bar -->
  <rect x="16" y="16" width="388" height="60" rx="16" fill="#1E293B"/>
  <circle cx="50" cy="46" r="14" fill="#334155"/>
  <text x="50" y="51" fill="#94A3B8" font-family="sans-serif" font-size="12" text-anchor="middle">UPI</text>
  <text x="210" y="50" fill="#F8FAFC" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Payment Receipt</text>
  <circle cx="370" cy="46" r="14" fill="#334155"/>
  <text x="370" y="50" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✓</text>

  <!-- Success Badge -->
  <circle cx="210" cy="130" r="34" fill="#10B981" fill-opacity="0.15"/>
  <circle cx="210" cy="130" r="24" fill="#10B981"/>
  <path d="M199 130L206 137L221 122" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  
  <text x="210" y="188" fill="#F8FAFC" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">Payment Successful</text>
  <text x="210" y="210" fill="#94A3B8" font-family="sans-serif" font-size="12" text-anchor="middle">6 Dec 2026 • Padukere Beach Run</text>

  <!-- Amount -->
  <text x="210" y="265" fill="#FF7A30" font-family="sans-serif" font-size="38" font-weight="900" text-anchor="middle">₹${amount}.00</text>
  <text x="210" y="290" fill="#CBD5E1" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${name} (${category})</text>

  <!-- Divider -->
  <line x1="36" y1="315" x2="384" y2="315" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Key-Value Details -->
  <text x="40" y="348" fill="#94A3B8" font-family="sans-serif" font-size="12">UPI Ref ID / UTR</text>
  <text x="380" y="348" fill="#F8FAFC" font-family="monospace" font-size="12" font-weight="bold" text-anchor="end">${utr}</text>

  <text x="40" y="385" fill="#94A3B8" font-family="sans-serif" font-size="12">Paid To</text>
  <text x="380" y="385" fill="#F8FAFC" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">udupipages@okaxis</text>

  <text x="40" y="422" fill="#94A3B8" font-family="sans-serif" font-size="12">Payment Mode</text>
  <text x="380" y="422" fill="#F8FAFC" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">Google Pay / PhonePe UPI</text>

  <text x="40" y="459" fill="#94A3B8" font-family="sans-serif" font-size="12">Status</text>
  <text x="380" y="459" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="end">COMPLETED ✓</text>

  <!-- Card box -->
  <rect x="36" y="495" width="348" height="75" rx="10" fill="#0A0F1D" stroke="#334155"/>
  <text x="52" y="525" fill="#10B981" font-family="sans-serif" font-size="12" font-weight="bold">✓ OFFICIAL DIGITAL RECEIPT</text>
  <text x="52" y="546" fill="#94A3B8" font-family="sans-serif" font-size="11">Udupipages Beach Run 2026 — Verified Entry</text>
  <text x="52" y="562" fill="#64748B" font-family="monospace" font-size="10">Ref: UBR-PROOF-${utr.slice(-6)}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

// Pre-populate with initial test registrations
const initialDemoRegistrations: RegistrationRecord[] = [
  {
    id: 'demo-reg-1',
    registrationNumber: 'UBR2026-1001',
    fullName: 'Venkat Nayak',
    email: 'venkat.nayak@example.com',
    phone: '7890123456',
    age: 42,
    categoryId: '3k_fun',
    categoryName: '3K Fun Run',
    tshirtSize: 'XL',
    emergencyContactName: 'Shanti Nayak',
    emergencyContactPhone: '7890123457',
    experience: '5K / 10K Completed Before',
    paymentStatus: 'PAID',
    amountINR: 399,
    razorpayOrderId: 'order_demo_1001',
    razorpayPaymentId: 'pay_demo_1001',
    transactionId: 'pay_demo_1001',
    paymentScreenshotUrl: createSampleUpiProof('Venkat Nayak', 399, '432901928311', '3K Fun Run'),
    ticketId: 'ticket-demo-1001',
    qrToken: 'demo_venkat_3k_1001_qr_token_beachrun2026',
    bibNumber: 1001,
    emailSent: true,
    emailAttempts: 1,
    checkedIn: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'demo-reg-2',
    registrationNumber: 'UBR2026-2001',
    fullName: 'Ramesh Bhat',
    email: 'ramesh.bhat@example.com',
    phone: '9876543210',
    age: 28,
    categoryId: '5k',
    categoryName: '5K Run',
    tshirtSize: 'M',
    emergencyContactName: 'Suma Bhat',
    emergencyContactPhone: '9876543211',
    experience: '5K / 10K Completed Before',
    paymentStatus: 'PAID',
    amountINR: 599,
    razorpayOrderId: 'order_demo_2001',
    razorpayPaymentId: 'pay_demo_2001',
    transactionId: 'pay_demo_2001',
    paymentScreenshotUrl: createSampleUpiProof('Ramesh Bhat', 599, '432901928322', '5K Run'),
    ticketId: 'ticket-demo-2001',
    qrToken: 'demo_ramesh_5k_2001_qr_token_beachrun2026',
    bibNumber: 2001,
    emailSent: true,
    emailAttempts: 1,
    checkedIn: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'demo-reg-3',
    registrationNumber: 'UBR2026-2002',
    fullName: 'Sneha Rao',
    email: 'sneha.rao@example.com',
    phone: '8123456789',
    age: 19,
    categoryId: '5k',
    categoryName: '5K Run',
    tshirtSize: 'XS',
    emergencyContactName: 'Mohan Rao',
    emergencyContactPhone: '8123456790',
    experience: 'First Time Runner (Beginner)',
    paymentStatus: 'PAID',
    amountINR: 599,
    razorpayOrderId: 'order_demo_2002',
    razorpayPaymentId: 'pay_demo_2002',
    transactionId: 'pay_demo_2002',
    paymentScreenshotUrl: createSampleUpiProof('Sneha Rao', 599, '432901928333', '5K Run'),
    ticketId: 'ticket-demo-2002',
    qrToken: 'demo_sneha_5k_2002_qr_token_beachrun2026',
    bibNumber: 2002,
    emailSent: true,
    emailAttempts: 1,
    checkedIn: false,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'demo-reg-4',
    registrationNumber: 'UBR2026-3001',
    fullName: 'Priya Shetty',
    email: 'priya.shetty@example.com',
    phone: '9845021234',
    age: 22,
    categoryId: '10k',
    categoryName: '10K Run',
    tshirtSize: 'S',
    emergencyContactName: 'Raju Shetty',
    emergencyContactPhone: '9845021235',
    experience: 'Half Marathon (21K) / 15K Completed',
    paymentStatus: 'PAID',
    amountINR: 799,
    razorpayOrderId: 'order_demo_3001',
    razorpayPaymentId: 'pay_demo_3001',
    transactionId: 'pay_demo_3001',
    paymentScreenshotUrl: createSampleUpiProof('Priya Shetty', 799, '432901928344', '10K Run'),
    ticketId: 'ticket-demo-3001',
    qrToken: 'demo_priya_10k_3001_qr_token_beachrun2026',
    bibNumber: 3001,
    emailSent: true,
    emailAttempts: 1,
    checkedIn: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'demo-reg-5',
    registrationNumber: 'UBR2026-4001',
    fullName: 'Arjun Kamath',
    email: 'arjun.kamath@example.com',
    phone: '9980012345',
    age: 35,
    categoryId: '15k',
    categoryName: '15K Run',
    tshirtSize: 'L',
    emergencyContactName: 'Deepa Kamath',
    emergencyContactPhone: '9980012346',
    experience: 'Full Marathon / Experienced Runner',
    paymentStatus: 'PAID',
    amountINR: 999,
    razorpayOrderId: 'order_demo_4001',
    razorpayPaymentId: 'pay_demo_4001',
    transactionId: 'pay_demo_4001',
    paymentScreenshotUrl: createSampleUpiProof('Arjun Kamath', 999, '432901928355', '15K Run'),
    ticketId: 'ticket-demo-4001',
    qrToken: 'demo_arjun_15k_4001_qr_token_beachrun2026',
    bibNumber: 4001,
    emailSent: true,
    emailAttempts: 1,
    checkedIn: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'demo-reg-6',
    registrationNumber: 'UBR2026-3002',
    fullName: 'Kiran D\'Souza',
    email: 'kiran.dsouza@example.com',
    phone: '9741234567',
    age: 25,
    categoryId: '10k',
    categoryName: '10K Run',
    tshirtSize: 'M',
    emergencyContactName: 'Mary DSouza',
    emergencyContactPhone: '9741234568',
    experience: '5K / 10K Completed Before',
    paymentStatus: 'PENDING',
    amountINR: 799,
    razorpayOrderId: 'order_demo_pending_3002',
    paymentScreenshotUrl: createSampleUpiProof('Kiran D\'Souza', 799, '432901928366', '10K Run (Manual Transfer)'),
    emailSent: false,
    emailAttempts: 0,
    checkedIn: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

initialDemoRegistrations.forEach(r => inMemoryRegistrations.set(r.id, r));

// ─── Helper: map Supabase row → RegistrationRecord ───────────────────────────

function mapRow(d: any): RegistrationRecord {
  return {
    id: d.id,
    registrationNumber: d.registration_number || d.id,
    fullName: d.full_name || '',
    email: d.email || '',
    phone: d.phone || '',
    age: Number(d.age || 0),
    categoryId: d.category_id || '',
    categoryName: d.category_name || '',
    tshirtSize: d.tshirt_size || 'M',
    emergencyContactName: d.emergency_contact_name || d.emergency_contact || '',
    emergencyContactPhone: d.emergency_contact_phone || '',
    experience: d.experience,
    paymentStatus: d.payment_status || 'PENDING',
    amountINR: Number(d.amount_inr || d.amount_paid || 0),
    razorpayOrderId: d.razorpay_order_id,
    razorpayPaymentId: d.razorpay_payment_id,
    razorpaySignature: d.razorpay_signature,
    transactionId: d.transaction_id,
    paymentScreenshotUrl: d.payment_screenshot_url,
    ticketId: d.ticket_id,
    qrToken: d.qr_token,
    bibNumber: d.bib_number,
    emailSent: d.email_sent || false,
    emailAttempts: d.email_attempts || 0,
    checkedIn: d.checked_in || false,
    checkedInAt: d.checked_in_at,
    checkedInBy: d.checked_in_by,
    manuallyApproved: d.manually_approved || false,
    adminNote: d.admin_note,
    createdAt: d.created_at || new Date().toISOString(),
    updatedAt: d.updated_at || new Date().toISOString(),
    // Legacy compat fields
    status: d.payment_status === 'PAID' ? 'PAID' : d.payment_status === 'FAILED' ? 'FAILED' : 'PENDING',
    amountInr: Number(d.amount_inr || d.amount_paid || 0),
  };
}

// ─── Helper: generate registration number ────────────────────────────────────

function generateRegistrationNumber(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `UBR2026-${digits}`;
}

// ─── Helper: assign bib number ───────────────────────────────────────────────

async function assignBibNumber(categoryId: string): Promise<number> {
  if (supabase) {
    try {
      // Atomic increment using Supabase RPC or update-returning
      const { data, error } = await supabase
        .from('bib_counters')
        .select('next_bib')
        .eq('category_id', categoryId)
        .single();

      if (!error && data) {
        const bib = data.next_bib;
        await supabase
          .from('bib_counters')
          .update({ next_bib: bib + 1 })
          .eq('category_id', categoryId)
          .eq('next_bib', bib); // optimistic lock
        return bib;
      }
    } catch (e) {
      console.warn('[RegistrationService] Bib counter Supabase error, using in-memory');
    }
  }
  const current = inMemoryBibCounters[categoryId] ?? 5001;
  inMemoryBibCounters[categoryId] = current + 1;
  return current;
}

// ─── QR Code Generation ───────────────────────────────────────────────────────

export async function generateQRBuffer(qrToken: string): Promise<Buffer> {
  const content = `BR26.${qrToken}`;
  const buf = await QRCode.toBuffer(content, {
    errorCorrectionLevel: 'Q',
    width: 400,
    margin: 2,
    color: { dark: '#0A0A0A', light: '#FFFFFF' }
  });
  return buf;
}

// ─── Email Sending ────────────────────────────────────────────────────────────

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (
    !host ||
    !user ||
    !pass ||
    user.includes('your-email') ||
    user.includes('example.com') ||
    user.includes('placeholder') ||
    pass.includes('your-16-char') ||
    pass.includes('placeholder')
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

const categoryFlagTimes: Record<string, string> = {
  '3k_fun': '7:00 AM', '5k': '6:30 AM', '10k': '6:00 AM', '15k': '5:30 AM'
};

async function sendTicketEmail(reg: RegistrationRecord, qrBuffer: Buffer): Promise<boolean> {
  const transporter = createTransporter();
  const flagTime = categoryFlagTimes[reg.categoryId] || 'As per schedule';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Beach Run Ticket</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#0A0A0A;">
  <tr>
    <td style="padding:32px 24px 16px;background:linear-gradient(135deg,#FF7A30,#FFB347);text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:36px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">UDUPIPAGES</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:600;letter-spacing:4px;text-transform:uppercase;">BEACH RUN 2026</p>
    </td>
  </tr>
  <tr>
    <td style="padding:24px;background:#111;">
      <p style="color:#FFB347;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 4px;">PAYMENT CONFIRMED ✓</p>
      <h2 style="margin:0 0 16px;color:#F5F3EE;font-size:24px;font-weight:900;">Hi ${reg.fullName}, you're in!</h2>
      <p style="color:#aaa;font-size:14px;margin:0 0 24px;">Your registration is confirmed. Show the QR below at the gate on race day.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="padding:12px;background:#1a1a1a;border-left:3px solid #FF7A30;">
            <p style="margin:0;color:#888;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Category</p>
            <p style="margin:4px 0 0;color:#F5F3EE;font-size:18px;font-weight:700;">${reg.categoryName}</p>
          </td>
          <td style="padding:12px;background:#1a1a1a;border-left:3px solid #FFB347;">
            <p style="margin:0;color:#888;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Flag-Off Time</p>
            <p style="margin:4px 0 0;color:#F5F3EE;font-size:18px;font-weight:700;">${flagTime}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px;background:#161616;border-left:3px solid #ccc;">
            <p style="margin:0;color:#888;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Bib Number</p>
            <p style="margin:4px 0 0;color:#FF7A30;font-size:28px;font-weight:900;">#${reg.bibNumber}</p>
          </td>
          <td style="padding:12px;background:#161616;border-left:3px solid #555;">
            <p style="margin:0;color:#888;font-size:10px;text-transform:uppercase;letter-spacing:2px;">Date & Venue</p>
            <p style="margin:4px 0 0;color:#F5F3EE;font-size:14px;font-weight:700;">6 Dec 2026<br>Padukere Ground, Udupi</p>
          </td>
        </tr>
      </table>

      <div style="text-align:center;padding:24px;background:#1a1a1a;border-radius:8px;margin-bottom:24px;">
        <p style="color:#FF7A30;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px;">YOUR ENTRY QR CODE</p>
        <img src="cid:qr_ticket" alt="QR Code" style="width:240px;height:240px;border:4px solid #FF7A30;display:block;margin:0 auto;">
        <p style="color:#888;font-size:11px;margin:12px 0 0;">QR also attached as PNG — bring printed or on your phone.</p>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #333;margin-bottom:24px;">
        <tr><td style="padding:10px 12px;background:#1a1a1a;">
          <p style="margin:0;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Runner</p>
          <p style="margin:4px 0 0;color:#F5F3EE;font-size:13px;font-weight:600;">${reg.fullName} · Age ${reg.age} · ${reg.tshirtSize} Tee</p>
        </td></tr>
        <tr><td style="padding:10px 12px;background:#111;">
          <p style="margin:0;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Transaction ID</p>
          <p style="margin:4px 0 0;color:#888;font-size:12px;font-family:monospace;">${reg.transactionId || reg.razorpayPaymentId || 'N/A'}</p>
        </td></tr>
        <tr><td style="padding:10px 12px;background:#1a1a1a;">
          <p style="margin:0;color:#666;font-size:10px;text-transform:uppercase;letter-spacing:1px;">Emergency Contact</p>
          <p style="margin:4px 0 0;color:#F5F3EE;font-size:13px;">${reg.emergencyContactName} · ${reg.emergencyContactPhone}</p>
        </td></tr>
      </table>

      <div style="padding:16px;background:#1a0a00;border:1px solid #FF7A30;border-radius:4px;margin-bottom:24px;">
        <p style="margin:0;color:#FFB347;font-size:12px;font-weight:700;">📍 REPORTING INSTRUCTIONS</p>
        <p style="margin:8px 0 0;color:#ccc;font-size:12px;line-height:1.6;">
          Arrive at Padukere Ground at least 30 minutes before flag-off.<br>
          Collect your Bib at the registration desk (show this email or QR code).<br>
          No QR = No Entry. Keep this email safely.
        </p>
      </div>

      <p style="color:#555;font-size:11px;text-align:center;">Questions? Contact us at udupipagesbeachrun@gmail.com</p>
    </td>
  </tr>
</table>
</body>
</html>
`;

  if (!transporter) {
    console.warn('[Email] SMTP not configured. Logging ticket details to console.');
    console.log(`\n📧 TICKET EMAIL (not sent — SMTP missing):\n  To: ${reg.email}\n  Name: ${reg.fullName}\n  Category: ${reg.categoryName}\n  Bib: #${reg.bibNumber}\n  QR Token: BR26.${reg.qrToken}\n  Ticket ID: ${reg.ticketId}\n`);
    return false;
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'noreply@udupipagesbeachrun.com';

  try {
    await transporter.sendMail({
      from: `"Udupipages Beach Run 2026" <${from}>`,
      to: reg.email,
      subject: `🏃 Your Beach Run Ticket — Bib #${reg.bibNumber} | ${reg.categoryName}`,
      html: htmlBody,
      attachments: [
        {
          filename: `BeachRun2026_Ticket_Bib${reg.bibNumber}.png`,
          content: qrBuffer,
          cid: 'qr_ticket'
        }
      ]
    });
    return true;
  } catch (err: any) {
    console.error('[Email] Send failed:', err.message);
    return false;
  }
}

// ─── finalizeTicket ─────────────────────────────────────────────────────────
// Runs ONCE per registration after payment confirmed (idempotent).

export async function finalizeTicket(registrationId: string): Promise<RegistrationRecord | null> {
  // Fetch registration
  let reg: RegistrationRecord | null = null;

  if (supabase) {
    try {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .single();
      if (data) reg = mapRow(data);
    } catch (_) {}
  }
  if (!reg) {
    reg = inMemoryRegistrations.get(registrationId) || null;
  }

  if (!reg) {
    console.error(`[finalizeTicket] Registration ${registrationId} not found`);
    return null;
  }

  // Already finalized — idempotent
  if (reg.ticketId && reg.qrToken) {
    console.log(`[finalizeTicket] Registration ${registrationId} already finalized. Skipping.`);
    return reg;
  }

  const ticketId = randomUUID();
  const qrToken = randomBytes(32).toString('hex'); // 256-bit
  const bibNumber = await assignBibNumber(reg.categoryId);

  // Generate QR PNG
  let qrBuffer: Buffer;
  try {
    qrBuffer = await generateQRBuffer(qrToken);
  } catch (e: any) {
    console.error('[finalizeTicket] QR generation failed:', e.message);
    return null;
  }

  // Update DB
  const now = new Date().toISOString();
  const updatedFields = {
    ticket_id: ticketId,
    qr_token: qrToken,
    bib_number: bibNumber,
    transaction_id: reg.transactionId || reg.razorpayPaymentId,
    updated_at: now
  };

  if (supabase) {
    try {
      const { error } = await supabase
        .from('registrations')
        .update(updatedFields)
        .eq('id', registrationId)
        .is('ticket_id', null); // only update if not already finalized
      if (error) {
        console.error('[finalizeTicket] DB update error:', error.message);
      }
    } catch (e: any) {
      console.error('[finalizeTicket] DB update error:', e.message);
    }
  }

  // Always update in-memory cache as well
  const existing = inMemoryRegistrations.get(registrationId);
  if (existing && !existing.ticketId) {
    existing.ticketId = ticketId;
    existing.qrToken = qrToken;
    existing.bibNumber = bibNumber;
    existing.transactionId = existing.transactionId || existing.razorpayPaymentId;
    existing.updatedAt = now;
    inMemoryRegistrations.set(registrationId, existing);
  }

  const updatedReg: RegistrationRecord = {
    ...reg,
    ticketId,
    qrToken,
    bibNumber,
    transactionId: reg.transactionId || reg.razorpayPaymentId
  };

  // Send email (with retry)
  let emailSent = false;
  let emailAttempts = reg.emailAttempts || 0;

  for (let attempt = 1; attempt <= 3; attempt++) {
    emailAttempts++;
    try {
      emailSent = await sendTicketEmail(updatedReg, qrBuffer);
      if (emailSent) break;
    } catch (e: any) {
      console.warn(`[finalizeTicket] Email attempt ${attempt} failed:`, e.message);
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }

  // Update email status in DB
  if (supabase) {
    await supabase
      .from('registrations')
      .update({
        email_sent: emailSent,
        email_sent_at: emailSent ? new Date().toISOString() : null,
        email_attempts: emailAttempts,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId);
  } else {
    const r = inMemoryRegistrations.get(registrationId);
    if (r) {
      r.emailSent = emailSent;
      r.emailAttempts = emailAttempts;
      inMemoryRegistrations.set(registrationId, r);
    }
  }

  updatedReg.emailSent = emailSent;
  updatedReg.emailAttempts = emailAttempts;

  console.log(`[finalizeTicket] ✅ Ticket finalized for ${reg.fullName} | Bib #${bibNumber} | Email sent: ${emailSent}`);
  return updatedReg;
}

// ─── RegistrationService class ───────────────────────────────────────────────

export class RegistrationService {

  /** Generate unique registration number */
  private static generateRegistrationNumber(): string {
    return generateRegistrationNumber();
  }

  /** Create a new PENDING registration */
  static async createRegistration(data: {
    fullName: string;
    email: string;
    phone: string;
    age: number;
    categoryId: string;
    categoryName: string;
    tshirtSize: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    experience?: string;
    amountINR: number;
    razorpayOrderId?: string;
  }): Promise<RegistrationRecord> {
    const id = randomUUID();
    const registrationNumber = this.generateRegistrationNumber();
    const now = new Date().toISOString();

    const record: RegistrationRecord = {
      id,
      registrationNumber,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      age: data.age,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      tshirtSize: data.tshirtSize,
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      experience: data.experience,
      paymentStatus: 'PENDING',
      amountINR: data.amountINR,
      razorpayOrderId: data.razorpayOrderId,
      emailSent: false,
      emailAttempts: 0,
      checkedIn: false,
      createdAt: now,
      updatedAt: now
    };

    if (supabase) {
      try {
        const { error } = await supabase.from('registrations').insert({
          id: record.id,
          registration_number: record.registrationNumber,
          full_name: record.fullName,
          email: record.email,
          phone: record.phone,
          age: record.age,
          category_id: record.categoryId,
          category_name: record.categoryName,
          tshirt_size: record.tshirtSize,
          emergency_contact_name: record.emergencyContactName,
          emergency_contact_phone: record.emergencyContactPhone,
          experience: record.experience,
          payment_status: 'PENDING',
          amount_inr: record.amountINR,
          razorpay_order_id: record.razorpayOrderId,
          email_sent: false,
          email_attempts: 0,
          checked_in: false,
          created_at: now,
          updated_at: now
        });

        if (error) {
          console.error('[RegistrationService] Insert error, using in-memory:', error.message);
          inMemoryRegistrations.set(record.id, record);
        } else {
          console.log(`[RegistrationService] Created registration ${record.registrationNumber}`);
        }
      } catch (err: any) {
        console.error('[RegistrationService] Exception, using in-memory:', err.message);
        inMemoryRegistrations.set(record.id, record);
      }
    } else {
      inMemoryRegistrations.set(record.id, record);
    }

    return record;
  }

  /** Mark registration as PAID (idempotent) */
  static async markAsPaid(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature?: string
  ): Promise<RegistrationRecord | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .update({
            payment_status: 'PAID',
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            transaction_id: razorpayPaymentId,
            updated_at: new Date().toISOString()
          })
          .eq('razorpay_order_id', razorpayOrderId)
          .select()
          .single();

        if (!error && data) {
          const reg = mapRow(data);
          console.log(`[RegistrationService] Marked ${reg.registrationNumber} as PAID`);
          return reg;
        } else if (error) {
          console.warn('[RegistrationService] markAsPaid error:', error.message);
        }
      } catch (err: any) {
        console.error('[RegistrationService] markAsPaid exception:', err.message);
      }
    }

    // In-memory fallback
    for (const [id, reg] of inMemoryRegistrations.entries()) {
      if (reg.razorpayOrderId === razorpayOrderId) {
        reg.paymentStatus = 'PAID';
        reg.razorpayPaymentId = razorpayPaymentId;
        reg.transactionId = razorpayPaymentId;
        reg.updatedAt = new Date().toISOString();
        inMemoryRegistrations.set(id, reg);
        return reg;
      }
    }
    return null;
  }

  /** Find registration by Razorpay order ID */
  static async findByOrderId(razorpayOrderId: string): Promise<RegistrationRecord | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('razorpay_order_id', razorpayOrderId)
          .single();
        if (!error && data) return mapRow(data);
      } catch (_) {}
    }
    for (const reg of inMemoryRegistrations.values()) {
      if (reg.razorpayOrderId === razorpayOrderId) return reg;
    }
    return null;
  }

  /** Find registration by ID */
  static async findById(id: string): Promise<RegistrationRecord | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return mapRow(data);
      } catch (_) {}
    }
    return inMemoryRegistrations.get(id) || null;
  }

  /** Lookup by any identifier: id, ticketId, qrToken, paymentId, transactionId, registrationNumber, orderId */
  static async lookupByAnyId(token: string): Promise<RegistrationRecord | null> {
    const clean = token.trim();
    // Strip BR26. prefix if present
    const qrContent = clean.startsWith('BR26.') ? clean.replace('BR26.', '') : null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .or([
            `id.eq.${clean}`,
            `qr_token.eq.${qrContent || clean}`,
            `ticket_id.eq.${clean}`,
            `razorpay_payment_id.eq.${clean}`,
            `transaction_id.eq.${clean}`,
            `registration_number.eq.${clean}`,
            `razorpay_order_id.eq.${clean}`
          ].join(','));

        if (!error && data && data.length > 0) return mapRow(data[0]);
      } catch (e: any) {
        console.warn('[RegistrationService] lookupByAnyId error:', e.message);
        // Fall through to in-memory
      }
    }

    // In-memory
    const lookupToken = qrContent || clean;
    for (const reg of inMemoryRegistrations.values()) {
      if (
        reg.id === clean ||
        reg.qrToken === lookupToken ||
        reg.ticketId === clean ||
        reg.razorpayPaymentId === clean ||
        reg.transactionId === clean ||
        reg.registrationNumber === clean ||
        reg.razorpayOrderId === clean
      ) {
        return reg;
      }
    }
    return null;
  }

  /** Atomic check-in — returns success only once */
  static async atomicCheckIn(
    token: string,
    adminId: string,
    method: 'QR' | 'MANUAL'
  ): Promise<CheckInResult> {
    const clean = token.trim();
    const qrContent = clean.startsWith('BR26.') ? clean.replace('BR26.', '') : clean;

    // Lookup the registration
    const reg = await this.lookupByAnyId(clean);

    // Log helper
    const logAttempt = async (
      registrationId: string | null,
      result: CheckInResult['result']
    ) => {
      if (supabase) {
        await supabase.from('checkin_logs').insert({
          registration_id: registrationId,
          scanned_token: clean,
          method,
          result,
          admin_id: adminId,
          created_at: new Date().toISOString()
        }).select();
      }
      console.log(`[CheckIn] ${result} | Token: ${clean.slice(0, 20)}... | Admin: ${adminId}`);
    };

    if (!reg) {
      await logAttempt(null, 'INVALID');
      return { success: false, result: 'INVALID', message: 'No registration found for this token.' };
    }

    if (reg.paymentStatus !== 'PAID') {
      await logAttempt(reg.id, 'UNPAID');
      return {
        success: false,
        result: 'UNPAID',
        registration: reg,
        message: `Payment not confirmed. Status: ${reg.paymentStatus}`
      };
    }

    if (reg.checkedIn) {
      await logAttempt(reg.id, 'DUPLICATE');
      return {
        success: false,
        result: 'DUPLICATE',
        registration: reg,
        message: `Runner already checked in at ${reg.checkedInAt}`,
        firstCheckedInAt: reg.checkedInAt
      };
    }

    // Atomic update
    const checkedInAt = new Date().toISOString();
    if (supabase) {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          checked_in: true,
          checked_in_at: checkedInAt,
          checked_in_by: adminId,
          updated_at: checkedInAt
        })
        .eq('id', reg.id)
        .eq('checked_in', false) // atomic: only update if not already checked in
        .select()
        .single();

      if (error || !data) {
        // Race condition — someone else checked in first
        await logAttempt(reg.id, 'DUPLICATE');
        return {
          success: false,
          result: 'DUPLICATE',
          registration: reg,
          message: 'Runner was checked in by another device simultaneously.'
        };
      }

      const updatedReg = mapRow(data);
      await logAttempt(reg.id, 'SUCCESS');
      return { success: true, result: 'SUCCESS', registration: updatedReg, message: 'Check-in successful!' };
    } else {
      // In-memory atomic check
      const existing = inMemoryRegistrations.get(reg.id);
      if (!existing || existing.checkedIn) {
        await logAttempt(reg.id, 'DUPLICATE');
        return { success: false, result: 'DUPLICATE', registration: reg, message: 'Already checked in.' };
      }
      existing.checkedIn = true;
      existing.checkedInAt = checkedInAt;
      existing.checkedInBy = adminId;
      inMemoryRegistrations.set(reg.id, existing);
      await logAttempt(reg.id, 'SUCCESS');
      return { success: true, result: 'SUCCESS', registration: existing, message: 'Check-in successful!' };
    }
  }

  /** Get all registrations for admin */
  static async getAllRegistrations(): Promise<{
    source: 'supabase' | 'in_memory';
    registrations: RegistrationRecord[];
  }> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return { source: 'supabase', registrations: data.map(mapRow) };
        } else if (error) {
          console.warn('[RegistrationService] getAllRegistrations error:', error.message);
        }
      } catch (err: any) {
        console.error('[RegistrationService] getAllRegistrations exception:', err.message);
      }
    }

    const records = Array.from(inMemoryRegistrations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return { source: 'in_memory', registrations: records };
  }

  /** Get check-in count */
  static async getCheckedInCount(): Promise<number> {
    if (supabase) {
      try {
        const { count } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('checked_in', true)
          .eq('payment_status', 'PAID');
        return count || 0;
      } catch (_) {}
    }
    return Array.from(inMemoryRegistrations.values()).filter(r => r.checkedIn && r.paymentStatus === 'PAID').length;
  }

  /** Save screenshot URL to registration */
  static async saveScreenshotUrl(registrationId: string, url: string): Promise<void> {
    if (supabase) {
      await supabase
        .from('registrations')
        .update({
          payment_screenshot_url: url,
          screenshot_uploaded_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId);
    } else {
      const reg = inMemoryRegistrations.get(registrationId);
      if (reg) {
        reg.paymentScreenshotUrl = url;
        inMemoryRegistrations.set(registrationId, reg);
      }
    }
  }

  /** Manually approve a registration (admin action) */
  static async manuallyApprove(
    registrationId: string,
    adminId: string,
    note: string
  ): Promise<RegistrationRecord | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('registrations')
        .update({
          payment_status: 'PAID',
          manually_approved: true,
          manually_approved_by: adminId,
          manually_approved_at: new Date().toISOString(),
          admin_note: note,
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)
        .select()
        .single();
      if (!error && data) {
        const reg = mapRow(data);
        await finalizeTicket(registrationId);
        return reg;
      }
    } else {
      const reg = inMemoryRegistrations.get(registrationId);
      if (reg) {
        reg.paymentStatus = 'PAID';
        reg.manuallyApproved = true;
        reg.adminNote = note;
        inMemoryRegistrations.set(registrationId, reg);
        await finalizeTicket(registrationId);
        return reg;
      }
    }
    return null;
  }

  /** Resend ticket email */
  static async resendTicketEmail(registrationId: string): Promise<boolean> {
    const reg = await this.findById(registrationId);
    if (!reg || !reg.qrToken || reg.paymentStatus !== 'PAID') return false;

    const qrBuffer = await generateQRBuffer(reg.qrToken);
    const sent = await sendTicketEmail(reg, qrBuffer);

    if (supabase) {
      await supabase
        .from('registrations')
        .update({
          email_sent: sent,
          email_sent_at: sent ? new Date().toISOString() : undefined,
          email_attempts: (reg.emailAttempts || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId);
    }
    return sent;
  }

  /** Check webhook idempotency */
  static async isWebhookProcessed(eventId: string): Promise<boolean> {
    if (supabase) {
      try {
        const { data } = await supabase
          .from('webhook_events')
          .select('id')
          .eq('razorpay_event_id', eventId)
          .single();
        return !!data;
      } catch (_) {}
    }
    return inMemoryWebhookEvents.has(eventId);
  }

  /** Mark webhook as processed */
  static async markWebhookProcessed(eventId: string, eventType: string, payload: any): Promise<void> {
    if (supabase) {
      await supabase.from('webhook_events').insert({
        razorpay_event_id: eventId,
        event_type: eventType,
        payload,
        processed_at: new Date().toISOString()
      }).select();
    }
    inMemoryWebhookEvents.add(eventId);
  }
}
