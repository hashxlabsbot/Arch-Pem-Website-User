import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'
import PageSchema from '@/components/seo/PageSchema'

const TITLE = 'BOQ, GST & Contractor Ledger Software for Architects & Builders'
const DESCRIPTION =
  'BOQ budgets, vendor and labour tracking, GST registers and Tally export for Indian architecture and construction firms, live for the whole team.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/solutions' },
  openGraph: {
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
    url: '/solutions',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

export default function SolutionsPage() {
  return (
    <>
      <PageSchema type="CollectionPage" path="/solutions" name={TITLE} description={DESCRIPTION} trail={[{ name: 'Solutions', path: '/solutions' }]} />
      <SolutionsClient />
    </>
  )
}
