import type { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import SessionProvider from '@/components/SessionProvider'
import CookieBanner from '@/components/CookieBanner'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import { ORG_ID } from '@/lib/seo-entity'
import { env } from '@/lib/env'
import './landing.css'
import './globals.css'

const TITLE = 'ARC PEM — Construction Expense Management Software'
const OG_ALT = 'ARC PEM — construction expense management software for Indian architects and builders'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour, GST and Tally exports into one offline platform built for Indian architects and construction firms.'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a18',
}

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: TITLE,
    template: '%s · ARC PEM',
  },
  description: DESCRIPTION,
  applicationName: 'ARC PEM',
  authors: [{ name: company.legalName, url: company.siteUrl }],
  creator: company.legalName,
  publisher: company.legalName,
  category: 'Construction software',
  formatDetection: { telephone: false, email: false, address: false },
  // Allow full-size image previews and unrestricted snippets — what Google
  // Discover and AI answer engines need to quote and show the page properly.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  alternates: {
    types: { 'application/rss+xml': [{ url: '/blog/rss.xml', title: 'ARC PEM Blog' }] },
  },
  openGraph: {
    type: 'website',
    siteName: 'ARC PEM',
    locale: 'en_IN',
    title: TITLE,
    description: DESCRIPTION,
    url: company.siteUrl,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og-image.jpg', alt: OG_ALT }],
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/arc-icon.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/arc-icon.png',
  },
  ...(env.googleSiteVerification()
    ? { verification: { google: env.googleSiteVerification() } }
    : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sameAs = Object.values(company.socials).filter(Boolean)
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Martian+Mono:wght@400;500&family=Big+Shoulders+Display:wght@700;800;900&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': ORG_ID,
                name: company.legalName,
                alternateName: company.brand,
                url: company.siteUrl,
                logo: `${company.siteUrl}/arc-icon.png`,
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
                ...(sameAs.length ? { sameAs } : {}),
              },
              {
                '@type': 'WebSite',
                '@id': `${company.siteUrl}/#website`,
                name: company.brand,
                url: company.siteUrl,
                publisher: { '@id': ORG_ID },
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
