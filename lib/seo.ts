import { company } from '@/lib/company'
import { ORG_ID } from '@/lib/seo-entity'

/** Site origin without a trailing slash. */
export const siteBase = () => company.siteUrl.replace(/\/$/, '')

/** '/pricing' → 'https://arcpem.com/pricing'. Absolute URLs pass through. */
export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${siteBase()}${path === '/' ? '' : path}`)

export type Crumb = { name: string; path: string }

/** BreadcrumbList for a page; the first crumb is always Home. */
export function breadcrumbJsonLd(trail: Crumb[]) {
  const items = [{ name: 'Home', path: '/' }, ...trail]
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  }
}

type PageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'FAQPage' | 'ProfilePage'

/**
 * A typed WebPage node tied to the site-wide Organization, so each page states what it is, who published it and
 * when it was last updated. `about` links the page to the entity it describes (usually the organisation).
 */
export function webPageJsonLd(opts: {
  type?: PageType
  path: string
  name: string
  description: string
  dateModified: string
  /** What the page is about; defaults to the organisation. */
  aboutId?: string
}) {
  const url = absoluteUrl(opts.path)
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: opts.name,
    description: opts.description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': `${siteBase()}/#website` },
    about: { '@id': opts.aboutId ?? ORG_ID },
    publisher: { '@id': ORG_ID },
    dateModified: opts.dateModified,
  }
}

/**
 * Title and description that fit Google's display limits (about 60 and 155–160 characters). Longer text is cut at a
 * word boundary, so a snippet never ends mid-word.
 */
export function fit(text: string, max: number) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:–—-]+$/, '')}…`
}
