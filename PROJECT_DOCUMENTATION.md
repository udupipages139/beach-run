# 🏆 Udupipages Beach Run 2026 — Master Deployment & Project Documentation

> **Last Updated:** August 8, 2026  
> **Event Date:** December 6, 2026  
> **Location:** Udupi, Karnataka, India (Padukere Ground ➔ Kaup Beach)

---

## 🌐 Live Production Links & Services

| Service | Platform | Live URL / Endpoint | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Application** | Render | [https://beach-run.onrender.com/](https://beach-run.onrender.com/) | 🟢 Active |
| **Backend API Server** | Vercel | [https://beach-run-api.onrender.com/api](https://beach-run-api.onrender.com/api) | 🟢 Active |
| **API Health Check** | Vercel | [https://beach-run-api.onrender.com/api/health](https://beach-run-api.onrender.com/api/health) | 🟢 Active |

---

## 🚀 Accomplishments & Work Summary

### 1. Frontend Web Application (`/client`)
- **Technology Stack**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP (ScrollTrigger).
- **Design System**: Athletic editorial aesthetic with dark background (`#0A0A0A`), warm amber-sunset accent (`#FF7A30` ➔ `#FFB347`), Clash Display headlines, and Satoshi body text.
- **Features Implemented**:
  - Kinetic hero section with fallback video support.
  - Interactive event counter & countdown timer.
  - Category selector (3K Fun Run [Free], 5K Coastal Run, 10K Beach Sprint, 15K Challenge).
  - Razorpay Modal Checkout integration for paid categories.
  - Full accessibility compliance and reduced-motion fallbacks.

### 2. Backend API Server (`/server`)
- **Technology Stack**: Node.js, Express, TypeScript, Razorpay Node SDK, Supabase JS Client.
- **Vercel Serverless Integration**:
  - Added Vercel serverless entry file [`server/api/index.ts`](file:///c:/Users/mrcyb/OneDrive/Desktop/project/runner/server/api/index.ts).
  - Added routing configuration [`server/vercel.json`](file:///c:/Users/mrcyb/OneDrive/Desktop/project/runner/server/vercel.json).
- **Features Implemented**:
  - `/api/health`: Health status monitoring.
  - `/api/orders`: Razorpay order creation endpoint.
  - `/api/orders/verify`: Payment signature verification.
  - `/api/orders/webhook`: Webhook listener for payment events.
  - Dual registration persistence (Supabase PostgreSQL + In-memory store fallback).

### 3. Deployments & Infrastructure Configuration
- **Backend on Vercel**: Configured serverless Express API function running on Node.js 20 environment.
- **Frontend on Render**: Deployed static Vite SPA with `/* ➔ /index.html` rewrite rules for seamless routing.
- **Render Blueprint**: Created root [`render.yaml`](file:///c:/Users/mrcyb/OneDrive/Desktop/project/runner/render.yaml) for zero-config blueprint deployments.

---

## 🔑 Environment Variables Reference

### Backend (`Vercel Dashboard > Settings > Environment Variables`)

| Variable Name | Example / Description |
| :--- | :--- |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://beach-run.onrender.com` |
| `RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay API Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | Your Razorpay Webhook Secret |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase Anon Key |

> 📌 **Supabase Port Note**: Use Supabase Transaction Pooler connection string on port `6543` for cloud hosting compatibility.

### Frontend (`Render Dashboard > Environment Variables`)

| Variable Name | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://beach-run-api.onrender.com/api` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_...` or `rzp_live_...` |

---

## 🗄️ Database Schema (Supabase SQL)

Run this SQL query in the Supabase SQL Editor to initialize the registrations table:

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

---

## 💻 Local Development Commands

To run the project locally for future updates:

```bash
# Clone and install dependencies
git clone <your-repo-url>
cd runner

# Install client & server packages
cd server && npm install
cd ../client && npm install
cd ..

# Run dev servers concurrently
npm run dev:server    # Runs backend on http://localhost:5000
npm run dev:client    # Runs frontend on http://localhost:5173
```
