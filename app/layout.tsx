import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import SessionProvider from '@/components/SessionProvider'
import CookieBanner from '@/components/CookieBanner'
import JsonLd from '@/components/seo/JsonLd'
import { company } from '@/lib/company'
import { env } from '@/lib/env'
import './landing.css'
import './globals.css'

const TITLE = 'ARC PEM — Construction Expense Management Software'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour, GST and Tally exports into one offline platform built for Indian architects and construction firms.'

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: TITLE,
    template: '%s · ARC PEM',
  },
  description: DESCRIPTION,
  applicationName: 'ARC PEM',
  openGraph: {
    type: 'website',
    siteName: 'ARC PEM',
    title: TITLE,
    description: DESCRIPTION,
    url: company.siteUrl,
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
  ...(env.googleSiteVerification()
    ? { verification: { google: env.googleSiteVerification() } }
    : {}),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sameAs = Object.values(company.socials).filter(Boolean)
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: company.legalName,
            alternateName: company.brand,
            url: company.siteUrl,
            logo: `${company.siteUrl}/arc-icon.png`,
            email: company.supportEmail,
            ...(sameAs.length ? { sameAs } : {}),
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
