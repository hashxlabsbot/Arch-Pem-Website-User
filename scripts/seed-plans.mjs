// Idempotent seed for the three subscription plans.
// Upserts by unique `name` — never deletes users or other plans, so it is safe
// to run against the shared production (Neon) database. Re-running just updates.
//
//   node scripts/seed-plans.mjs
//
// Loads env exactly like Next.js does (so it hits the same DB the website uses).
import nextEnv from '@next/env'
nextEnv.loadEnvConfig(process.cwd())

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Monthly BASE price only. ARC PEM is sold as a one-year license: the website
// charges and displays the annual price (= monthly base × 12, no discount) at
// render time, so admin only ever has to set the monthly base price here / in
// the admin UI. See lib/pricing.ts (annualPrice).
const plans = [
  {
    name: 'Solo',
    price: 4999,
    period: 'month',
    description: 'For individual architects managing up to 10 active projects on a single machine.',
    features: [
      'Single machine license',
      'Up to 10 active projects',
      'BOQ + all expense ledgers',
      'PDF & Excel exports',
      'Vendor directory',
      '12 months of updates',
      'Email support',
    ],
    maxProjects: 10,
    maxUsers: 1,
    isActive: true,
  },
  {
    name: 'Studio',
    price: 9999,
    period: 'month',
    description: 'For studios and construction firms with teams — multi-user sharing across up to 5 machines.',
    features: [
      'Up to 5 machine licenses',
      'Up to 30 active projects',
      'All exports incl. Tally CSV',
      'Multi-user database sharing',
      'GST Purchase Register',
      'Pending Payments Report',
      'Priority email support',
      'PIN lock & security',
    ],
    maxProjects: 30,
    maxUsers: 5,
    isActive: true,
  },
  {
    name: 'Enterprise',
    price: 19999,
    period: 'month',
    description: 'For large firms running up to 50 projects across multiple offices with SLA support.',
    features: [
      'Up to 10 machine licenses',
      'Up to 50 active projects',
      'Everything in Studio',
      'Custom branding on reports',
      'Dedicated onboarding manager',
      'API / custom integration',
      'SLA support agreement',
      'Machine transfer support',
    ],
    maxProjects: 50,
    maxUsers: 10,
    isActive: true,
  },
  // ── ARC PEM Web (app.arcpem.com): per firm, in the browser. maxUsers = team seats. ──
  {
    name: 'Web Solo',
    product: 'WEB',
    tier: 'SOLO',
    price: 2499,
    period: 'month',
    description: 'ARC PEM in the browser for one person: every ledger, report and export, nothing to install.',
    features: [
      '1 team seat',
      'Up to 10 active projects',
      'BOQ, budgets and all expense ledgers',
      'GST, TDS and Tally exports',
      'Works on any device',
      'Email support',
    ],
    maxProjects: 10,
    maxUsers: 1,
    isActive: true,
  },
  {
    name: 'Web Studio',
    product: 'WEB',
    tier: 'STUDIO',
    price: 4999,
    period: 'month',
    description: 'For studios and site teams working together, with roles, approvals and per-project access.',
    features: [
      '3 team seats',
      'Up to 30 active projects',
      'Roles, approvals and project access',
      'Everything in Web Solo',
      'Priority email support',
    ],
    maxProjects: 30,
    maxUsers: 3,
    isActive: true,
  },
  {
    name: 'Web Enterprise',
    product: 'WEB',
    tier: 'ENTERPRISE',
    price: 9999,
    period: 'month',
    description: 'For larger firms running many sites, with the highest limits and dedicated support.',
    features: ['10 team seats', 'Up to 50 active projects', 'Everything in Web Studio', 'Dedicated onboarding', 'SLA support'],
    maxProjects: 50,
    maxUsers: 10,
    isActive: true,
  },
]

async function main() {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.replace(/:[^:@/]+@/, ':***@').match(/@([^/?]+)/)?.[1] ?? 'unknown'
  console.log(`Seeding plans into: ${host}`)

  for (const p of plans) {
    const data = { ...p, features: JSON.stringify(p.features) }
    const { name, ...rest } = data
    await db.plan.upsert({
      where: { name },
      update: rest,
      create: data,
    })
    const unit = p.product === 'WEB' ? 'seats' : 'machines'
    console.log(`  ✓ ${p.name}  ₹${p.price}/mo  ${p.maxProjects} projects · ${p.maxUsers} ${unit}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
