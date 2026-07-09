import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import BillGenerator from '@/components/tools/BillGenerator'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'

const TITLE = 'Free GST Contractor Bill Generator'
const DESCRIPTION =
  'Create a GST-compliant contractor bill online: work items, SAC codes, CGST/SGST or IGST, amount in words — print or save as PDF. Free, no sign-up.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools/contractor-bill-generator' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/tools/contractor-bill-generator', images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION, images: ['/og-image.jpg'] },
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
  {
    q: 'What is the GST rate for affordable housing projects?',
    a: 'Government-notified affordable housing projects attract a concessional 1% GST (without input tax credit) for the promoter, versus 5% for other non-affordable residential apartment projects under the same scheme. These promoter-side rates are distinct from the 18% rate a contractor charges the promoter for works-contract services — confirm which side of the transaction you\'re billing before applying a concessional rate.',
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
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to make a contractor bill with GST',
          description: 'Step-by-step process for raising a GST-compliant contractor or works-contract invoice in India.',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Confirm your registration and the place of supply',
              text: "If you and the client are registered in the same state, charge CGST + SGST. If the client's registered address or the site is in a different state, charge IGST instead.",
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Identify the correct GST rate',
              text: 'Most private commercial and residential works contracts attract 18% GST, with a few concessional categories such as affordable housing.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Assign a consecutive invoice number and date',
              text: 'Use a sequential number such as INV-014, or RA-3/2026 for a running account bill.',
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: 'List each work item',
              text: 'Add the SAC code, measured quantity, unit and agreed rate for each item, exactly as billed in the BOQ or work order.',
            },
            {
              '@type': 'HowToStep',
              position: 5,
              name: 'Calculate the taxable value',
              text: 'Multiply quantity by rate and sum across items, then apply the CGST + SGST or IGST split identified earlier.',
            },
            {
              '@type': 'HowToStep',
              position: 6,
              name: 'Round off the total and print the amount in words',
              text: 'Indian invoices are expected to show the total both in figures and in words.',
            },
            {
              '@type': 'HowToStep',
              position: 7,
              name: 'Add bank details and sign',
              text: 'Sign as authorised signatory before handing the bill to the client or submitting it for payment certification.',
            },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to raise a running account (RA) bill on a construction project',
          description:
            'Step-by-step workflow contractors use to bill a client at intervals against work measured on site, instead of billing once at project completion.',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Get the measurement certified',
              text: 'The site engineer or architect signs off a measurement sheet (MB) for the work completed since the last RA bill.',
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Apply the work-order rates',
              text: 'Apply the agreed rates to the certified quantities to get the gross value of work done till date.',
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Subtract the value already billed',
              text: 'Deduct the value already billed in previous RA bills so you invoice only the incremental work since the last certificate.',
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: 'Deduct retention money',
              text: 'Deduct retention money, commonly 5–10% as per the contract, and any mobilisation advance being recovered pro-rata.',
            },
            {
              '@type': 'HowToStep',
              position: 5,
              name: 'Deduct TDS where applicable',
              text: 'Deduct income-tax TDS under Section 194C, and GST TDS at 2% on contracts with government bodies or PSUs above ₹2.5 lakh.',
            },
            {
              '@type': 'HowToStep',
              position: 6,
              name: 'Apply GST and label the bill',
              text: 'Apply GST on the net taxable value and label the bill clearly, for example "RA Bill No. 3", referencing the cumulative work done and the previous RA number.',
            },
            {
              '@type': 'HowToStep',
              position: 7,
              name: 'Route it for certification',
              text: "Submit the bill to the client's site engineer or PMC for certification before it goes for payment.",
            },
          ],
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

            <h2>How to make a contractor bill with GST — step by step</h2>
            <p>
              Follow these steps for any contractor or works-contract invoice, then use the generator
              above to produce the finished document:
            </p>
            <ol>
              <li><strong>Confirm your registration and the place of supply.</strong> If you and the client are registered in the same state, charge CGST + SGST; if the client&apos;s registered address or the site is in a different state, charge IGST instead.</li>
              <li><strong>Identify the correct GST rate</strong> for the contract from the rate table below — most private commercial and residential works contracts attract 18%, with a few concessional categories.</li>
              <li><strong>Assign a consecutive invoice number and date</strong> — e.g. INV-014, or RA-3/2026 for a running account bill (see the RA workflow below).</li>
              <li><strong>List each work item</strong> with its SAC code, measured quantity, unit and agreed rate, exactly as billed in the BOQ or work order.</li>
              <li><strong>Calculate the taxable value</strong> — quantity × rate, summed across items — then apply the GST split from step 1.</li>
              <li><strong>Round off the total</strong> and print the amount in words; Indian invoices are expected to show both.</li>
              <li><strong>Add bank details and sign</strong> as authorised signatory before handing the bill to the client or submitting it for payment certification.</li>
            </ol>

            <h2>How are running account (RA) bills made for Indian construction projects?</h2>
            <p>
              Long projects aren&apos;t billed once at the end — contractors raise{' '}
              <strong>running account (RA) bills</strong> at agreed intervals against work actually
              measured on site. Each RA bill follows the same GST rules as above, plus a few
              construction-specific steps:
            </p>
            <ol>
              <li><strong>Get the measurement certified.</strong> The site engineer or architect signs off a measurement sheet (MB) for the work completed since the last RA — the bill is based on this certified record, not a verbal estimate.</li>
              <li><strong>Apply the work-order rates</strong> to the certified quantities to get the gross value of work done till date.</li>
              <li><strong>Subtract the value already billed</strong> in previous RA bills, so you&apos;re invoicing only the incremental work since the last certificate.</li>
              <li><strong>Deduct retention money</strong> — commonly 5–10% as per the contract — and any mobilisation advance being recovered pro-rata.</li>
              <li><strong>Deduct TDS where applicable</strong> — income-tax TDS under Section 194C, and GST TDS at 2% on contracts with government bodies or PSUs above ₹2.5 lakh.</li>
              <li><strong>Apply GST</strong> on the net taxable value and label the bill clearly — “RA Bill No. 3” — referencing the cumulative work done and the previous RA number.</li>
              <li><strong>Route it for certification</strong> by the client&apos;s site engineer or PMC before submitting it for payment.</li>
            </ol>

            <h2>Standard GST rates for construction &amp; works contracts</h2>
            <p>
              A construction contract that bundles both material and labour is a <strong>works
              contract</strong> under GST and is treated as a supply of services, not goods. Rates vary
              by who is billing whom and under which scheme:
            </p>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th className="num">GST Rate</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Commercial building — works contract</td><td className="num">18%</td><td>Standard rate for a contractor billing material + labour</td></tr>
                  <tr><td>Residential building (non-affordable) — works contract</td><td className="num">18%</td><td>Contractor-to-client or contractor-to-promoter billing</td></tr>
                  <tr><td>Affordable housing project (govt-notified scheme)</td><td className="num">1%*</td><td>Promoter&apos;s rate, without ITC; subject to carpet-area and value caps</td></tr>
                  <tr><td>Other residential apartment projects</td><td className="num">5%*</td><td>Promoter&apos;s rate under the 2019 scheme, without ITC</td></tr>
                  <tr><td>Government civil works (roads, irrigation, etc.)</td><td className="num">12–18%</td><td>Varies by notification; several concessional rates were withdrawn in recent rate rationalisations</td></tr>
                  <tr><td>Pure labour contract, single residential unit</td><td className="num">Nil / exempt</td><td>Applies only where the contractor supplies no material</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              *The 1%/5% promoter rates apply to the developer billing the flat buyer, not to a
              contractor billing the developer for construction services — the two are frequently
              confused. GST rates are revised with government notifications from time to time (cement
              moved to 18% in the 2025 reforms), so treat this table as a starting reference and confirm
              the current rate for your exact contract with your CA.
            </p>

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
