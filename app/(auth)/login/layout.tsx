import type { Metadata } from 'next'
import { noIndexMetadata } from '@/lib/seo'

export const metadata: Metadata = noIndexMetadata('Sign in', 'Sign in to your ARC PEM account to manage your licence and downloads.')

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
