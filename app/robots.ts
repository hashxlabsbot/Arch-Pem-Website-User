import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Keep authenticated and API surfaces out of search results.
      disallow: ['/dashboard', '/api', '/login', '/register', '/forgot-password', '/reset-password'],
    },
    sitemap: `${company.siteUrl}/sitemap.xml`,
  }
}
