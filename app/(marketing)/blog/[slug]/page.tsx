import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/blog/ArticleView'
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'
import { clampDescription, fitTitle, shortenTitle, socialTitle, SITE_NAME, RSS_ALTERNATE } from '@/lib/seo'

// Instant publish from the admin (via /api/revalidate) keeps these fresh; the
// hourly revalidate is a safety net, and dynamicParams (default) lets a brand-new
// post render on first request even if it wasn't in the last build.
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return {}
  const { meta } = post
  const title = meta.seoTitle ?? meta.title
  const description = clampDescription(meta.description)
  const url = `/blog/${meta.slug}`
  const social = socialTitle(shortenTitle(title))
  // No explicit og:image here: the opengraph-image.tsx file convention supplies
  // it, and its route carries a build hash that can't be hard-coded.
  return {
    title: fitTitle(title),
    description,
    alternates: { canonical: url, types: RSS_ALTERNATE },
    keywords: meta.tags?.length ? meta.tags : undefined,
    authors: meta.author ? [{ name: meta.author.name }] : [{ name: SITE_NAME }],
    openGraph: {
      type: 'article',
      title: social,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'en_IN',
      publishedTime: meta.date,
      modifiedTime: meta.updatedDate ?? meta.date,
      section: meta.category,
      tags: meta.tags?.length ? meta.tags : undefined,
    },
    twitter: { card: 'summary_large_image', title: social, description },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.meta.slug, 3)
  return <ArticleView meta={post.meta} content={post.content} relatedPosts={relatedPosts} />
}
