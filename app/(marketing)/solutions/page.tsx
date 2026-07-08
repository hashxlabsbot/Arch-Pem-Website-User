import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'

const TITLE = 'BOQ, GST & Contractor Ledger Software for Architects & Builders'
const DESCRIPTION =
  'ARC PEM solutions: BOQ & budget software, vendor bill and labour expense tracking, GST purchase registers, contractor ledger management, and Tally exports — built for Indian architecture and construction firms, fully offline.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/solutions' },
  openGraph: {
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
    url: '/solutions',
  },
  twitter: {
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
  },
}

export default function SolutionsPage() {
  return <SolutionsClient />
}
