import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { pageMetadata } from '@/lib/seo'
import { COMPARISONS, SEGMENTS } from '@/lib/aeo-pages'
import { ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import '../../tools/tools.css'

export const dynamicParams = false

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }))
}

const find = (slug: string) => COMPARISONS.find((c) => c.slug === slug)

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = find(params.slug)
  if (!c) return {}
  return pageMetadata({ title: c.title, description: c.description, path: `/compare/${c.slug}`, type: 'article' })
}

export default function ComparePage({ params }: { params: { slug: string } }) {
  const c = find(params.slug)
  if (!c) notFound()
  const base = company.siteUrl.replace(/\/$/, '')
  const url = `${base}/compare/${c.slug}`

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: c.title,
          description: c.description,
          url,
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
            { '@type': 'ListItem', position: 2, name: c.label, item: url },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tool-hero">
            <div className="tool-crumb">
              <Link href="/">Home</Link> / Compare
            </div>
            <span className="badge badge-indigo">Comparison</span>
            <h1>{c.h1}</h1>
            <p>{c.description}</p>
          </div>

          <div className="tool-prose">
            <h2>The short answer</h2>
            <p>{c.answer}</p>

            <h2>Side by side</h2>
            <div className="tool-table-wrap">
              <table className="tool-table">
                <thead>
                  <tr><th></th><th>ARC PEM</th><th>{c.other}</th></tr>
                </thead>
                <tbody>
                  {c.rows.map((r) => (
                    <tr key={r.row}>
                      <td><strong>{r.row}</strong></td>
                      <td>{r.arc}</td>
                      <td>{r.other}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Choose ARC PEM if</h2>
            <ul>{c.chooseArc.map((x) => <li key={x}>{x}</li>)}</ul>
            <h2>{c.other} alone is enough if</h2>
            <ul>{c.chooseOther.map((x) => <li key={x}>{x}</li>)}</ul>

            <h2>Frequently asked questions</h2>
            <div className="tool-faq">
              {c.faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <div className="faq-a">{f.a}</div>
                </details>
              ))}
            </div>

            <h2>Related</h2>
            <ul>
              <li><Link href="/guides/best-construction-software-india">Best construction management software in India — buyer’s guide</Link></li>
              {COMPARISONS.filter((o) => o.slug !== c.slug).map((o) => (
                <li key={o.slug}><Link href={`/compare/${o.slug}`}>{o.label}</Link></li>
              ))}
              {SEGMENTS.map((s) => (
                <li key={s.slug}><Link href={`/for/${s.slug}`}>ARC PEM for {s.label.toLowerCase()}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ToolCta heading="See it on your own projects" sub="Book a free demo of ARC PEM — BOQ, bills, labour, GST and Tally export." />
    </>
  )
}
