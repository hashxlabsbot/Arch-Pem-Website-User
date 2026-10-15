import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JsonLd from '@/components/seo/JsonLd'
import JournalIndex from '@/components/blog/JournalIndex'
import { toJPost } from '@/components/blog/journal-data'
import { SEGMENTS } from '@/lib/aeo-pages'
import { LIVE_TOOLS } from '@/lib/tools'
import { getCategories, getPostsByCategory } from '@/lib/blog'
import { company } from '@/lib/company'
import { pageMetadata } from '@/lib/seo'

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const cat = (await getCategories()).find((c) => c.slug === params.category)
  const name = cat?.name ?? params.category
  const title = `${name} — ARC PEM Blog`
  const description = `Guides and worked examples in ${name} for Indian architects, builders and construction firms — ${cat?.count ?? 'several'} in-depth articles from the ARC PEM team.`
  return pageMetadata({ title, description, path: `/blog/category/${params.category}` })
}

export default async function BlogCategoryPage({ params }: { params: { category: string } }) {
  const base = company.siteUrl.replace(/\/$/, '')
  const categories = await getCategories()
  const cat = categories.find((c) => c.slug === params.category)
  if (!cat) notFound()

  const posts = await getPostsByCategory(params.category)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${base}/blog` },
            { '@type': 'ListItem', position: 3, name: cat.name, item: `${base}/blog/category/${cat.slug}` },
          ],
        }}
      />

      <JournalIndex
        mode="category"
        categoryName={cat.name}
        categorySlug={cat.slug}
        posts={posts.map(toJPost)}
        categories={categories}
        tools={LIVE_TOOLS.map((t) => ({ slug: t.slug, name: t.name, short: t.short }))}
        roles={SEGMENTS.map((r) => ({ slug: r.slug, label: r.label, description: r.description }))}
      />
    </>
  )
}
