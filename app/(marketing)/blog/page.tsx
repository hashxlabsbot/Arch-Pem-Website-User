import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import JsonLd from '@/components/seo/JsonLd'
import PostCard from '@/components/blog/PostCard'
import PostMetaRow from '@/components/blog/PostMeta'
import BrandedCover from '@/components/blog/BrandedCover'
import CategoryNav from '@/components/blog/CategoryNav'
import { getAllPosts, getCategories } from '@/lib/blog'
import { company } from '@/lib/company'

const TITLE = 'Blog — BOQ, GST & Contractor Billing Guides'
const DESCRIPTION =
  'Practical, worked-example guides on GST compliance, BOQ estimation, contractor billing and vendor management for Indian architects, builders and construction firms.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/blog' },
  openGraph: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION, url: '/blog' },
  twitter: { title: `${TITLE} · ARC PEM`, description: DESCRIPTION },
}

export const revalidate = 3600

export default async function BlogIndexPage() {
  const base = company.siteUrl.replace(/\/$/, '')
  const posts = await getAllPosts()
  const categories = await getCategories()
  const featured = posts.find((p) => p.featured) ?? posts[0]
  const rest = posts.filter((p) => p.slug !== featured?.slug)

  return (
    <>
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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="blog-hero fade-up in">
            <span className="badge badge-indigo">The ARC PEM Blog</span>
            <h1>Field notes on BOQ, GST and contractor billing</h1>
            <p>
              Worked examples and practical guides for Indian architects, builders and contractors —
              the same rigour as our free tools, in article form.
            </p>
          </div>

          <CategoryNav categories={categories} />

          {featured && (
            <Link href={`/blog/${featured.slug}`} className="featured-post fade-up in">
              <div className="featured-post-media">
                {featured.coverImage ? (
                  <Image src={featured.coverImage} alt={featured.coverImageAlt || featured.title} fill priority sizes="50vw" />
                ) : (
                  <BrandedCover categorySlug={featured.categorySlug} category={featured.category} />
                )}
              </div>
              <div className="featured-post-body">
                <span className="featured-tag">Featured</span>
                <h2>{featured.title}</h2>
                <p>{featured.description}</p>
                <PostMetaRow post={featured} />
              </div>
            </Link>
          )}

          <div className="post-grid">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
