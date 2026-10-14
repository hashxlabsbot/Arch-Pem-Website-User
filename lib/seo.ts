import type { Metadata } from 'next'
import { company } from '@/lib/company'

export const SITE_NAME = 'ARC PEM'
const SUFFIX = ` · ${SITE_NAME}`

/** Google shows roughly 580px of a title (~60 characters) and ~155 of a description. */
export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 160

/** Feed autodiscovery. Metadata `alternates` merges shallowly, so any page that
 *  sets its own canonical must spread this in or the feed link is dropped. */
export const RSS_ALTERNATE = {
  'application/rss+xml': [{ url: '/blog/rss.xml', title: 'ARC PEM Blog' }],
}

export const OG_IMAGE = {
  url: '/og-image.jpg',
  width: 1200,
  height: 630,
  alt: 'ARC PEM — construction expense management software for Indian architects and builders',
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  const base = company.siteUrl.replace(/\/$/, '')
  return path === '/' || path === '' ? base : `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Trim to `max` characters on a word boundary, ending with an ellipsis, so a
 * long CMS-authored description never gets cut mid-word in search results.
 */
export function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–—-]+$/, '')}…`
}

export const clampDescription = (text: string) => clamp(text, DESCRIPTION_MAX)

/**
 * Shorten a long title at its last natural break (": ", " — ", " – ", " | ",
 * " - ") that still fits, so the keywords at the front survive instead of the
 * search engine truncating mid-phrase. Returns the title unchanged when there is
 * no clean break — a CMS author can set an explicit `seoTitle` for those.
 */
export function shortenTitle(title: string, max = TITLE_MAX): string {
  if (title.length <= max) return title
  let best = -1
  const breaks = /\?\s|:\s|\s[—–|-]\s/g
  let m: RegExpExecArray | null
  while ((m = breaks.exec(title))) {
    const head = title.slice(0, m.index)
    const balanced = (head.match(/\(/g) ?? []).length === (head.match(/\)/g) ?? []).length
    // A "?" belongs to the shortened title; ":" and dashes do not.
    const end = m[0].startsWith('?') ? m.index + 1 : m.index
    if (end >= 18 && end <= max && balanced) best = end
  }
  return best === -1 ? title : title.slice(0, best).trim()
}

/**
 * Title for the `<title>` tag. The root template appends " · ARC PEM", but when
 * that would push the title past the display limit we drop the suffix instead
 * of letting the search engine truncate the keywords that matter.
 */
export function fitTitle(rawTitle: string): Metadata['title'] {
  const title = shortenTitle(rawTitle)
  if (title.includes(SITE_NAME)) return { absolute: title }
  return title.length + SUFFIX.length <= TITLE_MAX ? title : { absolute: title }
}

/** Plain-string title used in og:title / twitter:title (never truncated by the template). */
export function socialTitle(title: string): string {
  return title.includes(SITE_NAME) || title.length + SUFFIX.length > TITLE_MAX ? title : `${title}${SUFFIX}`
}

type PageMetaInput = {
  /** Title WITHOUT the brand suffix. Include "ARC PEM" yourself if you want it inside the title. */
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}

/**
 * One call that produces consistent title, description, canonical, Open Graph
 * and Twitter metadata — keeps every marketing page in lockstep.
 */
export function pageMetadata({ title, description, path, type = 'website' }: PageMetaInput): Metadata {
  const desc = clampDescription(description)
  const social = socialTitle(title)
  return {
    title: fitTitle(title),
    description: desc,
    alternates: { canonical: path, types: RSS_ALTERNATE },
    openGraph: { type, title: social, description: desc, url: path, siteName: SITE_NAME, locale: 'en_IN', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: social, description: desc, images: [OG_IMAGE.url] },
  }
}

/** Metadata for pages that must never appear in search (auth, checkout, drafts). */
export function noIndexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: { index: false, follow: false },
  }
}

export type Crumb = { name: string; path: string }

/** schema.org BreadcrumbList for a trail that starts at Home. */
export function breadcrumbLd(trail: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}
