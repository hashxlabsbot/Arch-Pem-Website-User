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
  // ── ARC PEM (app.arcpem.com): one subscription per firm, billed monthly or annually (annual = 10 months).
  // maxUsers = full seats; maxSiteUsers = site seats (Site engineer, Supervisor). 100000 = unlimited.
  // Keep the limits in step with PLAN_LIMITS in ARCPEM-Web/src/lib/plans.ts.
  {
    name: 'Web Starter',
    product: 'WEB',
    tier: 'SOLO',
    price: 1999,
    period: 'month',
    description: 'For small studios getting started: the owner, one colleague and a few people on site.',
    features: [
      '2 team seats + 3 site seats',
      'Up to 10 active projects',
      'Every feature: ledgers, BOQ, approvals',
      'GST, GSTR-2B, TDS and Tally export',
      'Works on any phone or computer',
      'Email support',
    ],
    maxProjects: 10,
    maxUsers: 2,
    maxSiteUsers: 3,
    isActive: true,
  },
  {
    name: 'Web Studio',
    product: 'WEB',
    tier: 'STUDIO',
    price: 4999,
    period: 'month',
    description: 'For growing firms running several sites, with office and site teams working together.',
    features: [
      '5 team seats + 10 site seats',
      'Up to 30 active projects',
      'Every feature: ledgers, BOQ, approvals',
      'GST, GSTR-2B, TDS and Tally export',
      'Priority email support',
    ],
    maxProjects: 30,
    maxUsers: 5,
    maxSiteUsers: 10,
    isActive: true,
  },
  {
    name: 'Web Business',
    product: 'WEB',
    tier: 'BUSINESS',
    price: 9999,
    period: 'month',
    description: 'For established firms: unlimited projects and site teams, with onboarding help.',
    features: [
      '15 team seats + unlimited site seats',
      'Unlimited active projects',
      'Every feature, for every project',
      'Guided onboarding and data migration',
      'Priority phone & WhatsApp support',
    ],
    maxProjects: 100000,
    maxUsers: 15,
    maxSiteUsers: 100000,
    isActive: true,
  },
  {
    // Sold by the team: price 0 means "contact sales" on the site and is never charged online.
    name: 'Web Enterprise',
    product: 'WEB',
    tier: 'ENTERPRISE',
    price: 0,
    period: 'month',
    description: 'For large builders and multi-office firms. Custom seats, SLA and a dedicated manager. From ₹20,000/month.',
    features: [
      '30+ team seats, unlimited site seats',
      'Unlimited active projects',
      'Dedicated account manager',
      'SLA, security review and custom onboarding',
      'Custom seat and project limits',
    ],
    maxProjects: 100000,
    maxUsers: 30,
    maxSiteUsers: 100000,
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
    const unit = p.product === 'WEB' ? `seats · ${p.maxSiteUsers} site seats` : 'machines'
    console.log(`  ✓ ${p.name}  ₹${p.price}/mo  ${p.maxProjects} projects · ${p.maxUsers} ${unit}`)
  }

  // Retired plan names stay for firms already on them, but are no longer offered.
  const retired = ['Web Solo']
  const { count } = await db.plan.updateMany({ where: { name: { in: retired }, isActive: true }, data: { isActive: false } })
  if (count) console.log(`  – retired: ${retired.join(', ')}`)

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
