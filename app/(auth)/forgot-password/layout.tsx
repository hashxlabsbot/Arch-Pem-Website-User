import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Reset your password', 'Request a one-time code to reset your ARC PEM account password.')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
