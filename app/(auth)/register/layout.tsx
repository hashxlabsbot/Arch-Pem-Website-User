import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Create your account', 'Create an ARC PEM account to get your licence and download the desktop app.')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
