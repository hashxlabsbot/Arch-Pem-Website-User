import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { PRICING_FAQS } from '@/lib/pricing-faqs'
import PricingClient from './PricingClient'

const TITLE = 'Pricing'
const DESCRIPTION =
  'Simple, annual pricing for ARC PEM — Solo, Studio, and Enterprise plans for architecture and construction firms. No monthly fees, no hidden costs, no internet required.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
    url: '/pricing',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
}

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: PRICING_FAQS.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }}
      />
      <PricingClient />
    </>
  )
}
