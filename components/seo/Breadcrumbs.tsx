import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, type Crumb } from '@/lib/seo'

/** Emits BreadcrumbList structured data for a page (trail starts at Home). */
export default function BreadcrumbsLd({ trail }: { trail: Crumb[] }) {
  return <JsonLd data={breadcrumbLd(trail)} />
}
