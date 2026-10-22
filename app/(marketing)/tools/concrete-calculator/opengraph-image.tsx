import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Concrete Calculator'

export default function Image() {
  return renderOgCard({ kicker: 'Free tool', title: 'Concrete Calculator', sub: 'Cement, sand, aggregate and water for any slab, beam or column.', chips: ['M10–M25', 'Free'], footer: 'arcpem.com/tools/concrete-calculator' })
}
