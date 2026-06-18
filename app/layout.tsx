import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SessionProvider from '@/components/SessionProvider'
import CookieBanner from '@/components/CookieBanner'
import { company } from '@/lib/company'
import './landing.css'
import './globals.css'

const TITLE = 'ARC PEM — Project Expense Management Software'
const DESCRIPTION =
  'ARC PEM unifies BOQ, vendor bills, labour tracking, contractor ledgers, GST, and professional reports — fully offline desktop software for Indian construction firms.'

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
    images: [{ url: '/arch-illustration.svg' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/arc-icon.png', sizes: '256x256', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/arc-icon.png',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
        <CookieBanner />
      </body>
    </html>
  )
}
