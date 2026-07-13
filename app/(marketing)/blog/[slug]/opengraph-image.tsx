import { getAllPostSlugs, getPostBySlug } from '@/lib/blog'
import { getCategoryStyle } from '@/components/blog/categoryStyle'
import { renderBlogOgImage, ogImageSize, ogContentType } from '../_og'

export const size = ogImageSize
export const contentType = ogContentType

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }))
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)
  const title = post?.meta.title ?? 'ARC PEM Blog'
  const category = post?.meta.category ?? 'ARC PEM Blog'
  const { color } = getCategoryStyle(post?.meta.categorySlug ?? '')
  return renderBlogOgImage({ title, category, accent: color })
}
