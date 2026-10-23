import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Construction Cost Calculator'

export default function Image() {
  return renderOgCard({ kicker: 'Free tool', title: 'Construction Cost Calculator', sub: 'Per sq ft cost by quality and city, with a full breakdown.', chips: ['Free', 'India rates'], footer: 'arcpem.com/tools/construction-cost-calculator' })
}
