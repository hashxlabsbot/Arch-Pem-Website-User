import { company } from '@/lib/company'
import { DEFAULT_BILLING_RULES, subscriptionPrice, type BillingInterval, type BillingRules } from '@/lib/pricing'
import { isQuoted, isUnlimited } from '@/lib/plan-order'

/**
 * Canonical, machine-readable facts about ARC PEM — shared by the JSON-LD
 * graph, /llms.txt, /llms-full.txt, the home FAQ and the buyer's guide so every
 * surface an AI crawler reads describes the product in the same words. Only
 * list what the product actually does today; answer engines penalise
 * contradictions between pages.
 */

/** Where ARC PEM runs (the app). */
export const WEB_APP_URL = 'https://app.arcpem.com'

/**
 * Bump when the marketing copy, segment/comparison pages or glossary change.
 * Feeds the sitemap's lastModified so crawlers see an honest freshness date
 * instead of "changed today" on every request.
 */
export const CONTENT_UPDATED = '2026-10-25'

export const entity = {
  name: company.brand,
  category: 'Construction expense & project cost management software',
  definition: `ARC PEM is cloud construction expense and project-cost management software for architects, interior firms, contractors and builders in India. The whole firm — owner, accounts, project managers and site engineers — works on one live ledger in the browser at ${WEB_APP_URL}, where every rupee is tied to a project, a party and a bill: BOQ budgets, vendor bills, labour wages, contractor bills, site expenses, payment approvals, payment vouchers, GST purchase registers with GSTR-2B reconciliation, TDS, pending payments and Tally ERP / TallyPrime export, from any computer or phone.`,
  audience: ['Architecture firms', 'Interior & fit-out firms', 'Building contractors', 'Construction companies', 'Real-estate builders'],
  platform: 'Web application: any modern browser on Windows, macOS, Android or iOS; installable on phones and computers like an app',
  pricingModel:
    'Subscription per firm with a free trial: Starter, Studio and Business (plus custom Enterprise), chosen by team seats, site seats and active projects. Every plan has every feature. Billed monthly, or annually for the price of 10 months, and renewed automatically by card, UPI AutoPay or netbanking e-mandate; extra seats can be added anytime; cancel anytime. Current prices are on the pricing page.',
  // Owner-confirmed customer proof (same figures and stories as the About page).
  proof: {
    stats: ['30+ architecture and construction firms onboard', '₹120 Cr+ of project value tracked'],
    stories: [
      { company: 'Arch Consultancy', segment: 'Interior & fit-out', result: 'Monthly GST reconciliation cut from 2 days to 2 hours (80% faster) after replacing 14 Excel sheets per project' },
      { company: 'Munesh Associates', segment: 'Residential', result: '₹35 lakh of pending dues recovered — a 35% drop in outstanding payments within 3 months across 12 active projects' },
      { company: 'SS Constructions', segment: 'MEP & civil', result: 'Zero labour wage disputes after moving daily muster records into ARC PEM, with wages worked out automatically' },
    ],
  },
  // Every item is live in the product (ARCPEM-Web docs/FEATURES.md, ✅ sections). Planned work (AI features) and
  // built-but-not-switched-on items (automatic daily backups) are deliberately left out.
  featureGroups: [
    {
      name: 'Projects & budgets',
      items: [
        'Portfolio dashboard: spend, pending payments and trends across every project',
        'BOQ budgets with categories, line items and reusable budget templates',
        'Cost per sq ft, contingency and GST computed automatically',
        'Budget vs actual by category, with alerts at 90% and 100% of budget',
        'Project health score (0–100) with the reasons, and a completion forecast',
        'Milestones with target dates and overdue alerts',
      ],
    },
    {
      name: 'Expenses & ledgers',
      items: [
        'Vendor, contractor, labour and site-expense ledgers per project',
        'Daily labour headcount and wages by trade',
        'Contractor running bills, advances and TDS',
        'Bills, challans and site photos attached to every entry',
        'Duplicate-bill warnings across projects',
        'Payments split into cash, cheque and pending, with UPI, NEFT, RTGS and IMPS',
      ],
    },
    {
      name: 'Payments & parties',
      items: [
        'Party directory with GSTIN, PAN and a statement of account for each party',
        'Payment approvals: spends recorded below admin wait for sign-off',
        'Payment vouchers as PDF, with the amount in words',
        'WhatsApp payment confirmations and party statements',
        'Cheque register: issued, cleared, bounced or cancelled',
        'Pending payments report, oldest first, with days overdue',
      ],
    },
    {
      name: 'GST, TDS & accounts',
      items: [
        'GST purchase register by month, per project or for the whole firm',
        'GSTR-2B reconciliation against the JSON from the GST portal',
        'TDS register by financial year and quarter, with deposit due dates',
        'Quarterly TDS return worksheet for your accountant (Form 26Q / Form 140)',
        'Tally ERP / TallyPrime CSV export',
        'Excel and PDF reports, or a whole project exported in one file',
      ],
    },
    {
      name: 'Team & control',
      items: [
        'Eight roles, from owner and admin to site engineer and supervisor',
        'Per-project and per-area access for each person',
        'Change history on every entry and a firm-wide activity log',
        'Push notifications and scheduled reminders on phone and browser',
        'Project documents and drawings with numbered versions and review',
        'Global search (Ctrl+K) across projects, entries and parties',
      ],
    },
    {
      name: 'Platform & security',
      items: [
        'Runs in any browser; installs on phones like an app',
        'Each firm’s data isolated in the database itself (row-level security)',
        'Encrypted connections; private, virus-scanned file storage',
        'Back up, download and restore the firm’s data at any time',
        'Excel and CSV import with column matching and duplicate review',
        'Data stays readable and exportable if a plan lapses; nothing is deleted',
      ],
    },
  ],
  /** Topics the publisher is an authority on — feeds Organization.knowsAbout. */
  knowsAbout: [
    'Construction expense management',
    'Bill of Quantities (BOQ)',
    'Construction project budgeting',
    'GST for construction firms in India',
    'GSTR-2B reconciliation',
    'Tally ERP / TallyPrime integration',
    'Labour wage tracking',
    'Contractor billing',
    'TDS on contractor payments',
    'Construction payment approvals',
    'Bar bending schedule',
  ],
} as const

export const featureList = entity.featureGroups.flatMap((g) => g.items)

export const ORG_ID = `${company.siteUrl}/#organization`
export const SOFTWARE_ID = `${company.siteUrl}/#software`

/** The plan fields the public site shows; `price` is the stored monthly base (see lib/pricing.ts). */
export type PublicPlan = {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string
  maxProjects: number
  maxUsers: number
  maxSiteUsers?: number
  tier?: string | null
}

/** Active plans, with the billing rules (add-on prices, trial, annual discount) that price them. */
export type PlansByProduct = { DESKTOP: PublicPlan[]; WEB: PublicPlan[]; rules?: BillingRules }
const rulesOf = (plans: PlansByProduct) => plans.rules ?? DEFAULT_BILLING_RULES

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

/** "Studio", not "Web Studio": admin names the plans with a "Web" prefix. */
export const planName = (name: string) => name.replace(/^web\s+/i, '')
const planLabel = (name: string) => `${company.brand} ${planName(name)}`

const priced = (plans: PublicPlan[]) => plans.filter((p) => !isQuoted(p))
const lowest = (plans: PublicPlan[], interval: BillingInterval, rules: BillingRules) =>
  priced(plans).length ? Math.min(...priced(plans).map((p) => subscriptionPrice(p.price, interval, undefined, rules))) : null
const lim = (n?: number) => (n === undefined ? '' : isUnlimited(n) ? 'unlimited' : String(n))

/** One sentence on current prices, e.g. for the home FAQ and llms.txt; null when no plans could be loaded. */
export function priceSentence(plans: PlansByProduct): string | null {
  const rules = rulesOf(plans)
  const month = lowest(plans.WEB, 'MONTH', rules)
  const year = lowest(plans.WEB, 'YEAR', rules)
  if (month === null || year === null) return null
  const gst = company.pricesIncludeGst ? `including ${company.gstRatePct}% GST` : `plus ${company.gstRatePct}% GST`
  const trial = rules.trialDays > 0 ? `, after a ${rules.trialDays}-day free trial` : ''
  return `Plans start at ${inr(month)} a month, or ${inr(year)} a year billed annually (${gst})${trial}.`
}

/** Every plan as "ARC PEM Studio: ₹X per month or ₹Y per year — …" lines, for llms.txt. */
export function priceLines(plans: PlansByProduct): string[] {
  const rules = rulesOf(plans)
  const lines = plans.WEB.map((p) => {
    const limits = `${p.maxUsers}${isQuoted(p) ? '+' : ''} team seats, ${lim(p.maxSiteUsers)} site seats, ${lim(p.maxProjects)} active projects`
    return isQuoted(p)
      ? `${planLabel(p.name)}: custom annual pricing (${limits}) — ${p.description}`
      : `${planLabel(p.name)}: ${inr(subscriptionPrice(p.price, 'MONTH', undefined, rules))} per month or ${inr(subscriptionPrice(p.price, 'YEAR', undefined, rules))} per year (${limits}) — ${p.description}`
  })
  return lines.length
    ? [...lines, `Extra seats on any plan: ${inr(rules.seatAddonMonthly)} per team seat and ${inr(rules.siteSeatAddonMonthly)} per site seat, per month`]
    : lines
}

/**
 * The SoftwareApplication node, with one Offer per active plan. Rendered on
 * the home and pricing pages under the same @id, so answer engines get the
 * product, its platforms and its real prices from one consistent record.
 */
export function softwareJsonLd(plans: PlansByProduct) {
  const rules = rulesOf(plans)
  const base = company.siteUrl.replace(/\/$/, '')
  const offer = (p: PublicPlan, interval: BillingInterval) => {
    const price = subscriptionPrice(p.price, interval, undefined, rules)
    return {
      '@type': 'Offer',
      name: `${planLabel(p.name)} (${interval === 'MONTH' ? 'monthly' : 'annual'})`,
      description: p.description,
      category: interval === 'MONTH' ? 'Monthly subscription per firm' : 'Annual subscription per firm',
      price,
      priceCurrency: 'INR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'INR',
        unitText: interval,
        billingDuration: interval === 'MONTH' ? 'P1M' : 'P1Y',
        valueAddedTaxIncluded: company.pricesIncludeGst,
      },
      availability: 'https://schema.org/InStock',
      url: `${base}/pricing`,
      seller: { '@id': ORG_ID },
    }
  }
  const offers = priced(plans.WEB).flatMap((p) => [offer(p, 'MONTH'), offer(p, 'YEAR')])
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_ID,
    name: company.brand,
    alternateName: ['ARC PEM Project Expense Manager', 'ARCPEM'],
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: entity.category,
    operatingSystem: 'Web browser (Windows, macOS, Android, iOS)',
    browserRequirements: 'A current version of Chrome, Edge, Safari or Firefox',
    description: entity.definition,
    url: base,
    installUrl: WEB_APP_URL,
    image: `${base}/og-image.jpg`,
    featureList,
    audience: { '@type': 'BusinessAudience', audienceType: entity.audience.join(', ') },
    areaServed: { '@type': 'Country', name: 'India' },
    inLanguage: 'en-IN',
    publisher: { '@id': ORG_ID },
    ...(offers.length ? { offers } : {}),
  }
}

export type Faq = { q: string; a: string }

/**
 * The questions people ask AI assistants and search about ARC PEM itself,
 * answered in the first sentence. Shown on the home page and in llms.txt.
 */
export function homeFaqs(plans: PlansByProduct): Faq[] {
  const prices = priceSentence(plans)
  const rules = rulesOf(plans)
  return [
    { q: 'What is ARC PEM?', a: entity.definition },
    {
      q: 'Who makes ARC PEM?',
      a: `ARC PEM is made by ${company.legalName}, a software company based in ${company.address.city}, ${company.address.state}, ${company.address.country}.`,
    },
    {
      q: 'Is ARC PEM cloud software?',
      a: `Yes. ARC PEM runs in the browser at ${WEB_APP_URL}, so the whole firm — office, accounts and site — works on the same live data from any computer or phone. There is nothing to install, and it can be added to a phone’s home screen like an app.`,
    },
    {
      q: 'Does ARC PEM work on mobile phones?',
      a: 'Yes. ARC PEM works in any modern mobile browser and installs on the home screen like an app, so site engineers can add bills with receipt photos and get push reminders for payments and approvals.',
    },
    {
      q: 'Is our data safe in ARC PEM?',
      a: 'Each firm’s data is isolated inside the database itself (row-level security), connections are encrypted, uploaded files are virus-scanned and stored privately, and every ledger change is recorded with who made it. The firm can take a full backup, download it and restore it at any time. If a plan lapses, the data stays readable and exportable; nothing is deleted.',
    },
    {
      q: 'Does ARC PEM work with Tally?',
      a: 'Yes. ARC PEM does not replace Tally; it exports vendor bills and expenses as Tally ERP / TallyPrime-ready CSV files, so the accounts team or CA imports them instead of re-typing site data.',
    },
    {
      q: 'How much does ARC PEM cost?',
      a: `ARC PEM is a subscription per firm — Starter, Studio and Business, plus custom Enterprise — priced by team seats, site seats and active projects, with every feature on every plan. ${prices ? `${prices} ` : ''}Annual billing costs ${rules.annualBilledMonths} months' price. Extra seats can be added anytime, and it renews automatically by card, UPI AutoPay or netbanking e-mandate; cancel anytime. See ${company.siteUrl}/pricing for current prices.`,
    },
    {
      q: 'Can my whole team use ARC PEM?',
      a: 'Yes. The firm owner invites team members from inside the app and gives each a role — admin, manager, project manager, site engineer, supervisor or member — and the projects they can see, with payment approvals for spends that need sign-off. Site engineers and supervisors use low-cost site seats, so the whole site team can be on it.',
    },
    {
      q: 'How does ARC PEM handle GST?',
      a: 'GST is computed on every bill as it is entered and a GST purchase register builds itself by month and project. Upload the GSTR-2B JSON from the GST portal and ARC PEM matches it against your GST bills, so missing or mismatched supplier filings are caught before credit is claimed in GSTR-3B. The register exports to Excel or to Tally for your CA.',
    },
    {
      q: 'Who is ARC PEM for?',
      a: `${entity.audience.join(', ')} in India — firms that want project costs, vendor bills, labour wages, contractor bills and GST in one tool instead of a stack of Excel sheets.`,
    },
    {
      q: 'Can we bring our existing data into ARC PEM?',
      a: 'Yes. Existing expense sheets can be imported from Excel or CSV: columns are matched automatically and you review a preview, including possible duplicates, before anything is saved. Business and Enterprise plans include onboarding and data migration by our team.',
    },
    {
      q: 'Does ARC PEM handle TDS on contractor payments?',
      a: 'Yes. TDS is recorded on each contractor or vendor entry with its section, nature of payment, deposit date and challan number. A TDS register groups it by financial year and quarter with deposit due dates, and a quarterly worksheet (Form 26Q, and Form 140 from 1 April 2026) is ready for your accountant to file from.',
    },
    {
      q: 'How do payment approvals work in ARC PEM?',
      a: 'A vendor or contractor payment recorded by anyone below Admin waits for an Admin or the Owner to approve it, and both sides are notified. Until it is approved the entry still counts in the ledger, but its payment voucher, WhatsApp confirmation and cheque-register entry are held back.',
    },
    {
      q: 'Does ARC PEM work offline?',
      a: 'No. ARC PEM is cloud software and needs an internet connection, which is what lets the site, office and accounts see the same numbers the moment a bill is entered. It works on ordinary mobile data and installs on a phone’s home screen like an app.',
    },
    {
      q: 'What happens to our data if a payment fails or we stop paying?',
      a: 'Nothing is deleted. If a paid plan’s renewal fails, the firm keeps full access for a 14-day grace period with a reminder banner. After that the workspace becomes read-only: everything can still be viewed and exported, and renewing restores full access at once.',
    },
    {
      q: 'Do we get a GST invoice for our subscription?',
      a: `Yes. Prices are shown before ${company.gstRatePct}% GST, which is added at checkout, and every charge comes with a GST tax invoice that is emailed and can be downloaded from your account. Add your billing name, address and GSTIN once before the first payment.`,
    },
    {
      q: 'Can I try ARC PEM before buying?',
      a: rules.trialDays > 0
        ? `Yes. A firm’s first subscription starts with a ${rules.trialDays}-day free trial on any plan: auto-pay is set up at the start, nothing is charged until the trial ends, and cancelling before then costs nothing. You can also book a free live demo at ${company.siteUrl}/contact.`
        : `Yes. Book a free live demo at ${company.siteUrl}/contact and the ${company.legalName} team walks you through ARC PEM on projects like yours. Monthly billing also lets you start small and cancel anytime.`,
    },
  ]
}
