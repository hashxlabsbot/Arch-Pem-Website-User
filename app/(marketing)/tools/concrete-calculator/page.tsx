import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import ConcreteCalculator from '@/components/tools/ConcreteCalculator'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'

const TITLE = 'Concrete Calculator — Cement, Sand & Aggregate (M10–M25)'
const DESCRIPTION =
  'Calculate cement bags, sand, aggregate and water for slabs, beams, columns and footings. M10, M15, M20 and M25 mix ratios, feet or metre inputs, instant results. Free, no sign-up.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/concrete-calculator' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/tools/concrete-calculator' },
  twitter: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

const FAQS = [
  {
    q: 'How many cement bags are needed for 1 m³ of M20 concrete?',
    a: 'About 8 bags. For M20 (1 : 1.5 : 3), dry volume = 1 × 1.54 = 1.54 m³; the cement share is 1.54 ÷ 5.5 = 0.28 m³, and 0.28 ÷ 0.0347 m³ per bag ≈ 8 bags (roughly 400 kg of cement).',
  },
  {
    q: 'Why is wet volume multiplied by 1.54?',
    a: 'Cement, sand and aggregate contain air voids when measured loose. When mixed with water and compacted, the same materials occupy about 35% less space — so you must batch roughly 1.54× the finished (wet) concrete volume in dry materials.',
  },
  {
    q: 'Which concrete grade should I use for a house slab?',
    a: 'M20 is the minimum grade for reinforced concrete work as per IS 456, and it is the standard choice for residential slabs, beams and columns. M25 is common for footings and for buildings of G+2 and above, or wherever the structural engineer specifies it.',
  },
  {
    q: 'How much cement, sand and aggregate for a 100 sq ft slab?',
    a: 'A 100 sq ft slab at 5 inch thickness is about 1.18 m³ of wet concrete. In M20 that needs roughly 9.5 bags of cement, 17.5 cft of sand and 35 cft of aggregate — you can verify these exact numbers in the calculator above.',
  },
  {
    q: 'How much water does the mix need?',
    a: 'Site practice uses a water–cement ratio of 0.45–0.5, i.e. 22.5–25 litres per 50 kg bag. More water makes concrete easier to pour but permanently weaker — keep the ratio tight and compact well.',
  },
  {
    q: 'Does this work for RCC (reinforced) elements?',
    a: 'Yes — the concrete volume is the same; reinforcement displaces a negligible volume for estimation purposes. Steel quantity is calculated separately, typically 80–120 kg per m³ of concrete for residential RCC members.',
  },
]

export default function ConcreteCalculatorPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Concrete Calculator',
          url: `${base}/tools/concrete-calculator`,
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
            { '@type': 'ListItem', position: 2, name: 'Concrete Calculator', item: `${base}/tools/concrete-calculator` },
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
              <Link href="/tools">Free Tools</Link> / Concrete Calculator
            </div>
            <span className="badge badge-indigo">100% Free · No Sign-up</span>
            <h1>Concrete Calculator — Cement, Sand &amp; Aggregate</h1>
            <p>
              Enter your slab, beam, column or footing size and get the exact cement bags, sand,
              aggregate and water needed — for M10, M15, M20 and M25 nominal mixes, in feet or metres.
            </p>
          </div>

          <div className="tool-wrap">
            <ConcreteCalculator />
          </div>

          <div className="tool-prose">
            <h2>Concrete mix ratios at a glance</h2>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr>
                    <th>Grade</th>
                    <th>Mix (C : S : A)</th>
                    <th className="num">Strength (28-day)</th>
                    <th>Typical Use</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>M10</td><td>1 : 3 : 6</td><td className="num">10 N/mm²</td><td>Levelling course below footings, non-structural beds</td></tr>
                  <tr><td>M15</td><td>1 : 2 : 4</td><td className="num">15 N/mm²</td><td>PCC, flooring base, pathways</td></tr>
                  <tr><td>M20</td><td>1 : 1.5 : 3</td><td className="num">20 N/mm²</td><td>Residential RCC — slabs, beams, columns</td></tr>
                  <tr><td>M25</td><td>1 : 1 : 2</td><td className="num">25 N/mm²</td><td>Footings, structural members, G+2 and above</td></tr>
                </tbody>
              </table>
            </div>

            <h2>How the calculation works</h2>
            <p>
              The calculator uses the standard nominal-mix method taught to every site engineer:
            </p>
            <ol>
              <li><strong>Wet volume</strong> — length × breadth × depth (circular columns: π/4 × dia² × height), times the number of elements.</li>
              <li><strong>Dry volume</strong> — wet volume × 1.54, because loose materials compact when mixed.</li>
              <li><strong>Split by mix ratio</strong> — for M20 (1 : 1.5 : 3) the parts total 5.5, so cement gets 1/5.5 of the dry volume, sand 1.5/5.5, aggregate 3/5.5.</li>
              <li><strong>Convert to site units</strong> — cement at 0.0347 m³ per 50 kg bag; sand and aggregate in cft (1 m³ = 35.31 cft) since that&apos;s how suppliers deliver.</li>
            </ol>
            <p>
              <strong>Worked example:</strong> a 10 ft × 10 ft slab, 6 inches thick, in M20 — wet volume
              = 50 cft = 1.42 m³, dry volume = 2.18 m³. Cement: 2.18 ÷ 5.5 = 0.40 m³ ≈ 11.4 bags. Sand:
              0.59 m³ ≈ 21 cft. Aggregate: 1.19 m³ ≈ 42 cft. Water: about 285 litres.
            </p>

            <h2>Site tips that save real money</h2>
            <ul>
              <li>Order <strong>2–5% extra</strong> for spillage and uneven shuttering — running short mid-pour costs far more than the buffer.</li>
              <li>Never add water beyond the w/c ratio to “make pouring easier” — every extra litre permanently weakens the slab.</li>
              <li>For pours above ~5 m³, compare the cost of <strong>ready-mix concrete (RMC)</strong> — site-mixed batches often lose consistency at that scale.</li>
              <li>Log every cement bag and sand trip against the estimate — the gap between calculated and delivered quantity is where site leakage hides.</li>
            </ul>

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
              Also try the free{' '}
              <Link href="/tools/construction-cost-calculator">construction cost calculator</Link> for
              your full project budget, and the{' '}
              <Link href="/tools/contractor-bill-generator">GST contractor bill generator</Link> for
              billing the work.
            </p>
          </div>
        </div>
      </section>

      <ToolCta
        heading="You calculated 11 bags. Did the site actually consume 11?"
        sub="ARC PEM tracks material purchases and vendor bills against your BOQ, project by project — so estimated vs actual is always one report away. Fully offline, built for Indian construction firms."
      />
    </>
  )
}
