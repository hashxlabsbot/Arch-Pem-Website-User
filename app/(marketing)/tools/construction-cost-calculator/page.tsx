import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import CostCalculator from '@/components/tools/CostCalculator'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { pageMetadata } from '@/lib/seo'

const TITLE = 'Construction Cost Calculator — Cost Per Sq Ft'
const DESCRIPTION =
  'Estimate house construction cost in India: per sq ft rates by quality and city, full cost breakdown, and material quantities. Free, no sign-up.'

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/tools/construction-cost-calculator',
})

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
  {
    q: 'What is the construction cost per sq ft in Mumbai, Delhi NCR or Bengaluru?',
    a: 'Metro cities typically run ₹2,000–2,150/sq ft for basic quality, ₹2,450–2,600 for standard, and ₹3,000–3,200+ for premium finishes — about 15% above the national average, driven mainly by higher skilled-labour rates and site logistics.',
  },
  {
    q: 'Is construction cheaper in smaller cities and towns than in metros?',
    a: 'Yes, typically 10–15% cheaper. Tier-2 cities like Pune, Hyderabad and Ahmedabad sit close to the national average, while smaller towns and rural sites run 10–15% below it — almost entirely because of lower local labour rates rather than cheaper materials, since cement and steel are priced nationally.',
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
            <Suspense fallback={null}>
              <CostCalculator />
            </Suspense>
          </div>

          <div className="tool-prose">
            <h2>What is the average house construction cost per square foot in India (2026)?</h2>
            <p>
              Rates vary mainly with local labour costs, so the same quality of construction costs
              noticeably more in a metro than in a smaller town. The bands below use the same
              quality-tier base rates and city multiplier as the calculator above — plug in your city
              type there to reproduce these numbers exactly for your own area:
            </p>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr>
                    <th>City / Region</th>
                    <th className="num">Basic</th>
                    <th className="num">Standard</th>
                    <th className="num">Premium</th>
                    <th className="num">Luxury</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Mumbai, Delhi NCR, Bengaluru (metro)</td><td className="num">₹2,000–2,150</td><td className="num">₹2,450–2,600</td><td className="num">₹3,000–3,200</td><td className="num">₹3,700+</td></tr>
                  <tr><td>Pune, Hyderabad, Chennai, Kolkata, Ahmedabad</td><td className="num">₹1,750–1,900</td><td className="num">₹2,150–2,300</td><td className="num">₹2,650–2,800</td><td className="num">₹3,250+</td></tr>
                  <tr><td>Jaipur, Lucknow, Indore, Nagpur, Coimbatore</td><td className="num">₹1,650–1,800</td><td className="num">₹2,050–2,200</td><td className="num">₹2,500–2,650</td><td className="num">₹3,050+</td></tr>
                  <tr><td>Smaller towns &amp; rural India</td><td className="num">₹1,550–1,700</td><td className="num">₹1,900–2,050</td><td className="num">₹2,350–2,500</td><td className="num">₹2,850+</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              All figures are ₹ per sq ft of built-up area, for 2026. They move with cement and steel
              price cycles and local labour markets, so treat them as a planning-stage reference — get
              2–3 local contractor quotes before finalising a budget.
            </p>

            <h2>How much cement and steel does a house need per square foot?</h2>
            <p>
              Two thumb rules cover most of the material budget for an RCC framed house:{' '}
              <strong>≈0.4 bags (20 kg) of cement</strong> and <strong>≈3.5–4.5 kg of TMT steel</strong>{' '}
              per sq ft of built-up area — so a 1,000 sq ft house needs roughly 400 bags of cement and
              about 4 tonnes of steel, spread across the footing, RCC frame, brickwork and plaster. The
              exact figure moves with the structural design: a G+2 building needs proportionally more
              steel per sq ft than a single-storey house because upper floors add load the columns and
              footings must carry, while a simple rectangular footprint uses less than one with many
              cantilevers or large spans. Use the calculator above to get quantities scaled to your own
              area and floor count, and the free{' '}
              <Link href="/tools/concrete-calculator">concrete calculator</Link> to size individual
              slabs, beams and columns precisely once your structural drawing is ready.
            </p>

            <h2>How house construction cost is estimated</h2>
            <p>
              Builders quote residential construction as a <strong>rate per square foot of built-up
              area</strong>. That single number bundles the civil structure (footing, RCC frame,
              brickwork, plaster), finishing (flooring, tiles, paint, kitchen and bathroom fittings)
              and basic electrical &amp; plumbing. This calculator multiplies your built-up area by a
              quality-based rate, adjusts it for your city tier, and shows the result as a range —
              because at the planning stage, a range is honest and a single number is not. Built-up area
              (not carpet area) is what construction rates are quoted against, since it includes wall
              thickness and the structure the contractor actually builds — carpet area, by contrast,
              is only the usable floor space inside the walls and typically runs 15–20% less than
              built-up area.
            </p>

            <h2>What drives the rate up or down</h2>
            <ul>
              <li><strong>Finishing quality</strong> — the single biggest factor. Vitrified tile vs Italian marble can swing the total by 30% on its own.</li>
              <li><strong>Labour rates in your city</strong> — metro labour costs 15–25% more than small-town labour for identical work, and this alone explains most of the city-to-city gap in the table above.</li>
              <li><strong>Structural design</strong> — soil condition, number of floors, cantilevers and large spans add steel and concrete; a soil test (soil investigation report) before design avoids expensive foundation surprises later.</li>
              <li><strong>Material price cycles</strong> — cement and steel prices move quarter to quarter; GST on cement dropped to 18% in the 2025 reforms, easing costs slightly.</li>
              <li><strong>Wastage and rework</strong> — poorly supervised sites routinely lose 5–10% of material cost to wastage, theft and rework — the gap a detailed BOQ and site-level expense tracking are built to close.</li>
            </ul>

            <h2>What this estimate excludes</h2>
            <p>
              This calculator prices the <strong>civil construction contract</strong> — structure,
              finishing and basic MEP. It does not include:
            </p>
            <ul>
              <li><strong>Land cost, stamp duty and registration</strong> — often the single largest line item, and entirely site-dependent.</li>
              <li><strong>Government approvals and sanction fees</strong> — building plan approval, NOCs, and development charges vary by municipality.</li>
              <li><strong>Architect and structural engineer fees</strong> — typically 3–8% of the construction cost for full design and site supervision.</li>
              <li><strong>Interiors and loose furniture</strong> — modular kitchens, wardrobes, false ceilings and furnishing can equal 20–40% of the civil cost on their own.</li>
              <li><strong>Compound wall, borewell, solar and landscaping</strong> — usually budgeted separately once the main structure is finalised.</li>
            </ul>
            <p>
              Owners commonly budget an additional <strong>15–25%</strong> over the civil construction
              cost to cover these, depending on how far they take the interiors and site development.
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
