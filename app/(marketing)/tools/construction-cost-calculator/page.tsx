import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import CostCalculator from '@/components/tools/CostCalculator'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'

const TITLE = 'Construction Cost Calculator India (2026) — Cost Per Sq Ft'
const DESCRIPTION =
  'Estimate house construction cost in India: per sq ft rates for basic, standard, premium and luxury quality, city-wise adjustment, full cost breakdown, and cement, steel, sand & brick quantities. Free, no sign-up.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/construction-cost-calculator' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/tools/construction-cost-calculator' },
  twitter: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

const FAQS = [
  {
    q: 'What is the construction cost per sq ft in India in 2026?',
    a: 'For a self-built RCC framed house, budget roughly ₹1,700–1,900 per sq ft for basic quality, ₹2,000–2,400 for standard, ₹2,500–3,000 for premium, and ₹3,000+ for luxury finishes. Metro cities run 10–20% higher and smaller towns 10–15% lower, driven mostly by labour rates.',
  },
  {
    q: 'What does the per sq ft rate include?',
    a: 'The full civil structure (footing, RCC frame, masonry, plaster), finishing (flooring, tiles, paint, basic kitchen and bathrooms), and standard electrical and plumbing. It excludes land, government approvals, architect fees, interiors/furniture, compound walls and landscaping.',
  },
  {
    q: 'How many cement bags are needed per square foot?',
    a: 'The widely used thumb rule is about 0.4 bags (20 kg) of cement per sq ft of built-up area for an RCC framed house — so a 1,000 sq ft house needs roughly 400 bags, consumed across footing, frame, masonry and plaster.',
  },
  {
    q: 'How much steel is required per sq ft of construction?',
    a: 'Residential RCC construction typically consumes 3.5–4.5 kg of TMT steel per sq ft of built-up area. A 1,000 sq ft house therefore needs about 4 tonnes of steel, varying with the structural design and number of floors.',
  },
  {
    q: 'How accurate is this estimate?',
    a: 'Treat it as a planning-stage estimate with a ±8–15% band. The only way to fix the real number is a detailed BOQ (bill of quantities) with measured items and current local rates — which is exactly what builders prepare before signing a contract.',
  },
  {
    q: 'Does building multiple floors reduce the cost per sq ft?',
    a: 'Slightly, yes. The foundation and roof are shared across floors, so a G+1 house usually costs a few percent less per sq ft than two single-storey houses of the same total area. Beyond G+2, structural requirements start pushing the rate back up.',
  },
]

export default function CostCalculatorPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Construction Cost Calculator (India)',
          url: `${base}/tools/construction-cost-calculator`,
          description: DESCRIPTION,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          provider: { '@type': 'Organization', name: company.legalName, url: base },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Free Tools', item: `${base}/tools` },
            { '@type': 'ListItem', position: 2, name: 'Construction Cost Calculator', item: `${base}/tools/construction-cost-calculator` },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tool-hero">
            <div className="tool-crumb">
              <Link href="/tools">Free Tools</Link> / Construction Cost Calculator
            </div>
            <span className="badge badge-indigo">100% Free · No Sign-up</span>
            <h1>Construction Cost Calculator — India</h1>
            <p>
              Estimate what it costs to build a house in India in 2026. Pick your area, quality level
              and city type to get a realistic cost range, a head-wise breakdown, and the cement,
              steel, sand and brick quantities you&apos;ll need.
            </p>
          </div>

          <div className="tool-wrap">
            <CostCalculator />
          </div>

          <div className="tool-prose">
            <h2>How house construction cost is estimated</h2>
            <p>
              Builders quote residential construction as a <strong>rate per square foot of built-up
              area</strong>. That single number bundles the civil structure (footing, RCC frame,
              brickwork, plaster), finishing (flooring, tiles, paint, kitchen and bathroom fittings)
              and basic electrical &amp; plumbing. This calculator multiplies your built-up area by a
              quality-based rate, adjusts it for your city tier, and shows the result as a range —
              because at the planning stage, a range is honest and a single number is not.
            </p>

            <h2>What drives the rate up or down</h2>
            <ul>
              <li><strong>Finishing quality</strong> — the single biggest factor. Vitrified tile vs Italian marble can swing the total by 30% on its own.</li>
              <li><strong>Labour rates in your city</strong> — metro labour costs 15–25% more than small-town labour for identical work.</li>
              <li><strong>Structural design</strong> — soil condition, number of floors, cantilevers and large spans add steel and concrete.</li>
              <li><strong>Material price cycles</strong> — cement and steel prices move quarter to quarter; GST on cement dropped to 18% in the 2025 reforms, easing costs slightly.</li>
              <li><strong>Wastage and rework</strong> — poorly supervised sites routinely lose 5–10% of material cost to wastage, theft and rework.</li>
            </ul>

            <h2>What this estimate excludes</h2>
            <p>
              Land cost, stamp duty and approvals, architect/structural fees, interiors and loose
              furniture, compound wall, borewell, solar, and landscaping. Owners commonly budget an
              additional 15–25% of the construction cost for these, depending on how far they take the
              interiors.
            </p>

            <h2>Frequently asked questions</h2>
            <div className="tool-faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>

            <p style={{ marginTop: 24 }}>
              Planning the concrete work? Use the free{' '}
              <Link href="/tools/concrete-calculator">concrete calculator</Link> for exact cement, sand
              and aggregate quantities, and the{' '}
              <Link href="/tools/contractor-bill-generator">GST contractor bill generator</Link> when
              it&apos;s time to bill.
            </p>
          </div>
        </div>
      </section>

      <ToolCta
        heading="Estimating is step one. Staying on budget is the real game."
        sub="ARC PEM tracks your BOQ against actual vendor bills, labour and contractor payments as the build progresses — so overruns show up in weeks, not at the end. Fully offline desktop software."
      />
    </>
  )
}
