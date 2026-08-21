# AGENTS.md — Udupipages Beach Run 2026

## Stack (do not deviate without asking)
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion (with GSAP + ScrollTrigger for the hero pin/parallax specifically)
- Backend: Node.js + Express + TypeScript
- DB: PostgreSQL via Supabase
- Payments: Razorpay (Orders API + Checkout + webhook signature verification)
- Deploy target: Vercel (frontend), Render (backend) — assume Render's IPv6 pooler quirk with Supabase; always connect via the transaction pooler on port 6543, not the direct connection string

## Conventions
- Always use TypeScript, never plain JS
- Functional components only, no class components
- Never hardcode API keys, Razorpay secrets, or DB credentials — always process.env, with a committed .env.example
- Mobile-first responsive; test at 375px, 768px, 1440px
- Respect prefers-reduced-motion — every scroll/parallax animation needs a reduced-motion fallback (static, no motion)
- Write a README.md with setup + env var instructions as the last step of every task

## Design language
- Palette: near-black background (#0A0A0A), warm gradient accent running amber→burnt-orange (#FF7A30 → #FFB347, sampled from the dune/sunset reference), off-white text (#F5F3EE). No pastels, no rounded "friendly-app" UI — this is athletic/editorial, not cute.
- Display headline typeface: bold, ultra-condensed, heavy-cut sans (reference: "THUNDER" Awwwards typeface) — use a free equivalent like Anton, Archivo Black, or Clash Display (Fontshare), self-hosted or via Google Fonts/Fontshare.
- Body typeface: clean grotesk (Inter or Satoshi).
- Photography style: moody, atmospheric, documentary — like editorial trail-running photography, not stock-photo bright/cheery.
