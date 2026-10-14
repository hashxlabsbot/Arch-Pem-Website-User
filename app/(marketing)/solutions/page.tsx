import type { Metadata } from 'next'
import SolutionsClient from './SolutionsClient'
import { pageMetadata } from '@/lib/seo'
import BreadcrumbsLd from '@/components/seo/Breadcrumbs'

const TITLE = 'BOQ, GST & Contractor Ledger Software for Architects & Builders'
const DESCRIPTION =
  'ARC PEM solutions: BOQ & budget software, vendor bill and labour expense tracking, GST purchase registers, contractor ledger management, and Tally exports — built for Indian architecture and construction firms, fully offline.'

export const metadata: Metadata = pageMetadata({
  title: 'ARC PEM Solutions — BOQ, GST & Contractor Ledger Software',
  description: DESCRIPTION,
  path: '/solutions',
})

export default function SolutionsPage() {
  return (
    <>
      <BreadcrumbsLd trail={[{ name: 'Solutions', path: '/solutions' }]} />
      <SolutionsClient />
    </>
  )
}
