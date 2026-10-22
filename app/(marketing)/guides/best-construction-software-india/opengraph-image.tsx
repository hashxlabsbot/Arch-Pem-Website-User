import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Best construction software in India: how to choose'

export default function Image() {
  return renderOgCard({ kicker: 'Buyer’s guide', title: 'Best construction software in India: how to choose', sub: 'Cloud suites, accounting software and Excel compared for Indian firms.', chips: ['Buyer’s guide', '2026'], footer: 'arcpem.com/guides/best-construction-software-india' })
}
