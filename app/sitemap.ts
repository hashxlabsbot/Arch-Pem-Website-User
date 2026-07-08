import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'
import { LIVE_TOOLS } from '@/lib/tools'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.siteUrl.replace(/\/$/, '')
  const now = new Date()

  const paths = [
    '',            // home
    '/solutions',
    '/pricing',
    '/about',
    '/contact',
    '/resources',
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
    if (p.startsWith('/tools')) return 0.8
    return 0.6
  }

  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '' || p === '/pricing' ? 'weekly' : 'monthly',
    priority: priority(p),
  }))
}
