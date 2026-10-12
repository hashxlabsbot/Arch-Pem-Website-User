import 'server-only'
import readingTime from 'reading-time'
import { db } from '@/lib/db'
import type { BlogPost } from '@prisma/client'

export type FaqItem = { q: string; a: string }
export type Howto = { name: string; description?: string; steps: { name: string; text: string }[] }
export type Author = { name: string; role?: string }

export type PostMeta = {
  slug: string
  title: string
  seoTitle?: string
  description: string
  date: string
  updatedDate?: string
  category: string
  categorySlug: string
  tags: string[]
  author?: Author
  coverImage?: string
  coverImageAlt?: string
  featured: boolean
  relatedPosts: string[]
  relatedTools: string[]
  faq?: FaqItem[]
  howto?: Howto
  readingTimeMinutes: number
  wordCount: number
}

export const DEFAULT_AUTHOR: Author = { name: 'ARC PEM Team', role: 'Hash X Labs' }

/** "GST & Compliance" -> "gst-and-compliance" — used for /blog/category/[category] URLs. */
export function slugifyCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toMeta(row: BlogPost): PostMeta {
  const stats = readingTime(row.contentMarkdown)
  const author = row.authorName ? { name: row.authorName, role: row.authorRole ?? undefined } : undefined
  return {
    slug: row.slug,
    title: row.title,
    seoTitle: row.seoTitle ?? undefined,
    description: row.description,
    date: (row.publishedAt ?? row.createdAt).toISOString(),
    updatedDate: row.updatedDate ? row.updatedDate.toISOString() : undefined,
    category: row.category,
    categorySlug: slugifyCategory(row.category),
    tags: row.tags,
    author,
    coverImage: row.coverImage ?? undefined,
    coverImageAlt: row.coverImageAlt ?? undefined,
    featured: row.featured,
    relatedPosts: row.relatedPosts,
    relatedTools: row.relatedTools,
    faq: Array.isArray(row.faq) ? (row.faq as unknown as FaqItem[]) : undefined,
    howto: row.howto && typeof row.howto === 'object' && !Array.isArray(row.howto) ? (row.howto as unknown as Howto) : undefined,
    readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
    wordCount: stats.words,
  }
}

const PUBLISHED = { status: 'PUBLISHED' as const }

/** All published post slugs — feeds generateStaticParams. */
export async function getAllPostSlugs(): Promise<string[]> {
  const rows = await db.blogPost.findMany({ where: PUBLISHED, select: { slug: true } })
  return rows.map((r) => r.slug)
}

/** All published posts, newest first. */
export async function getAllPosts(): Promise<PostMeta[]> {
  const rows = await db.blogPost.findMany({
    where: PUBLISHED,
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  })
  return rows.map(toMeta)
}

/** A single published post's metadata + raw markdown body, or null if not found/unpublished. */
export async function getPostBySlug(slug: string): Promise<{ meta: PostMeta; content: string } | null> {
  const row = await db.blogPost.findFirst({ where: { slug, ...PUBLISHED } })
  if (!row) return null
  return { meta: toMeta(row), content: row.contentMarkdown }
}

/** Any post by id regardless of status — for the token-gated admin editor preview only. */
export async function getPostByIdForPreview(id: string): Promise<{ meta: PostMeta; content: string } | null> {
  const row = await db.blogPost.findUnique({ where: { id } })
  if (!row) return null
  return { meta: toMeta(row), content: row.contentMarkdown }
}

/** Explicit relatedPosts first (in order), then same-category fill-in, excluding itself. */
export async function getRelatedPosts(slug: string, limit = 3): Promise<PostMeta[]> {
  const all = await getAllPosts()
  const current = all.find((p) => p.slug === slug)
  if (!current) return []

  const explicit = current.relatedPosts
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is PostMeta => Boolean(p))

  const fallback = all.filter(
    (p) => p.slug !== slug && p.category === current.category && !explicit.some((e) => e.slug === p.slug),
  )

  return [...explicit, ...fallback].slice(0, limit)
}

export type CategorySummary = { name: string; slug: string; count: number }

/** Distinct categories (of published posts) with counts, ordered by count desc then name. */
export async function getCategories(): Promise<CategorySummary[]> {
  const grouped = await db.blogPost.groupBy({
    by: ['category'],
    where: PUBLISHED,
    _count: { _all: true },
  })
  return grouped
    .map((g) => ({ name: g.category, slug: slugifyCategory(g.category), count: g._count._all }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export async function getPostsByCategory(categorySlug: string): Promise<PostMeta[]> {
  return (await getAllPosts()).filter((p) => p.categorySlug === categorySlug)
}
