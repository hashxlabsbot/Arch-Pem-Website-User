/**
 * Registry of the free tools published under /tools.
 * Shared by the tools index page, the sitemap, and the marketing nav/footer
 * so a new tool only has to be declared once.
 */
export type ToolDef = {
  slug: string
  name: string
  short: string
  live: boolean
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'contractor-bill-generator',
    name: 'GST Contractor Bill Generator',
    short:
      'Create a GST-compliant contractor bill or tax invoice in your browser and print it as a PDF — free, no sign-up.',
    live: true,
  },
  {
    slug: 'construction-cost-calculator',
    name: 'Construction Cost Calculator',
    short:
      'Estimate the cost of building a house in India — per sq ft rates by quality and city, with a full cost breakdown and material quantities.',
    live: true,
  },
  {
    slug: 'concrete-calculator',
    name: 'Concrete Calculator',
    short:
      'Cement bags, sand, aggregate and water needed for any slab, beam, column or footing — M10 to M25 grades.',
    live: true,
  },
  {
    slug: 'bar-bending-schedule-calculator',
    name: 'Bar Bending Schedule (BBS) Calculator',
    short:
      'Cutting lengths, bar counts and steel weight for beams, columns, slabs and footings — a complete bar bending schedule in seconds.',
    live: true,
  },
  {
    slug: 'brick-calculator',
    name: 'Brick Calculator',
    short: 'Bricks, cement and sand required for any wall size and thickness.',
    live: false,
  },
  {
    slug: 'steel-weight-calculator',
    name: 'TMT Steel Weight Calculator',
    short: 'Weight of TMT bars by diameter, length and count — with a full weight chart.',
    live: false,
  },
  {
    slug: 'area-converter',
    name: 'Land Area Converter',
    short: 'Convert sq ft, sq m, guntha, bigha, brass, cent and other Indian land units.',
    live: false,
  },
]

export const LIVE_TOOLS = TOOLS.filter((t) => t.live)
