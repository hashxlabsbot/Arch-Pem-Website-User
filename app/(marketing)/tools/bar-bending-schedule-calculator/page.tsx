import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import BBSCalculator from '@/components/tools/BBSCalculator'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'

const TITLE = 'Bar Bending Schedule (BBS) Calculator'
const DESCRIPTION =
  'Generate a bar bending schedule for beams, columns, slabs and footings, plus a diameter-wise steel order sheet. Free and instant.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/bar-bending-schedule-calculator' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/tools/bar-bending-schedule-calculator' },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

const FAQS = [
  {
    q: 'How is stirrup cutting length calculated?',
    a: 'Cutting length = 2 × (a + b) + 2 × (9 × dia) − 3 × (2 × dia), which simplifies to 2×(a+b) + 12×dia. Here a and b are the clear internal dimensions of the stirrup — member width/depth minus twice the clear cover — the "2×9d" is the allowance for two 135° hooks, and the "3×2d" deducts the three effective 90° corner bends in a closed rectangular link. This is the standard SP-34:1987 convention.',
  },
  {
    q: 'What development length or lap length should I use?',
    a: 'Development and lap length depend on the concrete grade, steel grade and bar diameter (IS 456 Table 26 / bond stress) — a structural design decision, not a geometry one. This calculator exposes it as an editable "× dia" factor (50d by default, a common site rule of thumb) so you can enter the exact value from your structural drawing instead of it being guessed for you.',
  },
  {
    q: 'Does this replace a structural engineer’s bar bending schedule?',
    a: 'No. It converts reinforcement details you already have — spans, cross-sections, bar diameters, spacing — into cutting lengths, bar counts and weight, exactly like a site engineer would tabulate by hand. It doesn’t design the reinforcement itself (bar sizes, spacing or development length are structural decisions), so always cross-check against the approved structural drawing before ordering steel.',
  },
  {
    q: 'Why isn’t development length auto-calculated from the concrete and steel grade?',
    a: 'Because that number varies with bond stress, which depends on the concrete grade, steel grade, bar type and exposure condition — getting it wrong could mean under-ordering steel or an unsafe splice. Rather than silently assume a grade combination, the calculator lets you enter the multiplier your structural drawing specifies.',
  },
  {
    q: 'What is the formula for the unit weight of a TMT bar?',
    a: 'Unit weight (kg/m) = dia² ÷ 162, where dia is the bar diameter in millimetres. For example, a 16 mm bar weighs 16² ÷ 162 ≈ 1.58 kg per running metre. This is the standard IS 1786 approximation.',
  },
  {
    q: 'Can I calculate a bar bending schedule for a slab in both directions?',
    a: 'This calculator covers one-way slab behaviour (main steel one way, distribution/temperature steel the other) in v1. True two-way slabs — with independently designed main steel in both directions — aren’t modelled yet; treat the "two-way" option as a label for now and verify both-direction steel against your structural drawing.',
  },
  {
    q: 'Can I enter dimensions in feet and inches, the way the drawing states them?',
    a: 'Yes — switch the unit toggle to feet-inches and type what the drawing says: 15\'-4½" for a span, 9 for a 9" width, 4 for @4" c/c spacing. Half and quarter inches, decimal feet (3.5\'), plain inches (42") and the 9\'\'x15" style all parse. Bar diameters and clear cover stay in millimetres in both modes, exactly as Indian structural drawings state them. Every length field shows the converted value underneath, which is the quickest way to catch a slip like a 9" section typed as 9 mm.',
  },
  {
    q: 'Why does a single stirrup spacing under-count the steel?',
    a: 'Because real beams are not stirruped at one spacing. A typical drawing calls up @4" c/c over about 3\' at each end (where shear is highest) and @6" c/c through the middle. On a 4,686 mm span that works out to 37 stirrups, against 31 if you assume @6" throughout — roughly 16% of the stirrup steel missing. Enter each tightened run as a zone and the schedule counts every interval, sharing the bar where two zones meet rather than double-counting it.',
  },
  {
    q: 'Can I enter a bar group that mixes diameters, like 2-20Ø + 1-16Ø?',
    a: 'Yes — add a row per diameter. Each becomes its own line in the schedule, which is how a real bar bending schedule tabulates it, and development length is added per diameter rather than once for the whole group. This matters: forcing that example into a single diameter is out by +15% (all 20Ø) or −31% (all 16Ø).',
  },
  {
    q: 'Can I build a schedule for a whole floor or building, not just one member?',
    a: 'Yes — after calculating any beam, column, slab or footing, click "Add to Project" to save it into a running project list, then keep switching tabs and adding more members. The tool shows a grand total, a diameter-wise steel summary (exactly how many kg of 8mm, 10mm, 12mm… to order) and lets you edit or remove any member. Your project is saved in your browser (localStorage) so it survives a reload — export it as CSV or PDF any time as a backup.',
  },
  {
    q: 'How much extra steel should I order for wastage?',
    a: 'Site practice typically adds 2–5% over the theoretical calculated weight to cover cutting waste, bending losses and site handling — the same range used elsewhere on this site for concrete and material ordering. The project schedule defaults to 3% and is fully editable, so you can match your own site’s typical wastage.',
  },
]

export default function BBSCalculatorPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Bar Bending Schedule (BBS) Calculator',
          url: `${base}/tools/bar-bending-schedule-calculator`,
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
            { '@type': 'ListItem', position: 2, name: 'Bar Bending Schedule Calculator', item: `${base}/tools/bar-bending-schedule-calculator` },
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
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to prepare a bar bending schedule for a beam, column, slab or footing',
          description: 'Step-by-step method to find bar cutting length, count and steel weight from a member’s dimensions and reinforcement details.',
          step: [
            { '@type': 'HowToStep', position: 1, name: 'Find the clear span/height and cover', text: 'Take the clear span (beam/slab), clear height (column) or plan size (footing), and the clear cover to reinforcement, from the structural drawing.' },
            { '@type': 'HowToStep', position: 2, name: 'Add development/lap length where bars anchor or splice', text: 'Where a straight bar terminates into a support or laps into the next lift, add the development/lap length specified on the drawing — commonly 40–50× the bar diameter.' },
            { '@type': 'HowToStep', position: 3, name: 'Compute stirrup/tie cutting length', text: 'For a closed rectangular link: 2×(a+b) + 12×dia, where a and b are the member width/depth minus twice the clear cover — this bakes in the 135° hook allowance and 90° bend deductions.' },
            { '@type': 'HowToStep', position: 4, name: 'Convert to weight', text: 'Multiply total bar length by the standard unit weight, dia² ÷ 162 kg/m, to get the steel weight for each bar mark, then sum for the total.' },
            { '@type': 'HowToStep', position: 5, name: 'Aggregate across members for ordering', text: 'Add every member — beams, columns, slabs, footings — to the project list; the diameter-wise summary then shows exactly how many kg of each bar size to order, wastage allowance included.' },
          ],
        }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tool-hero">
            <div className="tool-crumb">
              <Link href="/tools">Free Tools</Link> / Bar Bending Schedule Calculator
            </div>
            <span className="badge badge-indigo">100% Free · No Sign-up</span>
            <h1>Bar Bending Schedule (BBS) Calculator</h1>
            <p>
              Enter a beam, column, slab or footing&apos;s size and reinforcement details and get a
              complete bar-mark schedule — cutting length, bar count and steel weight — ready to hand
              to a bar-bender or export as a PDF. Add every member to a running project list and get
              one diameter-wise order sheet (8/10/12/16/20 mm…) with a wastage allowance built in — the
              page a real BBS ends with.
            </p>
          </div>

          <div className="tool-wrap">
            <Suspense fallback={null}>
              <BBSCalculator />
            </Suspense>
          </div>

          <div className="tool-prose">
            <h2>Standard bend deductions and hook allowance (SP-34)</h2>
            <p>
              A bar&apos;s cutting length is never the same as the straight-line distance it covers —
              bending it changes how much steel is consumed. <strong>SP-34:1987</strong> (Handbook on
              Concrete Reinforcement and Detailing) gives the standard deductions and allowances this
              calculator uses:
            </p>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr>
                    <th scope="col">Bend / Hook</th>
                    <th scope="col" className="num">Adjustment</th>
                    <th scope="col">Applies to</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>45° bend</td><td className="num">− 1 × dia</td><td>Cranked/bent-up bars (not modelled in v1)</td></tr>
                  <tr><td>90° corner bend</td><td className="num">− 2 × dia</td><td>Closed stirrups and ties</td></tr>
                  <tr><td>135° hook</td><td className="num">+ 9 × dia</td><td>Stirrup and tie hook ends</td></tr>
                  <tr><td>Unit weight</td><td className="num">dia² ÷ 162 kg/m</td><td>Every bar, all diameters</td></tr>
                </tbody>
              </table>
            </div>

            <h2>The four core formulas</h2>
            <ol>
              <li><strong>Straight main bar (anchored):</strong> cutting length = clear span + 2 × (development length factor × dia), when the bar terminates into a support.</li>
              <li><strong>Stirrup / tie:</strong> cutting length = 2 × (a + b) + 12 × dia, where a, b = member width/depth minus 2 × clear cover.</li>
              <li><strong>Bar count from spacing:</strong> count = ⌊span ÷ spacing⌋ + 1, applied across the dimension perpendicular to the bar&apos;s run.</li>
              <li><strong>Steel weight:</strong> total weight (kg) = total length (m) × (dia² ÷ 162).</li>
            </ol>

            <h2>Worked example — a typical residential beam</h2>
            <p>
              A 4000 mm clear-span beam, 230 × 450 mm, 25 mm cover, with 4–16 mm bottom bars, 2–12 mm
              top bars and 8 mm stirrups at 150 mm c/c, both main bar groups anchored with a 50d
              development length:
            </p>
            <ul>
              <li>Bottom bars: 4000 + 2×50×16 = 5600 mm × 4 nos = 22.4 m × 1.580 kg/m ≈ <strong>35.4 kg</strong></li>
              <li>Top bars: 4000 + 2×50×12 = 5200 mm × 2 nos = 10.4 m × 0.889 kg/m ≈ <strong>9.2 kg</strong></li>
              <li>Stirrups: a = 180, b = 400 → 2×(580) + 12×8 = 1256 mm; count = ⌊4000÷150⌋+1 = 27 → 33.9 m × 0.395 kg/m ≈ <strong>13.4 kg</strong></li>
              <li><strong>Total ≈ 58.0 kg</strong> of steel for this one beam — enter the same numbers into the calculator above to verify.</li>
            </ul>

            <h2>How stirrup zones are counted</h2>
            <p>
              Every beam on a real drawing tightens its stirrups near the supports, where shear is
              greatest, and opens out through the middle. The schedule has to follow that, and the
              counting rule is specific:
            </p>
            <ul>
              <li>Each zone contributes its <strong>intervals</strong> — ⌊zone length ÷ spacing⌋ — not its bar count.</li>
              <li>One closing bar is added for the span as a whole.</li>
              <li>Two adjacent zones therefore <strong>share</strong> the stirrup that sits on their boundary, because only one bar gets tied there.</li>
            </ul>
            <p>
              Worked through on a 4,686 mm (15&#39;-4½&quot;) span with 8&#8960; stirrups @4&quot; c/c over
              3&#39; at each end and @6&quot; c/c in the middle: 9 intervals at each end, 18 across the
              2,857 mm middle, plus one closing bar — <strong>37 stirrups</strong>. Assuming a single
              @6&quot; spacing gives 31, which is about 16% light. Zones apply symmetrically at both
              ends; if the lengths you enter don&apos;t fit the span, the tool blocks saving rather than
              quietly rescaling a dimension you took off a drawing.
            </p>

            <h2>What this tool doesn&apos;t do</h2>
            <p>
              This is a quantity/geometry calculator, not a structural design tool. It won&apos;t derive
              development or lap length from your concrete and steel grade (that&apos;s IS 456 Table 26,
              a structural decision) — instead you enter the multiplier your drawing specifies. It also
              does model mixed-diameter bar groups, variable stirrup zones, extra top bars curtailed
              over supports, side face bars, per-level column lifts, inner/cross ties and slab top
              steel — but only from the length or size the drawing states, never derived from a moment
              envelope. It doesn&apos;t model cranked/bent-up beam bars, multi-span continuous beams,
              or independently designed two-way slab steel.
              For anything beyond a straightforward single member, always verify against your structural
              engineer&apos;s BBS before ordering steel.
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
              Also try the free{' '}
              <Link href="/tools/concrete-calculator">concrete calculator</Link> for the cement, sand
              and aggregate this member needs, and the{' '}
              <Link href="/tools/construction-cost-calculator">construction cost calculator</Link> for
              your full project budget.
            </p>
          </div>
        </div>
      </section>

      <ToolCta
        heading="You calculated 58 kg of steel. Did the site order exactly that?"
        sub="ARC PEM tracks BOQ, vendor bills and material purchases against your estimate, project by project — so estimated vs actual is always one report away. Live for the whole firm, built for Indian construction firms."
      />
    </>
  )
}
