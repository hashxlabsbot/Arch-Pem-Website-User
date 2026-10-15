# ARC PEM — Marketing & User Website

The public marketing site, self-serve signup, checkout, and customer dashboard for **ARC PEM** — a Windows/Mac desktop application that helps architects, construction firms, and contractors turn drawings into BOQs, track site expenses, manage vendors/labour, and export GST-ready reports.

This app is the **customer-facing half** of the ARC PEM product. It sells one-year licenses, issues accounts, and lets existing customers manage their subscription and download the desktop installer. It does **not** run the desktop app itself — that's a separate product installed on the customer's machine.

Built with Next.js 14 (App Router), TypeScript, Prisma/PostgreSQL, NextAuth, and Razorpay.

---

## Table of contents

- [How this fits together](#how-this-fits-together)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Security model](#security-model)
- [Payments](#payments)
- [Free tools](#free-tools)
- [Deployment](#deployment)

---

## How this fits together

ARC PEM is split across (at least) two applications that **share one PostgreSQL database**:

| App | Role |
|---|---|
| **This repo** (`Arch-Pem-Website-User`) | Public marketing site, pricing, free tools, self-serve registration (email OTP), login, Razorpay checkout, and the logged-in customer dashboard (downloads, subscription, settings, support). |
| **Arc-Pem-Admin** (separate repo) | Owns the Prisma schema and all migrations. Runs the internal admin panel: creates/suspends users, manages plans, issues machine licenses, and owns `planExpiresAt`. Registration (`POST /api/auth/register`) is proxied to this app. |
| **ARC PEM desktop app** | The actual product (Windows/Mac). Downloaded from this site's `/dashboard/downloads` page; licensed per machine. |
| **ARC PEM Web** (`ARCPEM-Web`, app.arcpem.com) | The product in the browser, with its **own** database. Firms buy a web plan here; owners sign in to it with their ARC PEM account (this site is its OpenID Connect provider); team members are invited inside it. |

### ARC PEM Web integration

- **Plans:** `Plan.product` is `DESKTOP` or `WEB`; web plans carry `tier` (SOLO/STUDIO/ENTERPRISE). `/api/plans?product=WEB` and `/pricing?product=web` list them.
- **Purchase:** the normal Razorpay flow. For a web plan, `activatePaidPlan` applies a year to the buyer's `WebSubscription` (`lib/web-app.ts`) instead of setting `User.planId`. `WebSubscriptionPayment.paymentRef` is unique, so this site's and the admin's Razorpay webhooks can both see a payment and it still counts once.
- **Owner sign-in:** `/.well-known/openid-configuration`, `/oauth/authorize|token|userinfo|jwks` (`lib/oidc.ts`). Authorization code + PKCE, one registered client (the web app), RS256 ID tokens signed with `OIDC_PRIVATE_KEY`. The ID token carries the firm's current subscription. The dashboard's "Open ARC PEM Web" button starts this flow.
- **Keeping the web app in sync:** every change writes a `subscription.updated` event to `WebhookOutbox` in the same transaction; it is pushed to `{WEB_APP_URL}/api/webhooks/accounts` (HMAC-signed) immediately and retried by `GET /api/cron/web-app-outbox` (schedule every ~5 minutes with `CRON_SECRET`). Events carry full state, so retries and reordering are harmless.
- The contract both sides implement is in the web app at `src/lib/accounts/contract.ts`.

**Important:** this project only ever runs `prisma generate`, never `prisma migrate` / `prisma db push` — doing so against the shared database would attempt to drop the admin-only tables (`Client`, `License`, `ApiKey`, `ActivityLog`). See [`prisma/schema.prisma`](prisma/schema.prisma).

---

## Features

### Marketing site
- Home, About, Solutions, Pricing, Contact, Resources pages (`app/(marketing)`)
- Legal pages: Privacy, Terms, Refund, Shipping (shared `LegalPage` component)
- A voice AI sales assistant (Vapi) embedded on marketing pages that can answer questions and log demo requests
- "Book a demo" modal (`DemoModalContext`) that emails the sales inbox via Brevo
- SEO: dynamic `sitemap.ts` / `robots.ts`, JSON-LD structured data (`components/seo/JsonLd.tsx`), Google Analytics 4, Google Search Console verification

### Free tools (`/tools`)
Standalone, no-signup calculators built to drive SEO/organic traffic, registered in a single source of truth ([`lib/tools.ts`](lib/tools.ts)):
- **GST Contractor Bill Generator** — generate a GST-compliant invoice in-browser, export to PDF
- **Construction Cost Calculator** — per-sq-ft cost estimate by city/quality with material breakdown
- **Concrete Calculator** — cement/sand/aggregate/water for M10–M25 mixes
- Planned: brick calculator, TMT steel weight calculator, land area unit converter

### Accounts & auth
- Email/password registration with **OTP email verification** (Brevo), delegating actual account creation to the admin app so password policy is enforced in one place
- Credentials-based login via **NextAuth** (JWT sessions, custom `arcpem.session` cookie)
- Periodic session re-validation (role/suspension/plan changes on the admin side propagate to an active session within ~60s)
- Forgot/reset password flow (OTP → one-time reset token → new password)
- Constant-time password comparison and generic error messages to prevent user enumeration

### Customer dashboard (`/dashboard`, auth-gated)
- Overview with plan status, expiry, and onboarding checklist
- Installer downloads (Windows/Mac), gated to authenticated users, served either by local file stream or redirect to a remote URL
- Subscription management and Razorpay checkout
- Profile settings (name, password change)
- Support page

### Payments (Razorpay)
- One-year license only — no monthly billing (each license is machine-locked and issued manually)
- Server-authoritative activation: plan and buyer are derived from the Razorpay **order's server-set notes**, never from the client; payment is independently verified as `captured` with amount/currency cross-checked
- Shared activation logic (`lib/payment.ts`) used by both the post-checkout `verify` route and the `webhook` route, so both entry points behave identically and are idempotent (dedup on Razorpay payment id)
- Payment success emails sent on activation

### Security
- Per-request **nonce-based Content-Security-Policy** built in `middleware.ts` (`strict-dynamic`), plus static security headers in `next.config.js` for routes outside the middleware matcher
- Rate limiting on every sensitive endpoint (login, OTP send/verify, password reset, demo form) — Redis-backed (Upstash) in production, in-memory fallback in dev
- HSTS, `X-Frame-Options`, `X-Content-Type-Options`, restrictive `Permissions-Policy`

---

## Tech stack

- **Framework:** Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS (preflight disabled — landing page CSS controls base styles) + hand-written CSS (`landing.css`, `tools.css`)
- **Animation:** Framer Motion
- **Icons:** Lucide React + custom SVG icon set (`components/icons.tsx`)
- **Auth:** NextAuth (Credentials provider, JWT strategy)
- **Database/ORM:** PostgreSQL via Prisma Client (schema owned by the admin app)
- **Payments:** Razorpay (orders, webhooks)
- **Email:** Brevo (Sendinblue) transactional API
- **Rate limiting / OTP storage:** Upstash Redis (REST), in-memory fallback
- **Voice AI:** Vapi (`@vapi-ai/web`)
- **Analytics:** Google Analytics 4 (`@next/third-parties`)

---

## Project structure

```
app/
  (auth)/              Login, register, forgot/reset password (public, unauthenticated layout)
  (marketing)/          Home, about, pricing, solutions, contact, legal pages, /tools
  dashboard/            Authenticated customer dashboard
  api/
    auth/               NextAuth handler, OTP send/verify, forgot/reset password
    payment/            Razorpay create-order, verify, webhook
    plans/              Public read-only plan list (mirrors admin-managed plans)
    demo/                Demo request → email lead
    download/            Gated installer download/redirect
    user/                Profile + password updates (session required)
  robots.ts / sitemap.ts SEO routes
components/
  dashboard/            Dashboard shell, sidebar, header, onboarding checklist
  marketing/            Marketing shell, demo modal, voice assistant, legal page renderer
  tools/                Free tool implementations (bill generator, calculators)
  seo/                  JSON-LD structured data
lib/
  auth.ts               NextAuth config (providers, callbacks, cookie/session settings)
  payment.ts            Shared, authoritative Razorpay activation logic
  pricing.ts             Annual pricing derivation (monthly base × 12)
  tools.ts               Free tools registry (single source of truth)
  company.ts             Business/legal details shown site-wide (footer, contact, invoices)
  env.ts                  Centralised, fail-fast environment variable access
  rate-limit.ts           Pluggable fixed-window rate limiter (Redis or in-memory)
  otp-store.ts            OTP generation/verification store
  email.ts                Brevo transactional email templates
  db.ts                   Prisma client singleton
  logger.ts               Minimal structured logger
prisma/
  schema.prisma           Shared schema (READ-ONLY here — see warning above)
scripts/
  seed-plans.mjs          Idempotent upsert of the three subscription plans
middleware.ts              CSP/nonce generation, dashboard auth gate, security headers
```

---

## Getting started

### Prerequisites
- Node.js 18+
- Access to the shared PostgreSQL database (or a local copy seeded with the admin app's migrations)

### Setup

```bash
npm install
cp .env.example .env   # then fill in the values — see below
npm run db:generate    # generates the Prisma client only (never migrate from here)
node scripts/seed-plans.mjs   # optional: upsert the Solo/Studio/Enterprise plans
npm run dev             # http://localhost:3001
```

The dev server runs on **port 3001** (the admin app conventionally runs on 3000 — several env vars point to it).

---

## Environment variables

See [`.env.example`](.env.example) for the full annotated list. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Shared PostgreSQL connection (same DB as the admin app) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | NextAuth session signing/base URL — **required** |
| `ADMIN_APP_URL`, `NEXT_PUBLIC_ADMIN_API` | Admin app base URL, used for the registration API call and the admin-role redirect |
| `ALLOWED_ORIGINS` | Comma-separated hosts allowed for Server Actions |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Razorpay checkout + webhook signature verification |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` | Transactional email (OTP, password reset, demo leads, payment receipts) |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Cross-instance rate limiting + OTP storage — **required in production**; falls back to in-memory (dev-only, single-instance) if unset |
| `DOWNLOAD_PATH_WIN` / `DOWNLOAD_PATH_MAC` | Local filesystem paths to installers (streamed to authenticated users) |
| `DOWNLOAD_URL_WIN` / `DOWNLOAD_URL_MAC` | Alternative: redirect to a remote installer URL |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Public key for the Vapi voice assistant widget (client-safe; leave blank to hide the widget) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (client-safe; leave blank to disable analytics) |
| `GOOGLE_SITE_VERIFICATION` | Search Console HTML-tag verification value |

Only `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are hard-required at boot (enforced by [`lib/env.ts`](lib/env.ts), which throws in production if missing).

---

## Database

The Prisma schema in [`prisma/schema.prisma`](prisma/schema.prisma) is a **subset mirror** of the schema owned by `Arc-Pem-Admin`. Models used here:

- `User` — auth, role, status, plan association, `planExpiresAt` (mirror field, set by admin only)
- `Plan` — subscription tiers (Solo / Studio / Enterprise), read publicly via `/api/plans`
- `PendingPayment` — payment audit trail / idempotency ledger for Razorpay activations
- `PasswordResetToken` — one-time reset tokens

**Never run `prisma migrate` or `prisma db push` from this project.** Only `prisma generate` (via `npm run db:generate`, which also runs automatically on `postinstall`). Schema changes belong in the admin repo.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Start the production server on port 3001 |
| `npm run lint` | Next.js/ESLint |
| `npm run db:generate` | Regenerate the Prisma client (schema is read-only here) |
| `node scripts/seed-plans.mjs` | Idempotently upsert the Solo/Studio/Enterprise plans (safe to run against production — never deletes) |

---

## Security model

- **CSP:** generated per-request in `middleware.ts` with a fresh nonce, using `strict-dynamic` so nonce-bearing scripts can load trusted subresources (Razorpay checkout, Vapi/Daily.co WebRTC). `unsafe-eval` is scoped to script-src only and is required because Vapi's Daily.co bundle uses `eval()` to load its WebRTC runtime.
- **Auth:** bcrypt password hashing, constant-time comparison against a dummy hash to prevent timing-based user enumeration, generic "invalid email or password" messaging, JWT sessions re-validated against the DB at most once per 60s (propagates suspension/role/plan changes quickly without hitting the DB on every request).
- **Rate limiting:** every public POST endpoint that touches auth, OTPs, or lead capture is throttled by IP and/or email. Redis failures fail **open** (allow) so an outage never blocks legitimate users, but are logged.
- **Payments:** see [Payments](#payments) below — client-supplied data is never trusted for plan/amount; everything is re-derived from Razorpay's own order/payment records.
- **Downloads:** installer paths come only from environment variables (fixed whitelist keyed by platform), never from user input — no path traversal surface. Requires an authenticated session.

---

## Payments

ARC PEM sells a **one-year license** — there is no recurring/monthly billing. The admin app stores a monthly *base* price per plan; this site always charges and displays `monthlyBase × 12` (see [`lib/pricing.ts`](lib/pricing.ts)).

Flow:
1. `POST /api/payment/create-order` — creates a Razorpay order with the plan and user id embedded in **server-set** order notes.
2. Client completes checkout via Razorpay's widget.
3. `POST /api/payment/verify` (post-checkout) **or** `POST /api/payment/webhook` (Razorpay server-to-server) both call the shared `activatePaidPlan()` in [`lib/payment.ts`](lib/payment.ts), which:
   - Re-fetches the order and payment directly from Razorpay (never trusts client-submitted values)
   - Confirms the payment is `captured`, belongs to the order, and matches amount/currency
   - Cross-checks the paid amount against the *current* annual plan price
   - Activates the plan and records a `PendingPayment` audit row keyed by Razorpay payment id, so webhook retries or a verify/webhook race are no-ops
   - Sends a payment confirmation email (best-effort, non-blocking)

---

## Free tools

Registered in [`lib/tools.ts`](lib/tools.ts) and rendered under `/tools`; adding a new tool means adding one entry there plus its page/component — the tools index, sitemap, and nav/footer all read from the same registry.

---

## Deployment

- Standard Next.js production build (`npm run build && npm run start`), suitable for any Node host or platform that supports the Next.js App Router (e.g. Vercel).
- `postinstall` runs `prisma generate` automatically.
- Set `NODE_ENV=production` to enable strict env-var enforcement (`lib/env.ts` throws on missing required vars), HSTS headers, and secure session cookies.
- Requires network access to the shared PostgreSQL database, the admin app (`ADMIN_APP_URL`), Razorpay, Brevo, and (recommended) Upstash Redis for cross-instance rate limiting.
