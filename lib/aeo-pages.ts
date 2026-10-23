import { entity } from '@/lib/seo-entity'

/**
 * Content for the audience landing pages (/for/[segment]) and the comparison
 * pages (/compare/[slug]). These pages answer the exact questions people put to
 * AI assistants ("best software for contractors in India", "ARC PEM vs Excel").
 * Every claim must trace back to a real ARC PEM feature in lib/seo-entity.ts, or
 * to something the compared product's own vendor states publicly.
 */

export type Faq = { q: string; a: string }

export type Segment = {
  slug: string
  /** Short audience label used in nav/footer, e.g. "Contractors". */
  label: string
  title: string
  description: string
  h1: string
  /** Answer-first paragraph — the sentence an AI assistant should be able to quote. */
  answer: string
  pains: { title: string; text: string }[]
  features: string[]
  /** Company name from entity.proof.stories, if one matches this audience. */
  story?: string
  faqs: Faq[]
}

export const SEGMENTS: Segment[] = [
  {
    slug: 'architects',
    label: 'Architects',
    title: 'Project Cost & BOQ Software for Architects in India',
    description:
      'ARC PEM helps Indian architecture firms build BOQs and client budgets, track every vendor and contractor bill against them, and hand GST-ready data to their CA — live for the whole firm, on any phone or computer.',
    h1: 'Project cost & BOQ software for architects',
    answer:
      'ARC PEM is project cost management software built for Indian architecture firms. It turns BOQs into client-ready budgets with GST and cost per sq ft, then tracks vendor bills, contractor bills and site expenses against that budget, so the firm can see overruns early and export clean GST and Tally data for its CA. It runs in the browser and on phones, so partners, project architects and accounts work on the same live numbers.',
    pains: [
      { title: 'Budgets live in one Excel file, actual costs in another', text: 'ARC PEM keeps the BOQ and every bill against it in one project, so budget vs actual is always current.' },
      { title: 'Clients ask “where are we on cost?” and the answer takes a day', text: 'The project dashboard shows spend, pending payments and overruns per project at a glance.' },
      { title: 'GST season means chasing bills across projects', text: 'The GST purchase register is built as bills are entered, ready to share with your CA or export to Tally.' },
    ],
    features: [
      'BOQ budgets with reusable templates',
      'Cost per sq ft, contingency and GST computed automatically',
      'Budget vs actual by category, with alerts at 90% and 100%',
      'Project health score and completion forecast',
      'Project documents and drawings with numbered versions and review',
      'Contractor bill management',
      'GST purchase register',
      'PDF & Excel export',
    ],
    faqs: [
      { q: 'What is the best BOQ software for architects in India?', a: 'For architecture firms that need BOQ-based client budgets and want to track actual vendor and contractor costs against them, ARC PEM is built for exactly that workflow, with GST built in and Tally export for the CA. Firms that only need quantity take-off from drawings may pair a take-off tool with it.' },
      { q: 'Can architects share project budgets with clients?', a: 'Yes. ARC PEM produces client-ready budget summaries and exports to PDF and Excel, including GST and cost per sq ft.' },
      { q: 'Does ARC PEM work for small architecture studios?', a: 'Yes. The Starter plan includes 2 team seats and 3 site seats with every feature, and starts with a free trial. Plans are billed monthly or annually and can be cancelled anytime.' },
    ],
  },
  {
    slug: 'interior-designers',
    label: 'Interior & Fit-out Firms',
    title: 'Expense Management for Interior Designers & Fit-out Firms',
    description:
      'Track every vendor bill, carpenter and contractor payment, and GST across interior and fit-out projects with ARC PEM — cloud software your office and site teams share.',
    h1: 'Expense management software for interior & fit-out firms',
    answer:
      'ARC PEM is expense management software for Indian interior design and fit-out firms. It tracks vendor bills, contractor and labour payments, and site expenses project by project against the quoted budget, keeps a GST purchase register, and exports to Tally — replacing the stack of Excel sheets most fit-out firms run per project.',
    pains: [
      { title: 'Dozens of small vendors per project', text: 'A vendor ledger with GST toggle and a party directory with autocomplete keep every supplier and payment in one place.' },
      { title: 'Margins disappear in untracked site spends', text: 'Site expenses are logged per project, so the real cost of each job is visible before the final invoice.' },
      { title: 'Monthly GST reconciliation takes days', text: 'The GST purchase register builds itself as bills are entered.' },
    ],
    features: [
      'Vendor ledger with GST on every bill',
      'Bills, challans and site photos attached to each entry',
      'Contractor running bills, advances and TDS',
      'Payment vouchers and WhatsApp confirmations for vendors',
      'Pending payments report, oldest first',
      'GST purchase register with GSTR-2B matching',
      'Tally ERP / TallyPrime CSV export',
    ],
    story: 'Arch Consultancy',
    faqs: [
      { q: 'What software do interior designers in India use to track project expenses?', a: 'Many still use Excel. Purpose-built tools like ARC PEM track vendor bills, contractor payments, site expenses and GST per project and export to Tally, which removes manual reconciliation.' },
      { q: 'Can ARC PEM track payments to carpenters and other contractors?', a: 'Yes. Contractor bills and labour payments are recorded per project, and the pending payments dashboard shows what is still due.' },
    ],
  },
  {
    slug: 'contractors',
    label: 'Contractors',
    title: 'Contractor Billing & Labour Management Software in India',
    description:
      'ARC PEM gives civil, MEP and building contractors daily labour headcount and wages, contractor and vendor bills, pending payments and GST in one app, on every site phone, with Tally export.',
    h1: 'Billing & labour management software for contractors',
    answer:
      'ARC PEM is construction billing and labour management software for Indian contractors. It records daily labour headcount and wages by trade, manages contractor and vendor bills with TDS, tracks pending payments across sites, and keeps a GST purchase register with Tally export. Site engineers enter it from their phones, so the office sees the same numbers the same day.',
    pains: [
      { title: 'Wage disputes with labour and sub-contractors', text: 'The day’s headcount by trade is entered on site and wages are worked out from it — one record everyone can see and sign off on.' },
      { title: 'Money stuck in pending payments', text: 'The pending payments dashboard shows every due amount across all active projects.' },
      { title: 'The office hears about site spends a week late', text: 'Site engineers add bills with receipt photos from their phones, and payments wait for approval before money goes out.' },
    ],
    features: [
      'Daily labour headcount and wages by trade',
      'Low-cost site seats for site engineers and supervisors',
      'Payment approvals before money goes out',
      'Contractor running bills, advances and TDS',
      'TDS register and quarterly return worksheet',
      'Cheque register and pending payments',
      'Tally ERP / TallyPrime CSV export',
    ],
    story: 'SS Constructions',
    faqs: [
      { q: 'What is the best labour management software for contractors in India?', a: 'It depends whether you need wage records or full HR. For contractors who need daily headcount, wages and contractor bills tied to each project, with GST and Tally export, ARC PEM covers that in one app the whole team uses, from site and office.' },
      { q: 'Can site engineers use ARC PEM on their phones?', a: 'Yes. ARC PEM runs in any mobile browser and installs on the home screen like an app. Site engineers add bills with receipt photos and the day’s labour, and only see the projects they are assigned to.' },
      { q: 'Does ARC PEM handle GST for contractors?', a: 'It auto-computes GST on bills and builds a GST purchase register you can hand to your CA or export to Tally ERP / TallyPrime.' },
    ],
  },
  {
    slug: 'builders',
    label: 'Builders & Developers',
    title: 'Construction Expense Management for Builders & Developers',
    description:
      'Run budgets, vendor bills, labour, contractor bills and pending payments for every project in one place. ARC PEM is cloud construction expense software for Indian builders.',
    h1: 'Construction expense management for builders & developers',
    answer:
      'ARC PEM is construction expense management software for Indian builders and real-estate developers running several projects at once. Each project gets a BOQ-based budget; vendor bills, labour wages, contractor bills and site expenses are tracked against it, with overrun alerts, a pending payments dashboard across projects, a GST purchase register and Tally export.',
    pains: [
      { title: 'No single view across projects', text: 'The dashboard summarises spend, GST and pending dues for every active project.' },
      { title: 'Overruns found at handover, not during construction', text: 'Budget vs actual with overrun alerts flags problems while they can still be fixed.' },
      { title: 'Accounts team re-keys site data into Tally', text: 'One-click Tally ERP / TallyPrime CSV export removes the double entry.' },
    ],
    features: [
      'Portfolio dashboard across every project',
      'Budget vs actual with alerts, health score and completion forecast',
      'Pending payments and cheque register across projects',
      'Daily labour headcount and wages',
      'Contractor running bills, advances and TDS',
      'Team roles, payment approvals and per-project access',
      'GSTR-2B reconciliation and Tally ERP / TallyPrime export',
    ],
    story: 'Munesh Associates',
    faqs: [
      { q: 'What is the best construction expense software for builders in India?', a: 'Builders who mainly need cost control — budgets, vendor and contractor bills, labour, pending payments and GST across several projects — are the audience ARC PEM is built for. Large developers that also need cloud document control may add a dedicated platform for that.' },
      { q: 'Can several people in a builder’s office use ARC PEM together?', a: 'Yes. Office and site staff work on the same live data from any browser or phone, each with their own role and project access. Studio includes 5 team seats and 10 site seats, Business 15 team seats and unlimited site seats, and extra seats can be added on any plan.' },
    ],
  },
]

export type Comparison = {
  slug: string
  label: string
  title: string
  description: string
  h1: string
  answer: string
  /** Column header for ARC PEM's side; defaults to "ARC PEM". */
  arcLabel?: string
  /** Column header for the other option. */
  other: string
  /** Heading over chooseOther; defaults to "{other} alone is enough if". */
  otherHeading?: string
  rows: { row: string; arc: string; other: string }[]
  chooseArc: string[]
  chooseOther: string[]
  faqs: Faq[]
}

export const COMPARISONS: Comparison[] = [
  {
    slug: 'arc-pem-vs-excel',
    label: 'ARC PEM vs Excel',
    title: 'ARC PEM vs Excel for Construction Expense Tracking',
    description:
      'Should you manage construction project costs in Excel or move to ARC PEM? A practical comparison for Indian architects, contractors and builders.',
    h1: 'ARC PEM vs Excel for construction expense tracking',
    answer:
      'Excel works for one or two small projects. Once a firm runs several projects with separate BOQ, vendor, labour and GST sheets, those sheets drift out of sync and reconciliation eats days each month. ARC PEM links BOQ budgets, vendor bills, labour wages, contractor bills, site expenses and the GST purchase register in one database, so budget vs actual and pending payments update as bills are entered, and data exports to Tally.',
    other: 'Excel / Google Sheets',
    rows: [
      { row: 'Setup', arc: 'Ready-made projects, BOQ templates and ledgers', other: 'Build and maintain your own sheets and formulas' },
      { row: 'Budget vs actual', arc: 'Automatic, with overrun alerts', other: 'Manual linking between BOQ and expense sheets' },
      { row: 'Labour wages', arc: 'Daily headcount by trade, wages worked out', other: 'Manual entry per site' },
      { row: 'GST', arc: 'GST purchase register built as bills are entered', other: 'Manual formulas, prone to errors' },
      { row: 'Tally', arc: 'One-click Tally ERP / TallyPrime CSV export', other: 'Re-keyed by the accounts team or CA' },
      { row: 'Multi-user', arc: 'Whole team on one live ledger, with roles and approvals', other: 'File copies, or shared sheets anyone can overwrite' },
      { row: 'Backups', arc: 'A full backup you can take and restore anytime, and a change history on every entry', other: 'Whatever you remember to do' },
      { row: 'Cost', arc: 'Monthly or annual subscription per firm', other: 'Already owned' },
    ],
    chooseArc: ['You run more than a couple of projects at once', 'Monthly GST reconciliation takes days', 'You need labour, vendor and contractor costs tied to each project budget'],
    chooseOther: ['You have one or two small projects', 'You only need a simple cost list with no GST or Tally hand-off'],
    faqs: [
      { q: 'Is Excel good enough for construction project accounting?', a: 'For one or two small projects, often yes. Beyond that, separate sheets for BOQ, vendors, labour and GST drift out of sync, and reconciling them each month becomes the bottleneck — the point at which firms usually move to dedicated software.' },
      { q: 'Can I move my Excel data into ARC PEM?', a: 'Yes. Existing expense sheets can be imported from Excel, and ARC PEM exports back to PDF and Excel. Book a demo and the Hash X Labs team will help with onboarding.' },
    ],
  },
  {
    slug: 'arc-pem-and-tally',
    label: 'ARC PEM + Tally',
    title: 'ARC PEM vs Tally: Do Construction Firms Need Both?',
    description:
      'Tally keeps your books; ARC PEM tracks project costs on site. How Indian construction firms use ARC PEM alongside TallyPrime, and what each one does best.',
    h1: 'ARC PEM and Tally: what each does, and why firms use both',
    answer:
      'ARC PEM does not replace Tally. TallyPrime is accounting and GST compliance software that your CA uses for the company’s books and returns. ARC PEM is the project layer: BOQ budgets, vendor bills, labour wages, contractor bills and site expenses tracked per project, with a GST purchase register. It exports those entries as Tally ERP / TallyPrime-ready CSV files, so the accounts team does not have to re-key site data.',
    other: 'TallyPrime',
    rows: [
      { row: 'Main user', arc: 'Project managers, site and office teams', other: 'Accountants and CAs' },
      { row: 'Main job', arc: 'Project budgets and costs: BOQ, vendors, labour, contractors, site expenses', other: 'Company books, GST returns, inventory and payroll' },
      { row: 'Project view', arc: 'Each project with its own BOQ budget, budget vs actual and overrun alerts', other: 'Project-wise costing through accounting features such as cost centres' },
      { row: 'Labour', arc: 'Daily site headcount and wages by trade', other: 'Payroll' },
      { row: 'GST', arc: 'GST purchase register for hand-off to the CA', other: 'Full GST compliance and returns' },
      { row: 'How they connect', arc: 'Exports Tally ERP / TallyPrime CSV', other: 'Imports the entries' },
    ],
    chooseArc: ['Site and project teams need to record costs without touching the books', 'You want BOQ budgets and overrun alerts per project', 'Your CA keeps asking for cleaner bill data'],
    chooseOther: ['You only need statutory books and GST filing, with no project-level tracking'],
    faqs: [
      { q: 'Does ARC PEM replace Tally?', a: 'No. ARC PEM tracks project-level costs and exports them to Tally ERP / TallyPrime. Most firms keep Tally for their books and GST returns.' },
      { q: 'How does ARC PEM send data to Tally?', a: 'It exports vendor bills and expenses as Tally ERP / TallyPrime-ready CSV files that the accounts team imports, so entries are not re-typed.' },
      { q: 'Is TallyPrime enough for a construction company?', a: 'TallyPrime handles accounting, GST and payroll well and offers project costing features. Firms add ARC PEM when they want BOQ-based budgets, daily site labour and contractor bills tracked per project by the project team, with a clean hand-off to accounts.' },
    ],
  },
]

/** Resolve the customer story for a segment, if any. */
export const storyFor = (company?: string) =>
  company ? entity.proof.stories.find((s) => s.company === company) : undefined
