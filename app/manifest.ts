import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ARC PEM — Construction Expense Management Software',
    short_name: 'ARC PEM',
    description:
      'BOQ, vendor bills, labour, GST and Tally export for Indian architects and construction firms — fully offline.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f1ea',
    theme_color: '#1a1a18',
    lang: 'en-IN',
    icons: [
      { src: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { src: '/arc-icon.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
    ],
  }
}
