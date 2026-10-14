import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import { entity, featureList, ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import HomeClient from './HomeClient'
import { RSS_ALTERNATE } from '@/lib/seo'

const TITLE = 'ARC PEM — Construction Expense Management Software · India'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour, GST and Tally exports into one offline platform built for Indian architects and construction firms.'

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/', types: RSS_ALTERNATE },
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
          '@id': SOFTWARE_ID,
          name: company.brand,
          applicationCategory: 'BusinessApplication',
          applicationSubCategory: entity.category,
          operatingSystem: 'Windows, macOS',
          softwareVersion: company.product.version,
          description: entity.definition,
          url: company.siteUrl,
          image: `${company.siteUrl}/og-image.jpg`,
          featureList,
          audience: { '@type': 'BusinessAudience', audienceType: entity.audience.join(', ') },
          areaServed: { '@type': 'Country', name: 'India' },
          publisher: { '@id': ORG_ID },
        }}
      />
      <HomeClient />
    </>
  )
}
