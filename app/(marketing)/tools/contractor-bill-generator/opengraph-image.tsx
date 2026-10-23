import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'GST Contractor Bill Generator'

export default function Image() {
  return renderOgCard({ kicker: 'Free tool', title: 'GST Contractor Bill Generator', sub: 'Make a GST-compliant bill or tax invoice and print it as PDF.', chips: ['Free', 'No sign-up'], footer: 'arcpem.com/tools/contractor-bill-generator' })
}
