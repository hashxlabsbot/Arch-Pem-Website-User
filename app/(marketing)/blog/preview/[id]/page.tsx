import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/blog/ArticleView'
import { getPostByIdForPreview, getPostsByCategory } from '@/lib/blog'
import { verifyPreviewToken } from '@/lib/preview-token'

// Always live from the DB (shows the latest saved draft), never cached, never indexed.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default async function BlogPreviewPage(
  props: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ token?: string }>
  }
) {
  const searchParams = await props.searchParams
  const params = await props.params
  if (!verifyPreviewToken(params.id, searchParams.token)) notFound()

  const post = await getPostByIdForPreview(params.id)
  if (!post) notFound()

  // Best-effort related posts (published, same category) so the preview matches the real layout.
  const related = (await getPostsByCategory(post.meta.categorySlug))
    .filter((p) => p.slug !== post.meta.slug)
    .slice(0, 3)

  return <ArticleView meta={post.meta} content={post.content} relatedPosts={related} preview />
}
