import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'

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
    '/terms',
    '/privacy',
    '/refund',
    '/shipping',
  ]

  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '' || p === '/pricing' ? 'weekly' : 'monthly',
    priority: p === '' ? 1 : p === '/pricing' ? 0.9 : 0.6,
  }))
}
