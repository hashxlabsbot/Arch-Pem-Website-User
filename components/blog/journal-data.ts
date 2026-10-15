import type { PostMeta } from '@/lib/blog'

/** Plain, serialisable shape handed from the server pages to the client journal UI. */
export type JPost = {
  slug: string
  title: string
  description: string
  date: string
  category: string
  categorySlug: string
  tags: string[]
  coverImage?: string
  coverImageAlt?: string
  minutes: number
  author: string
  featured: boolean
}

export type JCategory = { name: string; slug: string; count: number }
export type JTool = { slug: string; name: string; short: string }
export type JRole = { slug: string; label: string; description: string }

export function toJPost(p: PostMeta): JPost {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    date: p.date,
    category: p.category,
    categorySlug: p.categorySlug,
    tags: p.tags,
    coverImage: p.coverImage,
    coverImageAlt: p.coverImageAlt,
    minutes: p.readingTimeMinutes,
    author: p.author?.name ?? 'ARC PEM Team',
    featured: p.featured,
  }
}
