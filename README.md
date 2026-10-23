# ARC PEM: website, accounts and billing (arcpem.com)

The public face of ARC PEM and the place customers buy it: marketing and SEO, sign-up, plans and payments, the
customer account, and the sign-in provider for the ARC PEM app (app.arcpem.com). Built with Next.js 14 (App Router),
TypeScript, Prisma/PostgreSQL, NextAuth and Razorpay.

This is one of three apps. The full picture lives in the `ARCPEM-Web` repo:
[docs/FEATURES.md](../ARCPEM-Web/docs/FEATURES.md) (what it all does),
[docs/SYSTEM.md](../ARCPEM-Web/docs/SYSTEM.md) (how the apps fit together) and
[docs/LAUNCH.md](../ARCPEM-Web/docs/LAUNCH.md) (going live).

## Contents

- [How this fits together](#how-this-fits-together)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Billing](#billing)
- [Security model](#security-model)
- [Deployment](#deployment)

---

## How this fits together

| App | Role |
| --- | --- |
| **This repo** (`Arch-Pem-Website-User`, arcpem.com) | Marketing and SEO, sign-up, checkout, customer account, billing engine, OpenID Connect provider |
| **Arc-Pem-Admin** | Staff tools. **Owns the accounts database schema and all its migrations.** Also hears Razorpay's webhooks to approve payments and issue GST invoices |
| **ARCPEM-Web** (app.arcpem.com) | The product, with its **own** database. Owners sign in with their ARC PEM account from here; team members join by invitation |

ARC PEM is sold only as a web subscription. The earlier offline desktop edition is no longer marketed; customers who
already have a desktop licence still see it, and their downloads, in their account.

The website and admin **share one PostgreSQL database** (the accounts database). The app never touches it; the two
sides meet only through OpenID Connect sign-in and signed webhooks.

**Important:** this project only ever runs `prisma generate`, never `prisma migrate` or `prisma db push`. The admin
repo owns the schema and its migrations; doing it from here against the shared database could drop admin-only tables.
Change a model in the admin schema first, then mirror it in [`prisma/schema.prisma`](prisma/schema.prisma).

---

## Features

### Marketing site
- Home page (hero, why ARC PEM, features, roles, security, plans with a monthly/annual switch, FAQ), Solutions, About,
  Contact, Resources, and the Pricing page (four plans, add-on seat prices, trial terms, comparison, FAQ).
- Segment pages (`/for/architects`, `/for/contractors`, `/for/builders`, `/for/interior-designers`), comparison pages,
  a buyer's guide and a construction glossary.
- Legal: Privacy, Terms, Refund and Cancellation (including auto-renewal and trial terms), Shipping/Delivery.
- A voice assistant (Vapi) that answers pricing and product questions, using the same facts as the pages.
- "Book a demo" (emails the sales inbox and can create a Google Calendar event).
- **Blog** with categories, RSS and view analytics; written in the admin app, and publishing refreshes this site at once.
- **Free tools** (`/tools`, no sign-up): construction cost calculator, concrete calculator, bar-bending schedule
  calculator, GST contractor bill generator. Registered in [`lib/tools.ts`](lib/tools.ts).
- **SEO and AI discoverability:** JSON-LD (SoftwareApplication with live offers, FAQPage, BreadcrumbList), sitemap,
  robots, `llms.txt` and `llms-full.txt` briefings built from the live plans, IndexNow pings, Google Analytics 4.

### Accounts and sign-in
- Email and password registration with **OTP email verification**; Google sign-in when configured.
- Forgot and reset password (OTP, then a one-time reset token); constant-time password checks and generic errors.
- Sessions are re-validated against the database about once a minute, so suspension and plan changes reach a live
  session quickly.

### Customer account (`/dashboard`)
- **Account home:** plan and status, renewal or trial state, **Open ARC PEM**, quick actions.
- **Subscription:** choose a plan and monthly or annual billing, add extra team or site seats with a live price, start
  the free trial, switch plan, turn auto-renew off (access continues to the paid end).
- Support page, settings (profile, password). Customers with a legacy desktop licence also see it and its downloads.

### Billing
Razorpay Subscriptions with auto-pay by card, UPI AutoPay or e-mandate. See [Billing](#billing).

### Identity provider for the app
`/.well-known/openid-configuration`, `/oauth/authorize`, `/oauth/token`, `/oauth/userinfo`, `/oauth/jwks`
([`lib/oidc.ts`](lib/oidc.ts)): authorization code with PKCE, one registered client (the app), RS256 ID tokens signed
with `OIDC_PRIVATE_KEY`. The ID token carries the firm's current subscription, so the firm is created and updated on
first sign-in. "Open ARC PEM" starts this flow.

---

## Tech stack

- **Framework:** Next.js 14 (App Router, Route Handlers), React 18, TypeScript (strict)
- **Styling:** Tailwind CSS (preflight disabled; the landing CSS controls base styles) plus hand-written CSS
  (`landing.css`, `site-v2.css`, page CSS); **motion:** framer-motion (respects reduced-motion)
- **Auth:** NextAuth v4 (credentials, optional Google, JWT sessions)
- **Database:** PostgreSQL through Prisma 5 (schema owned by the admin app)
- **Payments:** Razorpay (subscriptions and webhooks)
- **Email:** SMTP through Nodemailer, one branded layout (shared with the other apps)
- **Rate limiting and OTP storage:** Upstash Redis (REST), in-memory fallback for development
- **Voice assistant:** Vapi; **analytics:** Google Analytics 4
- **Tests:** Vitest

---

## Project structure

```
app/
  (auth)/               Login, register, forgot/reset password
  (marketing)/          Home, pricing, solutions, about, contact, legal, blog, tools, for/, compare/, guides/, glossary/
  dashboard/            Customer account: home, subscription, downloads (legacy), settings, support
  api/
    auth/               NextAuth, OTP send/verify, forgot/reset password
    subscription/       checkout, verify, cancel (auto-renew)
    payment/            Razorpay webhook (+ legacy one-off order routes)
    plans/              Public plan list
    cron/web-app-outbox Retries undelivered subscription updates to the app
    revalidate/         Called by admin when prices or blog posts change
    demo/, download/, user/, blog/
  oauth/, .well-known/  OpenID Connect provider
  llms.txt, llms-full.txt, sitemap.ts, robots.ts
components/             dashboard/, marketing/, home/, motion/, tools/, seo/
lib/
  pricing.ts            The price formula and billing-rule types (identical copy in the admin app)
  billing-rules.ts      Reads the billing rules set in admin Settings (one-minute cache)
  billing.ts, payment.ts  Razorpay plan and subscription creation; charge activation
  web-app.ts            Subscription core: terms, trials, add-ons, outbox (identical copy in the admin app)
  oidc.ts               The OpenID Connect provider
  seo-entity.ts, pricing-faqs.ts, aeo-pages.ts, glossary.ts, vapiAssistant.ts   One source of product facts
  auth.ts, env.ts, rate-limit.ts, otp-store.ts, mailer.ts, email.ts, db.ts, logger.ts
prisma/schema.prisma    Mirror of the admin-owned schema (do not migrate from here)
scripts/                seed-plans.mjs, seed-blog.mjs, indexnow-submit.mjs, get-calendar-refresh-token.mjs
middleware.ts           CSP nonce, dashboard auth gate, security headers
```

---

## Getting started

### Prerequisites
- Node.js 18+
- A PostgreSQL database built from the admin app's migrations. For a local copy, run the admin app's
  `npx prisma migrate deploy` against it first.

### Setup

```bash
npm install
cp .env.example .env          # then fill in the values (see below)
npm run db:generate           # Prisma client only
node scripts/seed-plans.mjs   # create the sold plans (idempotent)
npm run dev                   # http://localhost:3001
```

> **Careful: `.env` may point at your real database and live payment keys.** For anything local, use a separate
> database and blank out Razorpay, Redis, mail and Google, then run on a different port (the dev default, 3001, is
> usually your own working copy). The full local recipe, demo data and logins are in
> [SYSTEM.md, "Local development"](../ARCPEM-Web/docs/SYSTEM.md#10-local-development).

The admin app conventionally runs on 3000 and the product app on 3002; several variables point at them.

---

## Environment variables

[`.env.example`](.env.example) is the full annotated list. Summary:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | The shared accounts database (same as the admin app) |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | Session signing and base URL. **Required** |
| `ADMIN_APP_URL`, `NEXT_PUBLIC_ADMIN_API`, `ADMIN_ORIGIN`, `ALLOWED_ORIGINS` | Where the admin app is, and which origins may call server actions |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Checkout, subscriptions, and signature verification of this app's own Razorpay webhook |
| `WEB_APP_URL`, `NEXT_PUBLIC_WEB_APP_URL`, `WEB_APP_WEBHOOK_SECRET` | The ARC PEM app: where to push subscription updates and the secret that signs them (same value as the app's `ARCPEM_ACCOUNTS_WEBHOOK_SECRET`) |
| `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_PRIVATE_KEY`, `OIDC_REDIRECT_URIS` | The sign-in provider for the app (private key is a PEM with `\n` escapes) |
| `CRON_SECRET` | Bearer secret for `GET /api/cron/web-app-outbox` |
| `REVALIDATE_SECRET`, `PREVIEW_SECRET` | Lets the admin app refresh prices and blog pages, and preview drafts. The admin's `REVALIDATE_SECRET` must match |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_FROM_NAME` | Transactional email |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Cross-instance rate limiting and OTP storage. **Required in production** |
| `DEMO_LEADS_EMAILS`, `GOOGLE_CALENDAR_ID`, `GOOGLE_CALENDAR_REFRESH_TOKEN` | Demo bookings |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google sign-in |
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Voice assistant and analytics (blank hides them) |
| `INDEXNOW_KEY`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`, `YANDEX_SITE_VERIFICATION` | Search engines |
| `DOWNLOAD_PATH_WIN/MAC`, `DOWNLOAD_URL_WIN/MAC` | Legacy desktop installers, for customers who still have a licence |

Only `DATABASE_URL`, `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are hard-required at boot (enforced by
[`lib/env.ts`](lib/env.ts) in production).

---

## Database

[`prisma/schema.prisma`](prisma/schema.prisma) mirrors the models this app uses: `User`, `PasswordResetToken`, `Plan`,
`RazorpayPlan`, `WebSubscription`, `WebSubscriptionPayment`, `WebhookOutbox`, `OidcAuthCode`, `PendingPayment`,
`BillingProfile`, `BillingSettings`, `DemoBooking` and the blog models.

**Never run `prisma migrate` or `prisma db push` from this project.** Only `prisma generate`.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port 3001 |
| `npm run build` / `npm run start` | Production build and server (port 3001) |
| `npm run lint` | Next.js / ESLint |
| `npm test` | Vitest |
| `npm run db:generate` | Regenerate the Prisma client |
| `node scripts/seed-plans.mjs` | Create or update the sold plans (idempotent, never deletes; retires "Web Solo") |

---

## Billing

ARC PEM is a **subscription per firm**, billed monthly or annually, renewed automatically.

| | Starter | Studio | Business | Enterprise |
| --- | --- | --- | --- | --- |
| Monthly | ₹1,999 | ₹4,999 | ₹9,999 | Custom, sold by the team |
| Team / site seats | 2 / 3 | 5 / 10 | 15 / unlimited | 30+ / unlimited |
| Projects | 10 | 30 | Unlimited | Unlimited |

Annual billing charges 10 months; extra team seats cost ₹599/month and site seats ₹199/month; the first subscription has a
14-day free trial. The add-on prices, trial length and annual months are **editable in admin → Settings** (read here
through [`lib/billing-rules.ts`](lib/billing-rules.ts)), so the numbers above are the defaults.

Flow:
1. `POST /api/subscription/checkout` creates (or reuses) a Razorpay plan for the exact amount and a Razorpay
   subscription whose **server-set notes** hold the firm, plan, cycle, add-on seats and any trial.
2. The customer authorises auto-pay in Razorpay Checkout.
3. `POST /api/subscription/verify` (browser) and the `subscription.charged` webhook both call
   `applySubscriptionCharge` in [`lib/payment.ts`](lib/payment.ts), which re-fetches from Razorpay, validates the
   amount against the notes and the plan price, and applies **one** paid term. `WebSubscriptionPayment.paymentRef` is
   unique, so this app and the admin app both hearing about a charge still count it once.
4. A `subscription.updated` event is written to `WebhookOutbox` in the same transaction and pushed, signed, to the app;
   `GET /api/cron/web-app-outbox` (every 5 minutes, `Authorization: Bearer $CRON_SECRET`) retries anything not
   acknowledged.
5. Plan, cycle or seat changes create a new subscription naming the old one; once its first charge succeeds the old one
   is cancelled. Cancelling auto-renew keeps the time already paid.

Free trial: the first charge is scheduled for the end of the trial; `subscription.authenticated` starts the plan at
once. A trial that ends unpaid goes read-only immediately. The full lifecycle, with diagrams, is in
[SYSTEM.md](../ARCPEM-Web/docs/SYSTEM.md#5-billing-lifecycle).

---

## Security model

- **CSP:** generated per request in `middleware.ts` with a fresh nonce and `strict-dynamic`, plus static headers in
  `next.config.js` for routes outside the middleware. `unsafe-eval` is scoped to script-src because Vapi's WebRTC
  bundle needs it.
- **Auth:** bcrypt, constant-time comparison against a dummy hash, generic error messages, sessions re-validated
  against the database about once a minute.
- **Rate limiting** on every sensitive endpoint (login, OTP, password reset, checkout, demo form): Redis-backed in
  production. Redis failures fail open and are logged.
- **Payments:** the firm, plan, cycle and add-ons are written into the Razorpay subscription's notes by the server;
  every charge is re-fetched from Razorpay and checked against them and the plan price. Nothing the browser sends
  decides what is paid for.
- **Webhooks to the app** are HMAC-signed with a timestamp; Razorpay's are verified on the raw body.
- **Downloads** (legacy installers) come only from fixed environment variables, never from user input.

---

## Deployment

- Standard Next.js build (`npm run build && npm run start`) on any Node host that supports the App Router.
  `postinstall` runs `prisma generate`.
- `NODE_ENV=production` turns on strict env enforcement, HSTS and secure cookies.
- Needs the accounts database, the admin app (`ADMIN_APP_URL`), the ARC PEM app (`WEB_APP_URL`), Razorpay, an SMTP
  provider and (recommended) Upstash Redis.
- Schedule `GET /api/cron/web-app-outbox` every 5 minutes. Set the Razorpay webhook events listed in
  [LAUNCH.md](../ARCPEM-Web/docs/LAUNCH.md#5-payments-razorpay-live).
- Plans and billing rules are managed in the admin app; changing them refreshes this site automatically through
  `/api/revalidate`.
