import type { MetadataRoute } from 'next'
import { company } from '@/lib/company'

/** Web app manifest: lets phones and computers install ARC PEM like an app and gives crawlers the product identity. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${company.brand} — Construction Expense Management`,
    short_name: company.brand,
    description: 'Construction expense and project-cost management for Indian architects, contractors and builders.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    lang: 'en-IN',
    categories: ['business', 'productivity', 'finance'],
    icons: [{ src: '/arc-icon.png', sizes: '256x256', type: 'image/png', purpose: 'any' }],
  }
}
