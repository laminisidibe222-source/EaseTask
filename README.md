# 🌱 EaseTask — Smart Land Fertility & Cultivation Planner

A SaaS where a farmer uploads **one photo of their land** and gets:
- an instant **fertility score** (0–100) with soil metrics (organic matter, moisture, vegetation cover, pH estimate)
- **recommended crops** tuned to the West-African / Sahelian climate (millet, sorghum, groundnut, cowpea, maize, rice, sesame…)
- a **week-by-week cultivation plan** (land prep → sowing → weeding → irrigation → harvest)

Built with **React + Vite + Tailwind + Supabase + Lemon Squeezy**.

---

## ✨ Features

| Page | What it does |
|---|---|
| `/` Landing | Hero, features, how-it-works, CTA |
| `/signup` `/login` | Email/password auth via Supabase (split-screen design) |
| `/dashboard` | Photo upload (drag & drop + camera), live on-device analysis, report, history, usage meter |
| `/pricing` | Free / Starter ($4.99) / Pro ($12.99) plans with checkout |

Analysis runs **entirely in the browser** (canvas pixel sampling → ExG greenness, soil luminance, moisture proxy, texture variance). No ML backend needed to demo. Swap in a real vision API in `src/lib/analysis.js` for production accuracy.

---

## 🚀 Quick start

```bash
cd easetask
npm install
cp .env.example .env      # then fill in your keys (see below)
npm run dev               # http://localhost:5173
```

**No keys?** The app automatically runs in **demo mode** (auto-logged-in demo user, history saved to localStorage) so you can explore everything immediately.

---

## 🔑 1. Supabase setup (free tier)

1. Create a project at <https://supabase.com> (free).
2. **SQL Editor** → paste everything from `supabase/schema.sql` → Run.
3. **Project Settings → API** → copy `Project URL` and `anon public` key into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
4. **Authentication → Providers → Email** — enable. (Turn off "Confirm email" for faster local testing.)

---

## 💳 2. Payment — for someone in Senegal WITHOUT a company

You said you can't use Paydunya and don't have a registered company. The right answer is a **Merchant-of-Record (MoR)** platform: they become the legal seller, handle taxes/fraud/chargebacks, accept global cards, and pay *you* out. **No company registration required** — individuals / sole traders are accepted.

**Recommended: Lemon Squeezy** (also works: Paddle).

1. Sign up at <https://lemonsqueezy.com> → choose **Individual / Sole trader**. Verify your ID.
2. **Store → Products** → create two subscription products:
   - `Starter` — $4.99/month
   - `Pro` — $12.99/month
3. Open each product → **Checkout URL** → copy into `.env`:
   ```
   VITE_PAYMENT_STARTER_URL=https://yourstore.lemonsqueezy.com/checkout/buy/xxxx
   VITE_PAYMENT_PRO_URL=https://yourstore.lemonsqueezy.com/checkout/buy/yyyy
   ```
4. Payouts: connect **Wise** (works to Senegal) or a bank account. Mobile money can be received via Wise → local wallet in many cases.
5. **To auto-upgrade the user's plan after payment**: create a free Supabase Edge Function that listens to Lemon Squeezy `subscription_created` webhooks and runs `update profiles set plan='pro' where email = <customer email>`. (Client-side limits are a UX guard; enforce plan limits server-side via RLS / Edge Function.)

> Alternative if you want local mobile-money (Wave/Orange Money) later: add **Flutterwave** or **Paystack** alongside — but they typically require a business entity. Lemon Squeezy is the fastest path with zero paperwork.

---

## 📁 Project structure

```
easetask/
├── index.html
├── package.json
├── .env.example
├── supabase/schema.sql        # run once in Supabase SQL editor
└── src/
    ├── main.jsx, App.jsx      # router + protected routes
    ├── index.css              # Tailwind + design tokens
    ├── context/AuthContext.jsx
    ├── lib/
    │   ├── supabase.js        # client + demo-mode fallback
    │   ├── analysis.js        # on-device fertility engine + crop DB
    │   └── payment.js         # plans + Lemon Squeezy checkout helper
    ├── components/            # Logo, Navbar, Footer, Spinner, AnalysisReport
    └── pages/                 # Landing, Login, Signup, Dashboard, Pricing, AuthLayout
```

---

## ⚠️ Important note

The photo analysis is a **heuristic estimate** (clearly labelled in the UI). For production-grade accuracy, plug a real vision/soil model into `analyzeLand()` in `src/lib/analysis.js` — the rest of the app stays unchanged. Always advise users to confirm critical decisions with a laboratory soil test.

---

## 📜 Scripts

- `npm run dev` — dev server
- `npm run build` — production build → `dist/`
- `npm run preview` — preview the build

Deploy `dist/` to Vercel / Netlify / Cloudflare Pages (all free). Add the same env vars in your host's dashboard.
