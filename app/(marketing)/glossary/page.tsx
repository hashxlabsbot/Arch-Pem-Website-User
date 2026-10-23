import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import ToolCta from '@/components/tools/ToolCta'
import { company } from '@/lib/company'
import { GLOSSARY_SORTED } from '@/lib/glossary'
import { CONTENT_UPDATED, ORG_ID } from '@/lib/seo-entity'
import '../tools/tools.css'

const TITLE = 'Construction Finance Glossary — BOQ, RA Bill, GSTR-2B & More'
const DESCRIPTION =
  'Plain-English definitions of the construction and GST terms Indian builders use daily: BOQ, RA bill, retention, GSTR-2B, ITC, work order and more.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/glossary' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/glossary' },
  twitter: { card: 'summary_large_image', title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

export default function GlossaryPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  const url = `${base}/glossary`

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'DefinedTermSet',
          '@id': `${url}#set`,
          name: 'ARC PEM Construction Finance Glossary',
          description: DESCRIPTION,
          url,
          inLanguage: 'en-IN',
          dateModified: CONTENT_UPDATED,
          publisher: { '@id': ORG_ID },
          hasDefinedTerm: GLOSSARY_SORTED.map((t) => ({
            '@type': 'DefinedTerm',
            '@id': `${base}/glossary/${t.slug}#term`,
            name: t.term,
            description: t.definition,
            url: `${base}/glossary/${t.slug}`,
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Glossary', item: url },
          ],
        }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tool-hero">
            <div className="tool-crumb">
              <Link href="/">Home</Link> / Glossary
            </div>
            <span className="badge badge-indigo">Glossary</span>
            <h1>Construction finance glossary</h1>
            <p>{DESCRIPTION}</p>
          </div>

          <div className="tool-prose">
            {GLOSSARY_SORTED.map((t) => (
              <div key={t.slug}>
                <h2>
                  <Link href={`/glossary/${t.slug}`} style={{ color: 'inherit' }}>{t.term}</Link>
                </h2>
                <p>
                  {t.definition}{' '}
                  <Link href={`/glossary/${t.slug}`}>Read more</Link>
                </p>
              </div>
            ))}

            <h2>Related</h2>
            <ul>
              <li><Link href="/tools">Free construction calculators</Link></li>
              <li><Link href="/guides/best-construction-software-india">Best construction management software in India — buyer’s guide</Link></li>
              <li><Link href="/blog">ARC PEM blog</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <ToolCta
        heading="Track every term on this page in one place"
        sub="ARC PEM keeps BOQ budgets, contractor bills, labour wages, pending payments and the GST purchase register together for every project."
      />
    </>
  )
}
