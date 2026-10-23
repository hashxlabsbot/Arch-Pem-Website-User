import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'
import { GLOSSARY, glossaryTerm } from '@/lib/glossary'

export const dynamicParams = false
export const size = ogSize
export const contentType = ogContentType
export const alt = 'ARC PEM construction finance glossary'

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }))
}

export default function Image({ params }: { params: { term: string } }) {
  const t = glossaryTerm(params.term)
  return renderOgCard({
    kicker: 'Glossary',
    title: t?.question ?? 'Construction finance glossary',
    sub: t ? t.definition.split(/(?<=\.)\s/)[0].slice(0, 170) : undefined,
    footer: `arcpem.com/glossary/${params.term}`,
  })
}
