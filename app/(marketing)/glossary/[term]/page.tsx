import type { Metadata } from 'next'
import { fit } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { GLOSSARY, glossaryTerm } from '@/lib/glossary'
import { SEGMENTS, COMPARISONS } from '@/lib/aeo-pages'
import { CONTENT_UPDATED, ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import { LIVE_TOOLS } from '@/lib/tools'
import '../../tools/tools.css'

export const dynamicParams = false

// Which audience pages a term sends readers to: GST terms to the firms that file through a CA and use Tally, budgeting
// terms to architects and interiors, and everything else to the contractors and builders who run sites.
const GST_TERMS = new Set(['gst-purchase-register', 'gstr-2b', 'input-tax-credit', 'vendor-reconciliation'])
const BUDGET_TERMS = new Set(['bill-of-quantities', 'cost-per-square-foot', 'rate-analysis', 'schedule-of-rates', 'provisional-sum', 'contingency', 'budget-vs-actual', 'cost-overrun'])
function audienceFor(slug: string) {
  const segs = BUDGET_TERMS.has(slug) ? ['architects', 'interior-designers'] : ['contractors', 'builders']
  const cmp = GST_TERMS.has(slug) ? 'arc-pem-and-tally' : 'arc-pem-vs-excel'
  return {
    segments: segs.map((x) => SEGMENTS.find((s) => s.slug === x)).filter((x): x is NonNullable<typeof x> => Boolean(x)),
    comparison: COMPARISONS.find((c) => c.slug === cmp),
  }
}

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }))
}

export function generateMetadata({ params }: { params: { term: string } }): Metadata {
  const t = glossaryTerm(params.term)
  if (!t) return {}
  const url = `/glossary/${t.slug}`
  return {
    title: t.question,
    description: fit(t.definition, 158),
    alternates: { canonical: url },
    openGraph: { type: 'article', title: `${t.question} · ARC PEM`, description: t.definition, url },
    twitter: { card: 'summary_large_image', title: `${t.question} · ARC PEM`, description: t.definition },
  }
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
  const t = glossaryTerm(params.term)
  if (!t) notFound()
  const base = company.siteUrl.replace(/\/$/, '')
  const url = `${base}/glossary/${t.slug}`
  const tool = t.tool ? LIVE_TOOLS.find((x) => x.slug === t.tool) : undefined
  const audience = audienceFor(t.slug)
  const related = t.related.map(glossaryTerm).filter((x): x is NonNullable<typeof x> => Boolean(x))

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTerm',
          '@id': `${url}#term`,
          name: t.term,
          description: t.definition,
          url,
          inDefinedTermSet: { '@type': 'DefinedTermSet', '@id': `${base}/glossary#set`, name: 'ARC PEM Construction Finance Glossary', url: `${base}/glossary` },
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: t.question,
          description: t.definition,
          url,
          dateModified: CONTENT_UPDATED,
          author: { '@id': ORG_ID },
          publisher: { '@id': ORG_ID },
          about: { '@id': `${url}#term` },
          mentions: { '@id': SOFTWARE_ID },
          inLanguage: 'en-IN',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Glossary', item: `${base}/glossary` },
            { '@type': 'ListItem', position: 3, name: t.term, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [{ q: t.question, a: t.definition }, ...t.faqs].map((f) => ({
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
              <Link href="/">Home</Link> / <Link href="/glossary">Glossary</Link> / {t.term}
            </div>
            <span className="badge badge-indigo">Glossary</span>
            <h1>{t.question}</h1>
            <p>{t.definition}</p>
          </div>

          <div className="tool-prose">
            <h2>{t.term} explained</h2>
            {t.details.map((d) => <p key={d}>{d}</p>)}
            {t.example && (
              <>
                <h3>Example</h3>
                <p>{t.example}</p>
              </>
            )}

            <h2>How ARC PEM helps</h2>
            <p>
              {t.inArcPem} <Link href="/solutions">See all features</Link>.
            </p>
            {tool && (
              <p>
                Free tool: <Link href={`/tools/${tool.slug}`}>{tool.name}</Link> — {tool.short}
              </p>
            )}

            <h2>Frequently asked questions</h2>
            <div className="tool-faq">
              {t.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>

            <h2>Related terms</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug}><Link href={`/glossary/${r.slug}`}>{r.term}</Link></li>
              ))}
              <li><Link href="/glossary">All glossary terms</Link></li>
            </ul>

            <h2>Where this fits in your workflow</h2>
            <ul>
              {audience.segments.map((s) => (
                <li key={s.slug}><Link href={`/for/${s.slug}`}>ARC PEM for {s.label.toLowerCase()}</Link> — {s.title}</li>
              ))}
              {audience.comparison && (
                <li><Link href={`/compare/${audience.comparison.slug}`}>{audience.comparison.label}</Link> — {audience.comparison.title}</li>
              )}
              <li><Link href="/guides/best-construction-software-india">Buyer’s guide: best construction software in India</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <ToolCta />
    </>
  )
}
