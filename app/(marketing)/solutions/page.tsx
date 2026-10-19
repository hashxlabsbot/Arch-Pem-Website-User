import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'

const TITLE = 'BOQ, GST & Contractor Ledger Software for Architects & Builders'
const DESCRIPTION =
  'ARC PEM solutions: BOQ & budget software, vendor bill and labour expense tracking, GST purchase registers, contractor ledger management, and Tally exports — built for Indian architecture and construction firms, live for the whole team on any device.'

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
  return <SolutionsClient />
}
