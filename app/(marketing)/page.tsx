import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import HomeClient from './HomeClient'

const TITLE = 'ARC PEM — Project Expense Management Software for Indian Construction Firms'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour tracking, contractor ledgers, GST, and Tally exports into one offline desktop platform built for Indian architects, builders, and construction firms.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: company.brand,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Windows',
          description: DESCRIPTION,
          url: company.siteUrl,
          publisher: {
            '@type': 'Organization',
            name: company.legalName,
          },
        }}
      />
      <HomeClient />
    </>
  )
}
