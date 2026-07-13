import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/blog/ArticleView'
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog'

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
  return {
    title,
    description: meta.description,
    alternates: { canonical: `/blog/${meta.slug}` },
    openGraph: { title, description: meta.description, url: `/blog/${meta.slug}`, type: 'article', publishedTime: meta.date, modifiedTime: meta.updatedDate ?? meta.date },
    twitter: { title, description: meta.description },
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post.meta.slug, 3)
  return <ArticleView meta={post.meta} content={post.content} relatedPosts={relatedPosts} />
}
