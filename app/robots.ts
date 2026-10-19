import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'

// Keep authenticated and API surfaces out of search results.
const PRIVATE = ['/dashboard', '/api', '/login', '/register', '/forgot-password', '/reset-password', '/blog/preview']

// AI assistants' search, answer and training crawlers. '*' already allows
// them, but a named group is an explicit opt-in some providers look for. A
// named group replaces '*' for that bot, so it must repeat the private paths.
const AI_CRAWLERS = [
  // OpenAI (ChatGPT search, browsing, training)
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  // Anthropic (Claude)
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  // Perplexity
  'PerplexityBot', 'Perplexity-User',
  // Google Gemini / AI Overviews training opt-in, Apple Intelligence, Bing / Copilot
  'Google-Extended', 'Applebot', 'Applebot-Extended', 'Bingbot',
  // Other assistants and answer engines
  'DuckAssistBot', 'MistralAI-User', 'YouBot', 'cohere-ai', 'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'Amazonbot',
  // Common Crawl feeds many open models
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: '/', disallow: PRIVATE },
      { userAgent: '*', allow: '/', disallow: PRIVATE },
    ],
    sitemap: `${company.siteUrl}/sitemap.xml`,
    host: company.siteUrl,
  }
}
