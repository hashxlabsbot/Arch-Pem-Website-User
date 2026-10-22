import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { TOOLS, LIVE_TOOLS } from '@/lib/tools'
import { company } from '@/lib/company'
import {
  RupeeIcon, CalculatorIcon, CubeIcon, BricksIcon, SteelIcon, RulerIcon,
} from '@/components/icons'

const TITLE = 'Free Construction Tools & Calculators'
const DESCRIPTION =
  'Free tools for Indian builders, contractors and architects — GST bill generator, cost calculator, concrete calculator. No sign-up, no limits.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/tools' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/tools' },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  'contractor-bill-generator': <RupeeIcon size={24} color="#4f46e5" />,
  'construction-cost-calculator': <CalculatorIcon size={24} color="#4f46e5" />,
  'concrete-calculator': <CubeIcon size={24} color="#4f46e5" />,
  'bar-bending-schedule-calculator': <SteelIcon size={24} color="#4f46e5" />,
  'brick-calculator': <BricksIcon size={24} color="#64748b" />,
  'steel-weight-calculator': <SteelIcon size={24} color="#64748b" />,
  'area-converter': <RulerIcon size={24} color="#64748b" />,
}

const FAQS = [
  {
    q: 'Are these construction tools really free?',
    a: 'Yes — every tool on this page is free with no sign-up, no usage limits and no watermarks. They are built and maintained by Hash X Labs, the team behind ARC PEM project expense management software.',
  },
  {
    q: 'Do the tools upload my data anywhere?',
    a: 'No. All calculators and the bill generator run entirely in your browser. Details you type (like your firm name in the bill generator) are stored only on your own device.',
  },
  {
    q: 'Do they work on mobile?',
    a: 'Yes — every tool is responsive and works on any phone, tablet or computer with a modern browser. No app installation needed.',
  },
]

export default function ToolsIndexPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Free Construction Tools & Calculators',
          itemListElement: LIVE_TOOLS.map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.name,
            url: `${base}/tools/${t.slug}`,
          })),
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

      <section className="section" style={{ paddingTop: '120px' }}>
        <div className="container">
          <div className="img-hero fade-up in">
            <Image src="/images/finance-analytics.jpg" alt="Construction cost planning with calculators and reports" fill priority sizes="100vw" />
            <div className="img-hero-inner">
              <span className="badge badge-indigo">Free Tools</span>
              <h1>Free tools for builders, contractors &amp; architects</h1>
              <p>
                Calculators and generators we built for the Indian construction industry — GST bills,
                cost estimates, concrete quantities and more. Free forever, no sign-up, nothing uploaded.
              </p>
            </div>
          </div>

          <div className="sec-hd fade-up" style={{ marginTop: '72px' }}>
            <span className="badge badge-indigo">Pick a Tool</span>
            <h2>Everyday site &amp; office utilities</h2>
            <p>Each tool works instantly in your browser — on site, in the office, or on your phone.</p>
          </div>

          <div className="tools-grid">
            {TOOLS.map((t, i) =>
              t.live ? (
                <Link href={`/tools/${t.slug}`} key={t.slug} className={`tool-card fade-up${i % 3 === 1 ? ' d1' : i % 3 === 2 ? ' d2' : ''}`}>
                  <div className="tool-card-icon">{TOOL_ICONS[t.slug]}</div>
                  <div className="tool-card-title">{t.name}</div>
                  <div className="tool-card-desc">{t.short}</div>
                  <div className="tool-card-link">Open tool →</div>
                </Link>
              ) : (
                <div key={t.slug} className={`tool-card soon fade-up${i % 3 === 1 ? ' d1' : i % 3 === 2 ? ' d2' : ''}`}>
                  <div className="tool-card-icon">{TOOL_ICONS[t.slug]}</div>
                  <div className="tool-card-title">{t.name}</div>
                  <div className="tool-card-desc">{t.short}</div>
                  <div className="tool-card-link" style={{ color: 'var(--gray-400)' }}>Coming soon</div>
                </div>
              ),
            )}
          </div>

          <div className="tool-prose">
            <h2>Why we give these away</h2>
            <p>
              We build <Link href="/solutions">ARC PEM</Link> — cloud software that Indian
              construction and architecture firms use to track BOQs, vendor bills, labour and GST.
              These free tools solve the small, everyday versions of the same problems: raising a
              clean contractor bill, sanity-checking a construction budget, ordering the right number
              of cement bags. Use them as much as you like; if the bigger problem of tracking an
              entire project&apos;s expenses sounds familiar, <Link href="/pricing">that&apos;s what the
              full product is for</Link>.
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
          </div>
        </div>
      </section>

      <ToolCta />
    </>
  )
}
