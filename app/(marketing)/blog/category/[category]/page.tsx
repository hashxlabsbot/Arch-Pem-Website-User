import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import PostCard from '@/components/blog/PostCard'
import CategoryNav from '@/components/blog/CategoryNav'
import { getCategories, getPostsByCategory } from '@/lib/blog'
import { company } from '@/lib/company'

export const revalidate = 3600

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }))
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const params = await props.params
  const cat = (await getCategories()).find((c) => c.slug === params.category)
  const name = cat?.name ?? params.category
  const title = `${name} — ARC PEM Blog`
  const description = `Guides and worked examples in ${name} for Indian architects, builders and construction firms.`
  return {
    title,
    description,
    alternates: { canonical: `/blog/category/${params.category}` },
    openGraph: { title, description, url: `/blog/category/${params.category}` },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function BlogCategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params
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
            { '@type': 'ListItem', position: 1, name: 'Blog', item: `${base}/blog` },
            { '@type': 'ListItem', position: 2, name: cat.name, item: `${base}/blog/category/${cat.slug}` },
          ],
        }}
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="category-hero fade-up in">
            <div className="post-crumb">
              <Link href="/blog">Blog</Link> / {cat.name}
            </div>
            <span className="badge badge-indigo">Category</span>
            <h1>{cat.name}</h1>
            <p>{posts.length} article{posts.length === 1 ? '' : 's'} in this category.</p>
          </div>

          <CategoryNav categories={categories} activeSlug={cat.slug} />

          <div className="post-grid" style={{ marginTop: 40 }}>
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
