# Udupipages Beach Run 2026 — Master Full-Stack Application

Production-ready marketing and registration full-stack web application for **Udupipages Beach Run** held on **10th January 2027** in Udupi, India (Padukere Ground ➔ Kaup Beach).

> 📘 **Master Deployment & Future Reference Docs**: See [PROJECT_DOCUMENTATION.md](file:///c:/Users/mrcyb/OneDrive/Desktop/project/runner/PROJECT_DOCUMENTATION.md) for live production URLs, Vercel & Render configurations, environment variables, database schema, and deployment architecture details.

---


## 🏗️ Repository Architecture

This repository is structured into two main applications:
- **`/client`**: Vite + React 18 + TypeScript + Tailwind CSS + GSAP (ScrollTrigger) + Framer Motion.
- **`/server`**: Node.js + Express + TypeScript + Razorpay Orders API/Checkout/Webhooks + Supabase PostgreSQL.

---

## ⚡ Quick Start (Local Setup)

### 1. Install Server & Client Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` files to `.env` in both folders:

```bash
# Server Environment Setup
cp server/.env.example server/.env

# Client Environment Setup
cp client/.env.example client/.env
```

#### Server Environment Variables (`/server/.env`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Razorpay Credentials (Test Mode)
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpayTestSecretHere
RAZORPAY_WEBHOOK_SECRET=YourRazorpayWebhookSecretHere

# Supabase PostgreSQL Database (Port 6543 Pooler for IPv6 / Render compatibility)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

#### Client Environment Variables (`/client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
```

---

### 3. Run Development Servers

**Option A (Single Command from Root):**
```bash
# Run both Server (port 5000) and Client (port 5173) concurrently:
npm run dev
```

**Option B (Separate Terminals):**
```bash
# Terminal 1: Start Express API Server (Port 5000)
cd server
npm run dev

# Terminal 2: Start Vite React App (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 💳 Razorpay Test vs. Live Mode Setup

1. **Test Mode (Development):**
   - Use test keys generated in your [Razorpay Dashboard](https://dashboard.razorpay.com/) beginning with `rzp_test_...`.
   - Free categories (3K Fun Run) bypass Razorpay completely.
   - Paid categories (5K, 10K, 15K) trigger Razorpay Checkout popup using test card / UPI details.
2. **Live Mode (Production):**
   - Update `RAZORPAY_KEY_ID` to `rzp_live_...` and set `RAZORPAY_KEY_SECRET` in `/server/.env`.
   - Update `VITE_RAZORPAY_KEY_ID` in `/client/.env`.
   - Configure category prices in `/server/src/config/categories.ts`.

---

## 🗄️ Supabase PostgreSQL Schema

To set up the `registrations` table in Supabase, run the following SQL query in the Supabase SQL Editor:

```sql
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL,
    category_id TEXT NOT NULL,
    category_name TEXT NOT NULL,
    tshirt_size VARCHAR(10) NOT NULL,
    emergency_contact TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    amount_paid INTEGER NOT NULL DEFAULT 0,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

> ⚠️ **Deployment Note:** If deploying backend to Render, connect using Supabase transaction pooler on **port 6543** to prevent IPv6 network resolution quirks.

---

## 🎬 Hero Video Asset Reminder

- The hero section uses `/client/public/videos/hero.mp4` with poster fallback.
- Ensure all baked-in text overlay frames are stripped from the raw MP4 video prior to production deployment (all event copy is rendered kinetically via HTML/CSS).

---

## 🚀 Deployment Guide

### Backend: Deployed to Vercel / Render
- Entry Point: `server/api/index.ts`
- Configuration: `server/vercel.json`
- Environment Variables:
  - `PORT`: `5000`
  - `CLIENT_URL`: `https://beach-run.onrender.com`
  - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Frontend: Deployed to Render (Static Site)
- Root Directory: `client`
- Build Command: `npm run build` (or `npm install && npm run build`)
- Publish Directory: `dist`
- **SPA Rewrites (Crucial for `/admin` direct access)**:
  - Automatically handled via [`client/public/_redirects`](file:///c:/Users/mrcyb/OneDrive/Desktop/project/runner/client/public/_redirects) (or [`client/vercel.json`](file:///c:/Users/mrcyb/OneDrive/Desktop/project/runner/client/vercel.json) on Vercel).
  - In Render Dashboard -> Your Static Site -> **Redirects/Rewrites**:
    - **Source**: `/*`
    - **Destination**: `/index.html`
    - **Action**: `Rewrite`
- Environment Variables in Render Dashboard:
  - `VITE_API_BASE_URL`: `https://beach-run-api.onrender.com/api`
  - `VITE_RAZORPAY_KEY_ID`: `rzp_test_...` (or `rzp_live_...`)

> 💡 **Admin Panel Access**: You can access the admin dashboard via direct URL (`/admin`), hash URL (`/#admin`), or the Admin button in the navigation. The SPA includes fallback redirection handling for static servers.

---

## 🎟️ Payments, Tickets & Gate Check-In

### 1. Payment & Registration Flow
1. **Runner Registration**: User selects race category (3K ₹399, 5K ₹599, 10K ₹799, 15K ₹999) and enters details.
   - Age validation is strictly enforced both client and server-side:
     - 3K: All ages
     - 5K: Minimum age 12
     - 10K: Minimum age 16
     - 15K: Minimum age 18
2. **Razorpay Order Creation**: `POST /api/registrations` creates a pending registration and opens Razorpay Checkout.
3. **Payment Verification & Webhook**:
   - Client calls `POST /api/payments/verify` with HMAC-SHA256 signature verification.
   - Webhook `POST /api/webhooks/razorpay` captures `payment.captured` & `order.paid` events idempotently.
4. **Ticket Finalization (`finalizeTicket`)**:
   - Generates a crypto-random 256-bit QR token (`BR26.<token>`) without exposing raw PII.
   - Auto-assigns category-specific Bib numbers (3K: 1000+, 5K: 2000+, 10K: 3000+, 15K: 4000+).
   - Generates high-res QR code PNG buffer.
   - Sends responsive HTML confirmation email via Nodemailer with inline CID attachment and reporting instructions.

### 2. Admin Panel & Gate Scanner
- **Access**: Open `/admin` or click "ADMIN ACCESS" in header / footer.
- **Authentication**: JWT authentication with `httpOnly` secure cookies.
- **Updating Admin Credentials**:
  - Update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`.
  - Run `npx tsx scripts/update-admin.ts` (or `npm run` from `server`) to sync the bcrypt password hash to the Supabase `admins` database table.
- **Dashboard Tab**:
  - Live revenue, total registrations, category breakdowns, and check-in counters.
- **Runners Tab**:
  - Searchable by name, email, phone, ticket ID, or transaction ID.
  - Filter by category, payment status, or checked-in status.
  - **Edit Runner**: Modify runner details, category, bib number, t-shirt size, payment status, check-in state, emergency contact, and admin notes via modal (`PUT /api/admin/registrations/:id`).
  - **Delete Runner**: Permanently delete registrations and audit logs with a safety confirmation modal (`DELETE /api/admin/registrations/:id`).
  - View payment proof screenshots, resend ticket emails, or trigger manual approval.
  - CSV Export.
- **Gate Scanner Tab (`/admin/scanner`)**:
  - Real-time camera scanner via `html5-qrcode` (rear camera preferred).
  - Atomic database check-in: `UPDATE ... WHERE qrToken = ? AND checkedIn = false AND paymentStatus = 'PAID'`.
  - Immediate visual & audio feedback:
    - 🟢 **VALID — CHECKED IN**: Displays runner details, bib number, emergency contact, t-shirt size.
    - 🔴 **ALREADY CHECKED IN**: Shows time of original scan to prevent ticket sharing.
    - 🔴 **INVALID QR / UNPAID**: Rejects unconfirmed or counterfeit passes.
  - Manual fallback search bar: supports Bib number, ticket ID, QR token, or Razorpay payment ID.

### 3. Automated Test Suite & Scripts
```bash
# Run unit and integration tests (38 tests)
npm test --prefix server

# Seed 5 PAID runners + 1 PENDING runner for testing
npm run seed --prefix server

# Simulate Razorpay payment.captured webhook locally
npm run simulate-webhook --prefix server <order_id> [payment_id]

# Run comprehensive Webhook diagnostic suite (signatures, failures, idempotency)
npm run test:webhook --prefix server

# Test SMTP email connection and send a test email
npm run test:smtp --prefix server [recipient_email]

# Verify database connection and view registered count
npm run db:check --prefix server

# Query database records via Prisma ORM
npm run db:prisma --prefix server

# Launch Prisma Studio web GUI
cd server && npx prisma studio
```

---

## 📧 SMTP Email Configuration

For sending automated registration tickets with QR codes to runners:

```env
# In /server/.env (and Vercel Dashboard for Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
MAIL_FROM=Udupipages Beach Run 2026 <your-email@gmail.com>
```

> 💡 **Gmail Tip**: Use a 16-character Google **App Password** (generated from [Google Account Security ➔ App Passwords](https://myaccount.google.com/apppasswords)) with 2-Step Verification enabled, rather than your standard account login password.

---

## 🤝 Partners & External Redirects

The Partners section features official event partners with interactive redirect links (`target="_blank"` with `rel="noopener noreferrer"`):
- **Udupi Pages** (Organizing & Media Partner): [`https://www.udupipages.in/`](https://www.udupipages.in/) — Asset: `client/public/images/partners/udupipages.jpg`
- **TechNetMark** (Technology & Digital Partner): [`https://www.technetmark.com/`](https://www.technetmark.com/) — Asset: `client/public/images/partners/technetmark.jpg`

---

## 📰 Official Blog & Dedicated Pages

The blog section and three dedicated article pages feature the complete training, environmental, and event guides:
1. **Conquering the Sand: Top Training Tips for the Udupipages Beach Run 2026**
   - URL Route: `/#training-tips` or `/#conquering-the-sand` or `/#blog-page-conquering-the-sand`
   - Component: `client/src/components/pages/TrainingTipsPage.tsx`
2. **Run for Health, Run for Our Beaches: How Your Footsteps Help Protect Udupi’s Coast**
   - URL Route: `/#health-and-beaches` or `/#run-for-health` or `/#blog-page-run-for-health-protect-beaches`
   - Component: `client/src/components/pages/HealthAndBeachesPage.tsx`
3. **Why Udupi’s Coastline is Calling You: 5 Reasons to Register for the Udupipages Beach Run 2026**
   - URL Route: `/#why-coastline-calling` or `/#why-udupis-coastline-is-calling-you` or `/#blog-page-why-udupis-coastline-is-calling-you`
   - Component: `client/src/components/pages/WhyCoastlineCallingPage.tsx`

Centralized Data Store: [`client/src/data/blogArticles.ts`](client/src/data/blogArticles.ts)
Dedicated Article Reader: [`client/src/components/BlogPostDetail.tsx`](client/src/components/BlogPostDetail.tsx)
