import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import { getPublicPlans } from '@/lib/plans'
import { homeFaqs, softwareJsonLd } from '@/lib/seo-entity'
import HomeClient from './HomeClient'
import './home.css'

// The SoftwareApplication offers and the pricing FAQ answer carry live plan prices.
export const revalidate = 3600

const TITLE = 'ARC PEM — Construction Expense Management Software · India'
const DESCRIPTION =
  'Cloud construction expense management for Indian architects, contractors and builders: BOQ & budgets, vendor bills, labour, payment approvals, GST, GSTR-2B and Tally export on one live ledger for the whole firm. Monthly or annual plans.'

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

export default async function HomePage() {
  const plans = await getPublicPlans()
  const faqs = homeFaqs(plans)
  return (
    <>
      <JsonLd data={softwareJsonLd(plans)} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }}
      />
      <HomeClient plans={plans.WEB} faqs={faqs} rules={plans.rules} />
    </>
  )
}
