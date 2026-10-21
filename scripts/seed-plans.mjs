// Idempotent seed for the ARC PEM web plans (Starter, Studio, Business, Enterprise).
// Upserts by unique `name` and touches only these web plans: the old desktop plans (Solo, Studio, Enterprise)
// and their customers are left exactly as they are. Safe to run against the shared production (Neon) database;
// re-running just updates.
//
//   node scripts/seed-plans.mjs
//
// Loads env exactly like Next.js does (so it hits the same DB the website uses).
import nextEnv from '@next/env'
nextEnv.loadEnvConfig(process.cwd())

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Monthly price before GST (₹). The website derives every amount from it (lib/pricing.ts): monthly = price,
// annual = price × the annual billed months, plus add-on seats, plus GST at checkout.
const plans = [
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
