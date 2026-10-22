import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import SessionProvider from '@/components/SessionProvider'
import CookieBanner from '@/components/CookieBanner'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import { entity, ORG_ID, SOFTWARE_ID } from '@/lib/seo-entity'
import { env } from '@/lib/env'
import './landing.css'
import './site-v2.css'
import './globals.css'

// Self-hosted by next/font at build time: no render-blocking request to Google Fonts, no layout shift from a late
// font swap, and the CSS keeps using these through var(--font-display) / var(--font-body).
const display = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], display: 'swap', variable: '--font-display' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'], display: 'swap', variable: '--font-body' })

const TITLE = 'ARC PEM — Construction Expense Management Software'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour, GST and Tally exports for Indian architects and construction firms — one live ledger for the whole firm, on any phone or computer.'

const verificationOther: Record<string, string> = {}
if (env.bingSiteVerification()) verificationOther['msvalidate.01'] = env.bingSiteVerification()!

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: TITLE,
    template: '%s · ARC PEM',
  },
  description: DESCRIPTION,
  applicationName: 'ARC PEM',
  publisher: company.legalName,
  alternates: {
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: 'ARC PEM Blog' }] },
  },
  // No og:url here: a page without its own openGraph would otherwise inherit the home URL.
  openGraph: {
    type: 'website',
    siteName: 'ARC PEM',
    locale: 'en_IN',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/arc-icon.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/arc-icon.png',
  },
  verification: {
    ...(env.googleSiteVerification() ? { google: env.googleSiteVerification() } : {}),
    ...(env.yandexSiteVerification() ? { yandex: env.yandexSiteVerification() } : {}),
    ...(Object.keys(verificationOther).length ? { other: verificationOther } : {}),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The publisher's own company site is the same organisation, which helps search engines join the two up.
  const sameAs = [...Object.values(company.socials), company.parentSite].filter(Boolean)
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <head>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': ORG_ID,
                name: company.legalName,
                legalName: company.legalName,
                url: company.siteUrl,
                logo: { '@type': 'ImageObject', url: `${company.siteUrl}/arc-icon.png`, width: 256, height: 256 },
                brand: { '@type': 'Brand', name: company.brand, logo: `${company.siteUrl}/arc-icon.png` },
                email: company.supportEmail,
                telephone: company.phone,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: [company.address.line1, company.address.line2].filter(Boolean).join(', '),
                  addressLocality: company.address.city,
                  addressRegion: company.address.state,
                  postalCode: company.address.pincode,
                  addressCountry: 'IN',
                },
                contactPoint: [
                  {
                    '@type': 'ContactPoint',
                    contactType: 'sales',
                    email: company.salesEmail,
                    telephone: company.phone,
                    areaServed: 'IN',
                    availableLanguage: ['en'],
                    hoursAvailable: {
                      '@type': 'OpeningHoursSpecification',
                      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                      opens: '10:00',
                      closes: '18:00',
                    },
                  },
                  {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: company.supportEmail,
                    telephone: company.phone,
                    areaServed: 'IN',
                    availableLanguage: ['en'],
                  },
                ],
                knowsAbout: entity.knowsAbout,
                makesOffer: { '@type': 'Offer', itemOffered: { '@id': SOFTWARE_ID } },
                ...(sameAs.length ? { sameAs } : {}),
              },
              {
                '@type': 'WebSite',
                '@id': `${company.siteUrl}/#website`,
                name: company.brand,
                alternateName: 'ARC PEM — Project Expense Manager',
                url: company.siteUrl,
                inLanguage: 'en-IN',
                publisher: { '@id': ORG_ID },
                about: { '@id': SOFTWARE_ID },
              },
            ],
          }}
        />
      </head>
      <body>
        <SessionProvider session={null}>{children}</SessionProvider>
        <CookieBanner />
      </body>
      {env.gaMeasurementId() && <GoogleAnalytics gaId={env.gaMeasurementId()!} />}
    </html>
  )
}
