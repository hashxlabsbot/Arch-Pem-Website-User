import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, webPageJsonLd, type Crumb } from '@/lib/seo'
import { CONTENT_UPDATED } from '@/lib/seo-entity'

/**
 * The structured data every marketing page should carry: a typed WebPage node (About, Contact, Collection…) tied to
 * the site-wide Organization, plus its breadcrumb trail. Pages with richer schema (FAQ, HowTo, Article) add theirs
 * next to this.
 */
export default function PageSchema({
  type,
  path,
  name,
  description,
  trail,
}: {
  type?: Parameters<typeof webPageJsonLd>[0]['type']
  path: string
  name: string
  description: string
  trail: Crumb[]
}) {
  return (
    <>
      <JsonLd data={webPageJsonLd({ type, path, name, description, dateModified: CONTENT_UPDATED })} />
      <JsonLd data={breadcrumbJsonLd(trail)} />
    </>
  )
}
