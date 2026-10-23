import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'Construction finance glossary for India'

export default function Image() {
  return renderOgCard({ kicker: 'Glossary', title: 'Construction finance glossary for India', sub: 'BOQ, RA bill, GSTR-2B, retention money and more, explained plainly.', chips: ['BOQ', 'RA bill', 'GSTR-2B', 'Retention'], footer: 'arcpem.com/glossary' })
}
