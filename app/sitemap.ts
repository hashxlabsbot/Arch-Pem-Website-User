import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'
import { LIVE_TOOLS } from '@/lib/tools'
import { SEGMENTS, COMPARISONS } from '@/lib/aeo-pages'
import { GLOSSARY } from '@/lib/glossary'
import { CONTENT_UPDATED } from '@/lib/seo-entity'
import { getAllPosts, type PostMeta } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = company.siteUrl.replace(/\/$/, '')
  // Marketing pages change when their copy does, not on every request; a
  // lastModified that is always "now" teaches crawlers to ignore the field.
  const contentUpdated = new Date(CONTENT_UPDATED)

  const paths = [
    '',            // home
    '/solutions',
    '/pricing',
    '/about',
    '/contact',
    '/resources',
    '/guides/best-construction-software-india',
    ...SEGMENTS.map((s) => `/for/${s.slug}`),
    ...COMPARISONS.map((c) => `/compare/${c.slug}`),
    '/glossary',
    ...GLOSSARY.map((t) => `/glossary/${t.slug}`),
    '/tools',
    ...LIVE_TOOLS.map((t) => `/tools/${t.slug}`),
    '/terms',
    '/privacy',
    '/refund',
    '/shipping',
  ]

  const priority = (p: string) => {
    if (p === '') return 1
    if (p === '/pricing') return 0.9
    if (p.startsWith('/tools') || p.startsWith('/compare') || p.startsWith('/for/') || p.startsWith('/guides')) return 0.8
    if (p.startsWith('/glossary')) return 0.7
    return 0.6
  }

  const staticEntries: MetadataRoute.Sitemap = paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: contentUpdated,
    changeFrequency: p === '' || p === '/pricing' ? 'weekly' : 'monthly',
    priority: priority(p),
  }))

  // Blog posts and category archives carry their own real dates — content
  // freshness is a signal worth being accurate about.
  let posts: PostMeta[] = []
  try {
    posts = await getAllPosts()
  } catch {
    // Blog DB unreachable — still serve the marketing pages.
  }
  const postDate = (p: PostMeta) => new Date(p.updatedDate ?? p.date)

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: postDate(p),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const newest = (list: PostMeta[]) =>
    list.length ? new Date(Math.max(...list.map((p) => postDate(p).getTime()))) : contentUpdated

  const blogIndex: MetadataRoute.Sitemap = [
    { url: `${base}/blog`, lastModified: newest(posts), changeFrequency: 'weekly', priority: 0.8 },
  ]

  const byCategory = new Map<string, PostMeta[]>()
  for (const p of posts) byCategory.set(p.categorySlug, [...(byCategory.get(p.categorySlug) ?? []), p])
  const categoryEntries: MetadataRoute.Sitemap = Array.from(byCategory, ([slug, list]) => ({
    url: `${base}/blog/category/${slug}`,
    lastModified: newest(list),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticEntries, ...blogIndex, ...postEntries, ...categoryEntries]
}
