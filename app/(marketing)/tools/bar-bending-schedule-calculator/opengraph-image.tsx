import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Bar Bending Schedule Calculator'

export default function Image() {
  return renderOgCard({ kicker: 'Free tool', title: 'Bar Bending Schedule Calculator', sub: 'Cutting lengths, bar counts and steel weight in seconds.', chips: ['BBS', 'Free'], footer: 'arcpem.com/tools/bar-bending-schedule-calculator' })
}
