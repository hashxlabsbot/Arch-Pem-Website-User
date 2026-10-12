import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'
import { LIVE_TOOLS } from '@/lib/tools'
import { SEGMENTS, COMPARISONS } from '@/lib/aeo-pages'
import { getAllPosts, getCategories } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = company.siteUrl.replace(/\/$/, '')
  const now = new Date()

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
    '/tools',
    ...LIVE_TOOLS.map((t) => `/tools/${t.slug}`),
    '/blog',
    '/terms',
    '/privacy',
    '/refund',
    '/shipping',
  ]

  const priority = (p: string) => {
    if (p === '') return 1
    if (p === '/pricing') return 0.9
    if (p.startsWith('/tools') || p === '/blog') return 0.8
    return 0.6
  }

  const staticEntries: MetadataRoute.Sitemap = paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '' || p === '/pricing' ? 'weekly' : 'monthly',
    priority: priority(p),
  }))

  // Blog posts and category archives carry their own real dates — content
  // freshness is a signal worth being accurate about, unlike the static
  // marketing pages above which don't meaningfully change week to week.
  const posts = await getAllPosts()
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.updatedDate ?? p.date),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const categoryEntries: MetadataRoute.Sitemap = (await getCategories()).map((c) => ({
    url: `${base}/blog/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticEntries, ...postEntries, ...categoryEntries]
}
