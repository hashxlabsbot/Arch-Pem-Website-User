import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'
import { COMPARISONS } from '@/lib/aeo-pages'

export const dynamicParams = false
export const size = ogSize
export const contentType = ogContentType
export const alt = 'ARC PEM comparison'

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }))
}

export default function Image({ params }: { params: { slug: string } }) {
  const c = COMPARISONS.find((x) => x.slug === params.slug)
  return renderOgCard({
    kicker: 'Compare',
    title: c?.title ?? 'ARC PEM comparison',
    sub: c?.description.slice(0, 170),
    footer: `arcpem.com/compare/${params.slug}`,
  })
}
