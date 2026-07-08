import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import BillGenerator from '@/components/tools/BillGenerator'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'

const TITLE = 'Free GST Contractor Bill Generator — Construction Invoice Format'
const DESCRIPTION =
  'Create a GST-compliant contractor bill online in minutes: work items, SAC codes, CGST/SGST or IGST, amount in words — then print or save as PDF. 100% free, no sign-up, nothing uploaded.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/contractor-bill-generator' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/tools/contractor-bill-generator' },
  twitter: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

const FAQS = [
  {
    q: 'Is this contractor bill generator really free?',
    a: 'Yes — completely free, with no sign-up, watermark fees, or bill limits. It is built by the team behind ARC PEM, desktop expense-management software for Indian construction firms, as a free utility for contractors and builders.',
  },
  {
    q: 'Is my billing data uploaded anywhere?',
    a: 'No. The bill is generated entirely in your browser and nothing is sent to any server. Your firm and bank details are stored only on your own device so you don’t have to retype them next time.',
  },
  {
    q: 'What GST rate applies to construction work?',
    a: 'Most works contract services attract 18% GST (9% CGST + 9% SGST within a state, or 18% IGST across states). Certain specified works and pure-labour contracts for individual houses can attract concessional or nil rates. Rates change with government notifications, so confirm the applicable rate with your CA before billing.',
  },
  {
    q: 'When do I use CGST + SGST versus IGST?',
    a: 'If you and your client are registered in the same state, split the tax equally as CGST + SGST. If the place of supply is in a different state, charge the full rate as IGST instead.',
  },
  {
    q: 'What is the SAC code for construction services?',
    a: 'Construction services fall under SAC heading 9954. Common sub-codes include 995411 for residential buildings, 995414 for commercial buildings, and 995473 for painting services. If unsure, 9954 is the standard heading used on contractor invoices.',
  },
  {
    q: 'Can I raise a bill without a GSTIN?',
    a: 'Yes. If your turnover is below the GST registration threshold you can issue a normal bill without charging GST — choose the “No GST” option in the generator. You cannot legally charge GST without a valid GSTIN.',
  },
  {
    q: 'What is an RA (running account) bill?',
    a: 'On longer projects, contractors raise stage-wise running account bills — RA-1, RA-2, and so on — against measured work, instead of one final bill. You can use this generator for each RA bill; mention the RA number in the bill number or notes.',
  },
]

export default function BillGeneratorPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'GST Contractor Bill Generator',
          url: `${base}/tools/contractor-bill-generator`,
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
            { '@type': 'ListItem', position: 2, name: 'GST Contractor Bill Generator', item: `${base}/tools/contractor-bill-generator` },
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
              <Link href="/tools">Free Tools</Link> / GST Contractor Bill Generator
            </div>
            <span className="badge badge-indigo">100% Free · No Sign-up</span>
            <h1>GST Contractor Bill Generator</h1>
            <p>
              Create a professional, GST-compliant contractor bill in your browser — add work items,
              pick CGST/SGST or IGST, and print or save it as a PDF. Nothing is uploaded; your details
              stay on your device.
            </p>
          </div>

          <div className="tool-wrap">
            <BillGenerator />
          </div>

          <div className="tool-prose">
            <h2>What a GST-compliant contractor bill must include</h2>
            <p>
              Whether you call it a contractor bill, work bill, or tax invoice, a GST-registered
              contractor&apos;s invoice needs a specific set of fields to be valid for the client&apos;s
              input tax credit. This generator covers all of them:
            </p>
            <ul>
              <li><strong>Your name, address and GSTIN</strong> — exactly as registered.</li>
              <li><strong>A consecutive bill number and date</strong> — e.g. INV-014 or RA-3/2026.</li>
              <li><strong>Client name, address and GSTIN</strong> (if the client is registered).</li>
              <li><strong>Description of work with SAC code</strong> — construction services fall under SAC 9954.</li>
              <li><strong>Quantity, unit, rate and taxable value</strong> for each work item.</li>
              <li><strong>GST split shown separately</strong> — CGST + SGST within your state, IGST across states.</li>
              <li><strong>Total in figures and words</strong>, plus your signature as authorised signatory.</li>
            </ul>

            <h2>Common SAC codes for construction work</h2>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr>
                    <th>SAC Code</th>
                    <th>Service</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>9954</td><td>Construction services (general heading used on most contractor bills)</td></tr>
                  <tr><td>995411</td><td>Construction of single &amp; multi-dwelling residential buildings</td></tr>
                  <tr><td>995414</td><td>Construction of commercial buildings</td></tr>
                  <tr><td>995421</td><td>Construction of highways, roads and streets</td></tr>
                  <tr><td>995473</td><td>Painting services</td></tr>
                  <tr><td>998722</td><td>Repair services of other goods (misc. site repairs)</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Most contractors simply use the 9954 heading on every line. Sub-codes matter mainly for
              large firms whose accountants file detailed GSTR returns — when in doubt, ask your CA.
            </p>

            <h2>How GST applies on contractor bills</h2>
            <p>
              A construction contract that includes both material and labour is a <strong>works
              contract</strong> under GST and is treated as a supply of services. The standard rate is{' '}
              <strong>18%</strong>. Pure-labour contracts for a single residential unit (and certain
              affordable-housing and government works) can attract concessional or nil rates under
              specific notifications. GST rates are revised from time to time — the 2025 GST reforms
              moved several construction inputs like cement to 18% — so treat the rates here as the
              common defaults and confirm the current rate for your exact contract with your CA.
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
              Also try our free{' '}
              <Link href="/tools/construction-cost-calculator">construction cost calculator</Link> and{' '}
              <Link href="/tools/concrete-calculator">concrete material calculator</Link>.
            </p>
          </div>
        </div>
      </section>

      <ToolCta
        heading="Raising the bill is the easy part. Tracking 200 of them isn't."
        sub="ARC PEM keeps every vendor bill, contractor RA bill, labour payment and GST entry organised project-wise — with one-click purchase registers and Tally export. Fully offline, on your own PC."
      />
    </>
  )
}
