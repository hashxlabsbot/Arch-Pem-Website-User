import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { SEGMENTS, COMPARISONS, storyFor } from '@/lib/aeo-pages'
import { entity, ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import '../../tools/tools.css'

export const dynamicParams = false

export function generateStaticParams() {
  return SEGMENTS.map((s) => ({ segment: s.slug }))
}

const find = (slug: string) => SEGMENTS.find((s) => s.slug === slug)

export function generateMetadata({ params }: { params: { segment: string } }): Metadata {
  const s = find(params.segment)
  if (!s) return {}
  const url = `/for/${s.slug}`
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: url },
    openGraph: { title: `${s.title} · ARC PEM`, description: s.description, url, images: [{ url: '/og-image.jpg', width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: `${s.title} · ARC PEM`, description: s.description, images: ['/og-image.jpg'] },
  }
}

export default function SegmentPage({ params }: { params: { segment: string } }) {
  const s = find(params.segment)
  if (!s) notFound()
  const base = company.siteUrl.replace(/\/$/, '')
  const url = `${base}/for/${s.slug}`
  const story = storyFor(s.story)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: s.title,
          description: s.description,
          url,
          about: { '@id': SOFTWARE_ID },
          publisher: { '@id': ORG_ID },
          audience: { '@type': 'BusinessAudience', audienceType: s.label },
          inLanguage: 'en-IN',
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: `For ${s.label}`, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: s.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tool-hero">
            <div className="tool-crumb">
              <Link href="/">Home</Link> / For {s.label}
            </div>
            <span className="badge badge-indigo">ARC PEM for {s.label}</span>
            <h1>{s.h1}</h1>
            <p>{s.description}</p>
          </div>

          <div className="tool-prose">
            <h2>In short</h2>
            <p>{s.answer}</p>

            <h2>Problems ARC PEM solves for {s.label.toLowerCase()}</h2>
            {s.pains.map((p) => (
              <div key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}

            <h2>Features {s.label.toLowerCase()} use most</h2>
            <ul>{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
            <p>
              See every feature on the <Link href="/solutions">solutions page</Link>. Platform:{' '}
              {entity.platform}. Sold as an annual licence — <Link href="/pricing">see pricing</Link>.
            </p>

            <h2>Customer results</h2>
            {story ? (
              <p>
                <strong>{story.company}</strong> ({story.segment}): {story.result}.{' '}
                <Link href="/about">Read the customer stories</Link>.
              </p>
            ) : (
              <p>
                {entity.proof.stats.join(' · ')}. <Link href="/about">Read the customer stories</Link>.
              </p>
            )}

            <h2>Frequently asked questions</h2>
            <div className="tool-faq">
              {s.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>

            <h2>Compare and explore</h2>
            <ul>
              <li><Link href="/guides/best-construction-software-india">Best construction management software in India — buyer’s guide</Link></li>
              {COMPARISONS.map((c) => (
                <li key={c.slug}><Link href={`/compare/${c.slug}`}>{c.label}</Link></li>
              ))}
              {SEGMENTS.filter((o) => o.slug !== s.slug).map((o) => (
                <li key={o.slug}><Link href={`/for/${o.slug}`}>ARC PEM for {o.label.toLowerCase()}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ToolCta
        heading="See ARC PEM on projects like yours"
        sub="Book a free demo — we’ll walk you through BOQ, bills, labour, GST and Tally export."
      />
    </>
  )
}
