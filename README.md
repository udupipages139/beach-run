# Udupipages Beach Run 2026 — Master Full-Stack Application

Production-ready marketing and registration full-stack web application for **Udupipages Beach Run 2026** held on **6th December 2026** in Udupi, India (Padukere Ground ➔ Kaup Beach).

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

Run backend and frontend in separate terminal windows:

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
- Redirect / Rewrite Rule: `/*` -> `/index.html` (Action: `Rewrite`)
- Environment Variables in Render Dashboard:
  - `VITE_API_BASE_URL`: `https://beach-run-api.onrender.com/api`
  - `VITE_RAZORPAY_KEY_ID`: `rzp_test_...` (or `rzp_live_...`)


