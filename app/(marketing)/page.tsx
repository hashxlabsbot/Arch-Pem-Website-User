import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import HomeClient from './HomeClient'

const TITLE = 'ARC PEM — Construction Expense Management Software · India'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour, GST and Tally exports into one offline platform built for Indian architects and construction firms.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
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
