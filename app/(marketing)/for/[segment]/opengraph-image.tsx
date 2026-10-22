import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'
import { SEGMENTS } from '@/lib/aeo-pages'

export const dynamicParams = false
export const size = ogSize
export const contentType = ogContentType
export const alt = 'ARC PEM for Indian construction professionals'

export function generateStaticParams() {
  return SEGMENTS.map((s) => ({ segment: s.slug }))
}

export default function Image({ params }: { params: { segment: string } }) {
  const s = SEGMENTS.find((x) => x.slug === params.segment)
  return renderOgCard({
    kicker: s ? `For ${s.label.toLowerCase()}` : 'ARC PEM',
    title: s?.h1 ?? 'Construction expense software for India',
    sub: 'BOQ budgets, vendor bills, labour and GST, with Tally export.',
    chips: ['BOQ', 'GST', 'Tally export'],
    footer: `arcpem.com/for/${params.segment}`,
  })
}
