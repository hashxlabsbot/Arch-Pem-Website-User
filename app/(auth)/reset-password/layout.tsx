import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Choose a new password', 'Set a new password for your ARC PEM account.')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
