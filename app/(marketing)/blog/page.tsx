import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import JournalIndex from '@/components/blog/JournalIndex'
import { toJPost } from '@/components/blog/journal-data'
import { SEGMENTS } from '@/lib/aeo-pages'
import { LIVE_TOOLS } from '@/lib/tools'
import { getAllPosts, getCategories } from '@/lib/blog'
import { company } from '@/lib/company'
import { clampDescription, RSS_ALTERNATE } from '@/lib/seo'
import BreadcrumbsLd from '@/components/seo/Breadcrumbs'

const TITLE = 'Blog — BOQ, GST & Contractor Billing Guides'
const DESCRIPTION =
  'Practical, worked-example guides on GST compliance, BOQ estimation, contractor billing and vendor management for Indian architects, builders and construction firms.'

export const metadata: Metadata = {
  title: TITLE,
  description: clampDescription(DESCRIPTION),
  alternates: { canonical: '/blog', types: RSS_ALTERNATE },
  openGraph: { title: `${TITLE} · ARC PEM`, description: clampDescription(DESCRIPTION), url: '/blog' },
  twitter: { title: `${TITLE} · ARC PEM`, description: clampDescription(DESCRIPTION) },
}

export const revalidate = 3600

export default async function BlogIndexPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  const posts = await getAllPosts()
  const categories = await getCategories()
  const featured = posts.find((p) => p.featured) ?? posts[0]

  return (
    <>
      <BreadcrumbsLd trail={[{ name: 'Blog', path: '/blog' }]} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'ARC PEM Blog',
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `${base}/blog/${p.slug}`,
          })),
        }}
      />

      <JournalIndex
        posts={posts.map(toJPost)}
        categories={categories}
        featuredSlug={featured?.slug}
        tools={LIVE_TOOLS.map((t) => ({ slug: t.slug, name: t.name, short: t.short }))}
        roles={SEGMENTS.map((r) => ({ slug: r.slug, label: r.label, description: r.description }))}
      />
    </>
  )
}
