import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'ARC PEM pricing for Indian construction firms'

export default function Image() {
  return renderOgCard({ kicker: 'Pricing', title: 'ARC PEM pricing for Indian construction firms', sub: 'Plans for solo architects up to multi-site builders. Monthly or annual.', chips: ['Plans', 'Monthly or annual'], footer: 'arcpem.com/pricing' })
}
