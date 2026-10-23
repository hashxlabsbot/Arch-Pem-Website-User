import { renderOgCard, ogSize, ogContentType } from '@/components/seo/ogCard'
import { getCategories } from '@/lib/blog'

export const size = ogSize
export const contentType = ogContentType
export const alt = 'ARC PEM Blog category'

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ category: c.slug }))
}

export default async function Image({ params }: { params: { category: string } }) {
  const cat = (await getCategories()).find((c) => c.slug === params.category)
  return renderOgCard({
    kicker: 'Blog',
    title: cat?.name ?? 'ARC PEM Blog',
    sub: 'Guides and worked examples for Indian architects, builders and construction firms.',
    footer: `arcpem.com/blog/category/${params.category}`,
  })
}
