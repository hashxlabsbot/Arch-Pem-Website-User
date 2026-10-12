import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'

// Keep authenticated and API surfaces out of search results.
const PRIVATE = ['/dashboard', '/api', '/login', '/register', '/forgot-password', '/reset-password']

// AI assistants' search and training crawlers. '*' already allows them, but a
// named group is an explicit opt-in some providers look for. A named group
// replaces '*' for that bot, so it must repeat the private paths.
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'Bingbot',
  'CCBot', 'Meta-ExternalAgent', 'Amazonbot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE },
      { userAgent: '*', allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${company.siteUrl}/sitemap.xml`,
  }
}
