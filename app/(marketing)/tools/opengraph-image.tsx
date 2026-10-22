import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Free construction calculators and bill generators'

export default function Image() {
  return renderOgCard({ kicker: 'Free tools', title: 'Free construction calculators and bill generators', sub: 'Built for Indian site engineers, contractors and architects. No sign-up.', chips: ['GST bill', 'Cost per sq ft', 'Concrete', 'BBS'], footer: 'arcpem.com/tools' })
}
