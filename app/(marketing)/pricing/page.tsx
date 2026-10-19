import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import { getPublicPlans } from '@/lib/plans'
import { pricingFaqs } from '@/lib/pricing-faqs'
import { softwareJsonLd } from '@/lib/seo-entity'
import PricingClient from './PricingClient'

// Plans are managed in the admin app; rebuild the static page (and the prices
// in its HTML and JSON-LD) at least hourly.
export const revalidate = 3600

const TITLE = 'Pricing — Monthly & Annual Plans'
const DESCRIPTION =
  'ARC PEM pricing in India: one subscription per firm (Solo, Studio, Enterprise) by team seats and active projects. Pay monthly or annually by card, UPI AutoPay or e-mandate; auto-renews, cancel anytime.'

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

export default async function PricingPage() {
  const plans = await getPublicPlans()
  const base = company.siteUrl.replace(/\/$/, '')
  const faqs = pricingFaqs(plans.rules)
  return (
    <>
      <JsonLd data={softwareJsonLd(plans)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: base },
            { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${base}/pricing` },
          ],
        }}
      />
      <PricingClient initialPlans={plans} faqs={faqs} />
    </>
  )
}
