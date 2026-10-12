import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { entity, ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import { LIVE_TOOLS } from '@/lib/tools'
import '../../tools/tools.css'

const PATH = '/guides/best-construction-software-india'
const UPDATED = '2026-10-12'
const UPDATED_LABEL = 'October 2026'

const TITLE = 'Best Construction Management Software in India (2026 Guide)'
const DESCRIPTION =
  'How to choose construction project and expense management software in India — GST, Tally, BOQ, labour and offline needs compared across ARC PEM, cloud suites, accounting software and Excel.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: 'article', title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: PATH, images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION, images: ['/og-image.jpg'] },
}

// Comparison cells describe each category's typical shape, not every vendor
// in it — keep competitor claims to what their own pricing/marketing states.
const COMPARE: { row: string; arc: string; cloud: string; acct: string; excel: string }[] = [
  {
    row: 'Main job',
    arc: 'Project costs: BOQ & budget, vendor bills, labour wages, contractor bills, site expenses, GST',
    cloud: 'Company-wide field & office collaboration — drawings, RFIs, schedules, documents',
    acct: 'Company books, GST returns, inventory; project costing as an add-on workflow',
    excel: 'Whatever you build yourself',
  },
  {
    row: 'Where it runs',
    arc: 'Windows desktop, fully offline; optional sharing on your office network',
    cloud: 'Cloud — needs a reliable internet connection',
    acct: 'Installed or hosted, depending on the product',
    excel: 'Desktop or cloud',
  },
  {
    row: 'Indian GST & Tally',
    arc: 'GST purchase register built in; one-click Tally ERP / TallyPrime CSV export',
    cloud: 'Varies by vendor and region — confirm before buying',
    acct: 'Native GST; is the system of record your CA uses',
    excel: 'Manual formulas and re-entry into Tally',
  },
  {
    row: 'Labour & muster',
    arc: 'Daily headcount and wages; imports PDF manpower reports',
    cloud: 'Usually via timesheet or field modules',
    acct: 'Payroll-style, not site muster rolls',
    excel: 'Manual sheets per site',
  },
  {
    row: 'Pricing model',
    arc: 'Annual licence per machine (Solo 1, Studio 3, Enterprise 10)',
    cloud: 'Quote-based; e.g. Procore prices on annual construction volume',
    acct: 'Licence or subscription',
    excel: 'Already owned',
  },
  {
    row: 'Best for',
    arc: 'Indian architects, contractors and builders running several projects at once',
    cloud: 'Large general contractors and EPC firms with big site teams',
    acct: 'Bookkeeping and statutory filing',
    excel: 'One or two small projects',
  },
]

const QUICK_PICKS: [string, string][] = [
  ['Track BOQ, vendor bills, labour, contractor bills and GST per project, then hand clean data to your CA', 'ARC PEM'],
  ['Coordinate hundreds of site users, drawings, RFIs and submittals in the cloud', 'Cloud construction suites such as Procore'],
  ['Critical-path scheduling for large infrastructure programmes', 'Dedicated scheduling tools such as Oracle Primavera P6'],
  ['File GST returns and keep statutory books', 'Accounting software such as TallyPrime — ARC PEM exports to it'],
]

const FAQS = [
  {
    q: 'What is the best construction management software in India?',
    a: `It depends on the job you need done. For Indian architecture firms, contractors and builders who need project-wise BOQ, vendor bills, labour wages, contractor bills and GST in one place — with Tally export and no dependence on internet — ARC PEM is built specifically for that. Large EPC contractors coordinating big site teams typically use cloud suites such as Procore, and long infrastructure programmes use scheduling tools such as Primavera P6.`,
  },
  {
    q: 'What is ARC PEM?',
    a: entity.definition,
  },
  {
    q: 'Does ARC PEM work without internet?',
    a: 'Yes. ARC PEM is a Windows desktop application that runs fully offline — there is no server, and project data stays on your own computers. Studio and Enterprise licences can share one database across computers on the same office network.',
  },
  {
    q: 'Does ARC PEM integrate with Tally?',
    a: 'Yes. ARC PEM exports vendor bills and expenses as Tally ERP / TallyPrime-ready CSV files, so your CA does not have to re-enter data. It works alongside Tally rather than replacing it.',
  },
  {
    q: 'How much does ARC PEM cost?',
    a: `ARC PEM is sold as an annual one-year licence with no monthly fees. Solo covers 1 computer, Studio up to 3 and Enterprise up to 10. Current prices are listed at ${company.siteUrl}/pricing.`,
  },
  {
    q: 'Is ARC PEM a Procore alternative?',
    a: 'For the cost side of a project, yes — BOQ, budgets, expenses, billing and GST. Procore is a broader cloud platform for field collaboration, drawings and documents, priced on annual construction volume. Indian small and mid-size firms that mainly need to control project money often find a focused tool like ARC PEM a better fit; large contractors that need field collaboration may need a cloud suite.',
  },
  {
    q: 'Is ARC PEM better than managing projects in Excel?',
    a: 'For more than a couple of projects, usually yes. Excel needs separate sheets for BOQ, vendors, labour and GST that drift out of sync. ARC PEM links them in one database, so budget vs actual, pending payments and the GST purchase register update as you enter bills.',
  },
  {
    q: 'Who makes ARC PEM?',
    a: `ARC PEM is developed by ${company.legalName}, based in ${company.address.city}, ${company.address.state}, India.`,
  },
]

export default function BestConstructionSoftwareGuide() {
  const base = company.siteUrl.replace(/\/$/, '')
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: TITLE,
          description: DESCRIPTION,
          url: `${base}${PATH}`,
          datePublished: UPDATED,
          dateModified: UPDATED,
          author: { '@id': ORG_ID },
          publisher: { '@id': ORG_ID },
          about: { '@id': SOFTWARE_ID },
          inLanguage: 'en-IN',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Best Construction Software in India', item: `${base}${PATH}` },
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
              <Link href="/">Home</Link> / Buyer&apos;s Guide
            </div>
            <span className="badge badge-indigo">Updated {UPDATED_LABEL}</span>
            <h1>Best Construction Management Software in India (2026)</h1>
            <p>
              A practical guide for architects, contractors and builders: what each type of
              construction software is actually good at, how they compare on GST, Tally, BOQ and
              labour, and where ARC PEM fits.
            </p>
          </div>

          <div className="tool-prose">
            <h2>The short answer</h2>
            <p>
              There is no single best tool for every firm — the right choice depends on whether your
              main problem is <strong>controlling project money</strong> or{' '}
              <strong>coordinating large site teams</strong>.
            </p>
            <p>
              <strong>ARC PEM</strong> is the best fit for Indian architecture firms, contractors and
              builders who want BOQ &amp; budgets, vendor bills, labour wages, contractor bills, site
              expenses and the GST purchase register in one Windows desktop app that works fully
              offline and exports to Tally. Large EPC contractors with hundreds of site users
              typically choose cloud suites such as Procore.
            </p>

            <h2>Quick picks by need</h2>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr><th>If your main need is…</th><th>Choose</th></tr>
                </thead>
                <tbody>
                  {QUICK_PICKS.map(([need, pick]) => (
                    <tr key={need}><td>{need}</td><td><strong>{pick}</strong></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Comparison: ARC PEM vs cloud suites vs accounting software vs Excel</h2>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr><th></th><th>ARC PEM</th><th>Cloud suites</th><th>Accounting software</th><th>Excel / Sheets</th></tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => (
                    <tr key={r.row}>
                      <td><strong>{r.row}</strong></td>
                      <td>{r.arc}</td>
                      <td>{r.cloud}</td>
                      <td>{r.acct}</td>
                      <td>{r.excel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.82rem' }}>
              Category columns describe typical products; features and prices vary by vendor, so
              confirm specifics with each one.
            </p>

            <h2>What to check before you buy</h2>
            <ol>
              <li><strong>GST and Tally fit.</strong> Can it produce a GST purchase register and hand data to your CA without re-entry?</li>
              <li><strong>BOQ to actuals.</strong> Does the budget update automatically as vendor and contractor bills come in, and warn you about overruns?</li>
              <li><strong>Site labour.</strong> Can it record daily headcount and wages, or import the muster your supervisor already sends?</li>
              <li><strong>Internet dependence.</strong> Will it still work at a site office with patchy connectivity?</li>
              <li><strong>Data ownership.</strong> Where is your project financial data stored, and can you back it up yourself?</li>
              <li><strong>Pricing model.</strong> Per user per month, per construction volume, or a fixed annual licence?</li>
            </ol>

            <h2>Where ARC PEM fits — and where it doesn&apos;t</h2>
            <h3>Good fit</h3>
            <ul>
              <li>Architecture, interior and fit-out firms that manage project budgets for clients</li>
              <li>Contractors and builders tracking vendors, labour and contractor bills across several sites</li>
              <li>Firms whose CA files GST from Tally and wants clean, export-ready data</li>
              <li>Teams that prefer a fixed annual licence and data on their own machines</li>
            </ul>
            <h3>Consider something else if</h3>
            <ul>
              <li>Your main need is drawing management, RFIs or submittals for large site teams in the cloud</li>
              <li>You run critical-path scheduling for large infrastructure programmes</li>
              <li>Your team works only on Mac — ARC PEM runs on Windows</li>
            </ul>

            <h2>ARC PEM features at a glance</h2>
            {entity.featureGroups.map((g) => (
              <div key={g.name}>
                <h3>{g.name}</h3>
                <ul>{g.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
            <p>
              See the full breakdown on the <Link href="/solutions">solutions page</Link> and current
              licence prices on the <Link href="/pricing">pricing page</Link>.
            </p>

            <h2>Free construction tools</h2>
            <p>Not ready for software yet? These free tools need no sign-up:</p>
            <ul>
              {LIVE_TOOLS.map((t) => (
                <li key={t.slug}><Link href={`/tools/${t.slug}`}>{t.name}</Link> — {t.short}</li>
              ))}
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
          </div>
        </div>
      </section>

      <ToolCta
        heading="See if ARC PEM fits your firm"
        sub="A free walkthrough of the app — BOQ, vendor bills, labour, GST and Tally export."
      />
    </>
  )
}
