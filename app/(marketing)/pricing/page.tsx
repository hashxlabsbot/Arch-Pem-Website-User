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
  'ARC PEM pricing: one subscription per firm (Starter, Studio, Business) by team seats and projects. Pay monthly or annually; cancel anytime.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
    url: '/pricing',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TITLE} · ARC PEM`,
    description: DESCRIPTION,
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
