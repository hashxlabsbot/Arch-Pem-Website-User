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

// Monthly price only. The website derives the annual price (−20%) at render time,
// so admin only ever has to set the monthly price here / in the admin UI.
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
    console.log(`  ✓ ${p.name}  ₹${p.price}/mo  ${p.maxProjects} projects · ${p.maxUsers} machines`)
  }

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
