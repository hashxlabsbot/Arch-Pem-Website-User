import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'

const TITLE = 'Solutions'
const DESCRIPTION =
  'Explore ARC PEM features: BOQ & budget management, vendor and labour expense tracking, GST purchase registers, Tally exports, and multi-user security — built for Indian construction firms.'

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
