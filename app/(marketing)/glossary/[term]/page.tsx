import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { GLOSSARY, glossaryTerm } from '@/lib/glossary'
import { CONTENT_UPDATED, ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import { LIVE_TOOLS } from '@/lib/tools'
import '../../tools/tools.css'

export const dynamicParams = false

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }))
}

export function generateMetadata({ params }: { params: { term: string } }): Metadata {
  const t = glossaryTerm(params.term)
  if (!t) return {}
  const url = `/glossary/${t.slug}`
  return {
    title: t.question,
    description: t.definition,
    alternates: { canonical: url },
    openGraph: { type: 'article', title: `${t.question} · ARC PEM`, description: t.definition, url, images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: `${t.question} · ARC PEM`, description: t.definition, images: ['/og-image.jpg'] },
  }
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
  const t = glossaryTerm(params.term)
  if (!t) notFound()
  const base = company.siteUrl.replace(/\/$/, '')
  const url = `${base}/glossary/${t.slug}`
  const tool = t.tool ? LIVE_TOOLS.find((x) => x.slug === t.tool) : undefined
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
          </div>
        </div>
      </section>

      <ToolCta />
    </>
  )
}
