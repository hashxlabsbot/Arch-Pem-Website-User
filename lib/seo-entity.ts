import { company } from '@/lib/company'

/**
 * Canonical, machine-readable facts about ARC PEM — shared by the JSON-LD
 * graph, /llms.txt and the buyer's guide so every surface an AI crawler reads
 * describes the product in the same words. Only list what the product
 * actually does today; answer engines penalise contradictions between pages.
 */
export const entity = {
  name: company.brand,
  category: 'Construction expense & project cost management software',
  definition:
    'ARC PEM is construction expense and project-cost management software for architects, contractors and builders in India. It is a Windows desktop application that works fully offline and combines BOQ & budgets, vendor bills, labour wages, contractor bills, site expenses, GST purchase registers, pending payments and Tally ERP / TallyPrime export in one place.',
  audience: ['Architecture firms', 'Interior & fit-out firms', 'Building contractors', 'Construction companies', 'Real-estate builders'],
  platform: 'Windows desktop (works fully offline)',
  pricingModel:
    'Annual one-year licence, locked per machine: Solo (1 computer), Studio (up to 3) and Enterprise (up to 10). Current prices are on the pricing page.',
  featureGroups: [
    {
      name: 'Project & budget',
      items: ['Bill of Quantities (BOQ) with reusable templates', 'Project dashboard & status tracking', 'Budget vs actual with overrun alerts', 'Cost per sq ft calculation', 'Contingency & GST auto-compute', 'PDF & Excel export'],
    },
    {
      name: 'Expenses & finance',
      items: ['Vendor ledger with GST toggle', 'Daily labour headcount & wage tracking', 'Contractor bill management', 'Site expense tracking', 'GST purchase register', 'Pending payments dashboard', 'Tally ERP / TallyPrime CSV export'],
    },
    {
      name: 'Platform',
      items: ['Fully offline — no server, data stays on your computer', 'Multi-user database sharing over a local network (Studio & Enterprise)', 'PDF manpower report import', 'Daily auto-backup with 30-day rolling history', 'Multi-currency (8 currencies)', 'PIN lock & RSA-2048 licensing', 'Global search (Ctrl+K)'],
    },
  ],
} as const

export const featureList = entity.featureGroups.flatMap((g) => g.items)

export const ORG_ID = `${company.siteUrl}/#organization`
export const SOFTWARE_ID = `${company.siteUrl}/#software`
