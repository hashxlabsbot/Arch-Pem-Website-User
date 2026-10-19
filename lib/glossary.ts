/**
 * Construction-finance glossary for /glossary. Each entry answers "What is X?"
 * in its first sentence (the line an AI assistant or featured snippet quotes),
 * then explains it the way an Indian site engineer or accountant would.
 *
 * Rules: keep definitions to stable facts (standards, formulas, statute
 * sections) rather than rates that change with each budget; anything about
 * ARC PEM in `inArcPem` must match a feature listed in lib/seo-entity.ts.
 */

export type GlossaryTerm = {
  slug: string
  /** Full name, e.g. "Bill of Quantities (BOQ)". */
  term: string
  /** The question people search, used as the page's H1. */
  question: string
  /** Answer-first definition, one or two sentences. */
  definition: string
  details: string[]
  example?: string
  inArcPem: string
  /** Free tool slug from lib/tools.ts, if one fits. */
  tool?: string
  related: string[]
  faqs: { q: string; a: string }[]
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'bill-of-quantities',
    term: 'Bill of Quantities (BOQ)',
    question: 'What is a Bill of Quantities (BOQ)?',
    definition:
      'A Bill of Quantities (BOQ) is an itemised list of every material, labour and work item a construction project needs, with the unit, quantity and rate of each, so the project’s cost can be estimated, tendered and controlled.',
    details: [
      'A BOQ is prepared from the drawings and specifications, usually by the architect, a quantity surveyor or an estimator. Each line describes one item of work — for example PCC in foundations, brickwork in cement mortar or vitrified tile flooring — with its unit of measurement (cum, sqm, rmt, kg or nos), quantity, rate and amount.',
      'Contractors price the BOQ when they bid, so bids can be compared line by line. Once work starts, the BOQ becomes the project budget: contractor and vendor bills are checked against its quantities and rates, and anything beyond it shows up as a variation.',
      'In India, BOQ item descriptions often follow the CPWD Delhi Schedule of Rates (DSR) or a state PWD schedule, with GST added on the total.',
    ],
    example:
      'Illustrative line: “Brickwork in cement mortar 1:6 · Unit: cum · Quantity: 42 · Rate: ₹6,800 · Amount: ₹2,85,600.”',
    inArcPem:
      'ARC PEM builds each project’s budget from a BOQ, with reusable BOQ templates and cost per sq ft, contingency and GST computed automatically. Vendor bills, labour wages, contractor bills and site expenses are then tracked against it as budget vs actual, with overrun alerts.',
    tool: 'construction-cost-calculator',
    related: ['cost-per-square-foot', 'budget-vs-actual', 'contingency', 'running-account-bill'],
    faqs: [
      { q: 'Who prepares a BOQ?', a: 'Usually the architect, a quantity surveyor or the client’s estimator, working from the drawings and specifications. Contractors then price it when they bid.' },
      { q: 'What is the difference between a BOQ and an estimate?', a: 'An estimate is the overall expected cost, often a rough figure such as a rate per sq ft. A BOQ is the item-by-item breakdown of quantities and rates behind that cost, and it is what tenders and bills are checked against.' },
    ],
  },
  {
    slug: 'bar-bending-schedule',
    term: 'Bar Bending Schedule (BBS)',
    question: 'What is a Bar Bending Schedule (BBS)?',
    definition:
      'A bar bending schedule (BBS) is a table listing every reinforcement bar in an RCC member — its bar mark, diameter, shape, number of bars, cutting length and weight — so steel can be cut, bent and ordered accurately.',
    details: [
      'Site engineers prepare a BBS from the structural drawings for each beam, column, slab and footing. The cutting length of a bent bar is its total length along the bends, less the bend deductions, plus any hooks the design calls for. Shapes and bend allowances follow IS 2502 and the detailing practice in SP 34.',
      'Bar weight is usually worked out as D²/162 kilograms per metre, where D is the bar diameter in millimetres — so a 12 mm bar weighs about 0.89 kg per metre.',
      'Totalled by diameter, the BBS tells the purchase team exactly how many kilograms of 8 mm, 10 mm, 12 mm and larger bars to order, cuts wastage, and gives the engineer a basis for checking the steel fixer’s bill.',
    ],
    example: 'A 12 mm bar, 6 m long: 12² ÷ 162 = 0.889 kg/m × 6 m ≈ 5.33 kg.',
    inArcPem:
      'Build the schedule with the free BBS calculator, then record steel purchases as vendor bills against the project in ARC PEM, where they count towards budget vs actual.',
    tool: 'bar-bending-schedule-calculator',
    related: ['concrete-mix-ratio', 'bill-of-quantities'],
    faqs: [
      { q: 'What is the formula for steel bar weight per metre?', a: 'Weight (kg/m) = D² ÷ 162, where D is the bar diameter in mm. An 8 mm bar weighs about 0.395 kg/m, 10 mm about 0.617 kg/m and 16 mm about 1.58 kg/m.' },
      { q: 'Why is a bar bending schedule important?', a: 'It turns the drawings into exact cutting lengths and quantities, so steel is ordered once, cut with little wastage, and the reinforcement contractor’s bill can be checked bar by bar.' },
    ],
  },
  {
    slug: 'running-account-bill',
    term: 'Running Account (RA) Bill',
    question: 'What is a Running Account (RA) bill in construction?',
    definition:
      'A running account (RA) bill is an interim bill a contractor raises during a project for the work completed since the previous bill, based on measured quantities, so the contractor is paid in stages rather than only at the end.',
    details: [
      'RA bills are numbered in sequence — 1st RA bill, 2nd RA bill and so on. Each shows the cumulative quantity of work done to date, the quantity already billed and the quantity billed now, priced at the agreed BOQ rates.',
      'From the gross amount the client typically deducts advances being recovered, retention money, TDS and the cost of any material it supplied, and GST is added. The last bill on the contract is the final bill, which settles every quantity.',
      'Quantities in an RA bill are normally backed by measurement-book entries signed by the site engineer.',
    ],
    inArcPem:
      'Contractor bills are recorded per project in ARC PEM against the budget, and the pending payments dashboard shows what is still due to each contractor across every site.',
    tool: 'contractor-bill-generator',
    related: ['measurement-book', 'retention-money', 'bill-of-quantities'],
    faqs: [
      { q: 'What is the difference between an RA bill and a final bill?', a: 'RA bills are interim payments for work done so far. The final bill closes the contract: it settles all measured quantities and variations, after which only retention money remains to be released at the end of the defect liability period.' },
      { q: 'Is GST charged on RA bills?', a: 'Yes. GST applies to each RA bill as the work is billed; the rate depends on the type of works contract, so confirm it with your CA.' },
    ],
  },
  {
    slug: 'measurement-book',
    term: 'Measurement Book (MB)',
    question: 'What is a measurement book (MB) in construction?',
    definition:
      'A measurement book (MB) is the official record of measurements of work done and materials received on a construction project. Entries are taken on site and signed by the engineer, and they are the basis for paying contractors’ bills.',
    details: [
      'Each entry records the date, the item of work as described in the BOQ, its location and the measured dimensions — length, breadth and depth — with the resulting quantity. Government departments such as CPWD and state PWDs use bound, page-numbered measurement books; private firms often keep the same record in registers or software.',
      'Because bills are checked against the MB, work should be measured as it progresses — especially items that get covered up, such as foundations, reinforcement and concealed services.',
    ],
    inArcPem:
      'Once measured work is billed, ARC PEM records the contractor bill against the project budget and tracks what has been paid and what is still pending.',
    related: ['running-account-bill', 'bill-of-quantities', 'muster-roll'],
    faqs: [
      { q: 'Who signs the measurement book?', a: 'The engineer who takes or checks the measurements, with the contractor or their representative acknowledging them. Senior engineers usually test-check a share of the entries before bills are passed.' },
    ],
  },
  {
    slug: 'muster-roll',
    term: 'Muster Roll',
    question: 'What is a muster roll on a construction site?',
    definition:
      'A muster roll is the daily attendance register of workers on a construction site. It records who worked each day, their trade and wage rate, and it is the basis for calculating and paying labour wages.',
    details: [
      'Supervisors or labour contractors mark attendance at the start of each shift. At the end of the wage period — often weekly on construction sites — the days each worker attended are multiplied by their daily rate, with overtime added and advances deducted, to arrive at the wages due.',
      'Employers and contractors are required by labour law to keep attendance and wage records for workers; the exact registers and formats depend on the applicable laws and state rules.',
      'Wage disputes usually start when the contractor’s headcount and the site’s headcount differ, which is why one signed muster that both sides agree on matters.',
    ],
    inArcPem:
      'ARC PEM records daily labour headcount and wages per project, entered by trade from site, so wages are worked out from one record everyone can see.',
    related: ['running-account-bill', 'measurement-book'],
    faqs: [
      { q: 'How are labour wages calculated from a muster roll?', a: 'Wages due = days worked × daily wage rate + overtime − advances already paid, worked out for each worker over the wage period.' },
    ],
  },
  {
    slug: 'retention-money',
    term: 'Retention Money',
    question: 'What is retention money in construction contracts?',
    definition:
      'Retention money is a percentage held back from each contractor bill — typically 5% to 10%, as set in the contract — and released after the work is complete and the defect liability period ends, as security against defects and incomplete work.',
    details: [
      'Retention accumulates across RA bills. Contracts often release it in two parts: some on completion and the rest at the end of the defect liability period, frequently 12 months, as the contract specifies.',
      'Some contracts let the contractor replace cash retention with a bank guarantee of the same value.',
      'For the contractor, retention is money billed but not yet received, so it should be tracked separately from ordinary dues or it is easily forgotten at the end of a long project.',
    ],
    inArcPem:
      'ARC PEM’s pending payments dashboard shows what is still due on every project, so amounts held back don’t get lost between bills.',
    related: ['running-account-bill', 'budget-vs-actual'],
    faqs: [
      { q: 'When is retention money released?', a: 'As the contract says — commonly part on completion of the work and the balance after the defect liability period, once any defects reported in that time have been put right.' },
    ],
  },
  {
    slug: 'cost-per-square-foot',
    term: 'Construction Cost per Square Foot',
    question: 'How is construction cost per square foot calculated?',
    definition:
      'Construction cost per square foot is the total construction cost of a building divided by its built-up area in square feet. It is the quickest way to compare budgets, quotes and projects of different sizes.',
    details: [
      'Cost per sq ft = total project cost ÷ built-up area (sq ft). A 2,000 sq ft house that costs ₹40 lakh to build works out to ₹2,000 per sq ft.',
      'What goes into “total cost” matters: some quotes cover only the structure and basic finishes, others include interiors, electrical and plumbing fittings, approvals and GST. Compare like with like, and be clear whether the area is carpet, built-up or super built-up.',
      'Rates vary widely with city, specification, labour availability and material prices, so a per sq ft rate is a planning figure; a BOQ gives the real budget.',
    ],
    inArcPem:
      'ARC PEM calculates cost per sq ft for each project from its BOQ budget, and shows how actual spending compares as bills come in.',
    tool: 'construction-cost-calculator',
    related: ['bill-of-quantities', 'budget-vs-actual', 'contingency'],
    faqs: [
      { q: 'What is the difference between carpet, built-up and super built-up area?', a: 'Carpet area is the usable floor area inside the walls (RERA defines it precisely). Built-up area adds the thickness of the walls and usually balconies. Super built-up area adds a share of common areas such as lobbies, stairs and lifts.' },
    ],
  },
  {
    slug: 'budget-vs-actual',
    term: 'Budget vs Actual',
    question: 'What is budget vs actual in construction project management?',
    definition:
      'Budget vs actual is the comparison of what a project was planned to cost with what has actually been spent, item by item, so overruns are spotted while there is still time to act.',
    details: [
      'The variance on each item is actual minus budget; a positive variance is an overrun. It is often shown as a percentage too: (actual − budget) ÷ budget × 100.',
      'It only works if actual costs are recorded against the same items as the budget. If the BOQ has a line for flooring, the tile vendor’s bill must land under flooring, not in a general expenses sheet.',
      'Looking at committed costs — work ordered but not yet billed — as well as payments gives an earlier warning than payments alone.',
    ],
    inArcPem:
      'ARC PEM tracks every vendor bill, labour wage, contractor bill and site expense against the project’s BOQ budget and flags overruns as they happen.',
    related: ['bill-of-quantities', 'contingency', 'cost-per-square-foot'],
    faqs: [
      { q: 'What is a cost overrun?', a: 'A cost overrun is the amount by which the actual cost of an item or a whole project exceeds its budget. Common causes are quantity changes, price rises, rework and scope added without a revised budget.' },
    ],
  },
  {
    slug: 'contingency',
    term: 'Contingency (Construction Budget)',
    question: 'What is contingency in a construction budget?',
    definition:
      'Contingency is an amount added to a construction budget, usually a percentage of the estimated cost, to cover unforeseen work, price rises and small design changes that cannot be priced in advance.',
    details: [
      'Contingencies of roughly 3% to 10% of project cost are common, with higher figures for renovation work and early-stage estimates, where more is unknown.',
      'Contingency is not a reserve for planned scope. Draw on it only for genuinely unforeseen items and record each use, so the client can see why the budget moved.',
    ],
    inArcPem: 'ARC PEM computes contingency and GST automatically on each project budget.',
    related: ['budget-vs-actual', 'bill-of-quantities', 'cost-per-square-foot'],
    faqs: [
      { q: 'How much contingency should a construction budget have?', a: 'It depends on how much is still unknown. New-build projects with complete drawings often carry 3% to 5%; renovations and early estimates usually need more.' },
    ],
  },
  {
    slug: 'gst-purchase-register',
    term: 'GST Purchase Register',
    question: 'What is a GST purchase register?',
    definition:
      'A GST purchase register is a record of every purchase invoice a business receives, with the supplier’s GSTIN, invoice number and date, taxable value and the CGST, SGST or IGST charged. It is the basis for claiming input tax credit and reconciling with the GST portal.',
    details: [
      'For each bill it captures the supplier name and GSTIN, invoice number and date, place of supply, taxable value, GST rate and tax amounts. Purchases within the state carry CGST and SGST; purchases from another state carry IGST.',
      'Each month the register is matched against GSTR-2B, the statement the GST portal builds from suppliers’ filings, so only credit backed by suppliers’ returns is claimed.',
      'For a construction firm with dozens of vendors per project, keeping the register current as bills arrive avoids the month-end scramble to collect invoices from every site.',
    ],
    inArcPem:
      'ARC PEM builds the GST purchase register automatically as bills are entered on each project, ready to share with your CA or export to Tally ERP / TallyPrime.',
    related: ['gstr-2b', 'input-tax-credit'],
    faqs: [
      { q: 'What is the difference between a purchase register and GSTR-2B?', a: 'The purchase register is your own record of the bills you received. GSTR-2B is the GST portal’s statement of the invoices your suppliers reported. Matching the two each month shows missing, unreported or mismatched invoices.' },
    ],
  },
  {
    slug: 'gstr-2b',
    term: 'GSTR-2B',
    question: 'What is GSTR-2B?',
    definition:
      'GSTR-2B is a monthly statement of input tax credit that the GST portal generates for each registered taxpayer. It lists the purchase invoices your suppliers have reported in their returns and shows how much credit is available to claim.',
    details: [
      'It is generated for each return period from the invoices suppliers reported by the filing cut-off. Under the GST law, input tax credit can generally be claimed only for invoices that appear in GSTR-2B.',
      'Reconciling GSTR-2B with your own purchase register each month shows which suppliers haven’t filed, which invoices are missing or mismatched, and how much credit you can safely claim in GSTR-3B.',
    ],
    inArcPem:
      'ARC PEM keeps your GST purchase register and reconciles it against the GSTR-2B you download from the GST portal.',
    related: ['gst-purchase-register', 'input-tax-credit'],
    faqs: [
      { q: 'What is the difference between GSTR-2A and GSTR-2B?', a: 'GSTR-2A updates continuously as suppliers file. GSTR-2B is a monthly statement generated for a fixed period, and it is the one used to decide how much credit to claim in GSTR-3B.' },
    ],
  },
  {
    slug: 'input-tax-credit',
    term: 'Input Tax Credit (ITC)',
    question: 'What is input tax credit (ITC) under GST?',
    definition:
      'Input tax credit (ITC) is the GST a business pays on its purchases, which it can set off against the GST it owes on its own sales, so tax is effectively paid only on the value it adds.',
    details: [
      'Example: a contractor pays ₹18,000 GST on materials and services and charges ₹30,000 GST on its bills to the client. After claiming ₹18,000 as ITC, it pays the remaining ₹12,000 in cash.',
      'To claim ITC under Section 16 of the CGST Act, the business must hold a valid tax invoice, have received the goods or services, the supplier must have reported the invoice (so it appears in GSTR-2B) and paid the tax, and the business must file its own return. Suppliers must also be paid within 180 days of the invoice.',
      'Section 17(5) blocks credit on some items, including works contract services and goods or services used to construct immovable property on the business’s own account (other than plant and machinery). Residential real-estate projects paying GST at the concessional 1% or 5% rates cannot claim ITC. Check eligibility with your CA.',
    ],
    inArcPem:
      'ARC PEM computes GST on every bill and keeps the purchase register that ITC claims are based on; and matches it against GSTR-2B.',
    related: ['gst-purchase-register', 'gstr-2b'],
    faqs: [
      { q: 'Can builders claim input tax credit on construction materials?', a: 'It depends. Credit on goods and services used to construct immovable property on the builder’s own account is blocked under Section 17(5), and residential projects under the concessional 1% / 5% rates cannot claim ITC. Contractors supplying works contracts to clients generally can. Confirm your case with a CA.' },
    ],
  },
  {
    slug: 'concrete-mix-ratio',
    term: 'Concrete Mix Ratio (M10, M15, M20, M25)',
    question: 'What is the concrete mix ratio for M20, M15 and M10?',
    definition:
      'A concrete mix ratio gives the proportions of cement, sand and coarse aggregate in a concrete grade. In nominal mixes, M20 is 1 : 1.5 : 3, M15 is 1 : 2 : 4 and M10 is 1 : 3 : 6 by volume.',
    details: [
      '“M” stands for mix, and the number is the characteristic compressive strength in N/mm² after 28 days of curing — M20 concrete should reach 20 N/mm².',
      'IS 456:2000 allows nominal mixes only up to M20. M25 and stronger grades should be design mixes, proportioned by testing the actual materials as described in IS 10262 (M25 is often quoted as 1 : 1 : 2 for rough estimates).',
      'The dry volume of materials is about 1.54 times the finished wet volume, which is why calculators multiply the volume by roughly 1.54 before splitting it by the ratio.',
    ],
    example:
      '1 m³ of M20: dry volume ≈ 1.54 m³; cement = 1.54 × 1 ÷ 5.5 ≈ 0.28 m³ ≈ 403 kg ≈ 8 bags of 50 kg.',
    inArcPem:
      'Work out quantities with the free concrete calculator, then record cement, sand and aggregate purchases as vendor bills against the project in ARC PEM.',
    tool: 'concrete-calculator',
    related: ['bar-bending-schedule', 'bill-of-quantities'],
    faqs: [
      { q: 'How many cement bags are needed for 1 cubic metre of M20 concrete?', a: 'About 8 bags of 50 kg for a nominal 1 : 1.5 : 3 mix, using a dry-volume factor of 1.54 and cement density of 1,440 kg/m³.' },
      { q: 'What does M20 mean in concrete?', a: 'M20 is a concrete grade whose characteristic compressive strength after 28 days is 20 N/mm². The M stands for mix.' },
    ],
  },
]

export const glossaryTerm = (slug: string) => GLOSSARY.find((t) => t.slug === slug)

/** Alphabetical, for the index page and llms-full.txt. */
export const GLOSSARY_SORTED = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term))
