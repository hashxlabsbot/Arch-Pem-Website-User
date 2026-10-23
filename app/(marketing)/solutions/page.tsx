import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'
import PageSchema from '@/components/seo/PageSchema'

const TITLE = 'Construction Expense Software Features: BOQ, GST & TDS'
const DESCRIPTION =
  'BOQ budgets, vendor, labour and contractor ledgers, payment approvals, GST with GSTR-2B, TDS and Tally export for Indian construction firms, on any device.'

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
