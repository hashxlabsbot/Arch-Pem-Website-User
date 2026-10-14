import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { PRICING_FAQS } from '@/lib/pricing-faqs'
import PricingClient from './PricingClient'
import { pageMetadata } from '@/lib/seo'
import BreadcrumbsLd from '@/components/seo/Breadcrumbs'

const TITLE = 'Pricing'
const DESCRIPTION =
  'Simple, annual pricing for ARC PEM — Solo, Studio, and Enterprise plans for architecture and construction firms. No monthly fees, no hidden costs, no internet required.'

export const metadata: Metadata = pageMetadata({
  title: 'ARC PEM Pricing — Annual Licence for Architects & Builders',
  description: DESCRIPTION,
  path: '/pricing',
})

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
      <BreadcrumbsLd trail={[{ name: 'Pricing', path: '/pricing' }]} />
      <PricingClient />
    </>
  )
}
