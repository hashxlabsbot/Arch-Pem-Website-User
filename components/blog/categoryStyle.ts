import type { ReactNode } from 'react'
import { ReceiptIcon, ClipboardIcon, TruckIcon, DashboardIcon, BoltIcon } from '@/components/icons'

type CategoryStyle = { Icon: (p: { size?: number; color?: string }) => ReactNode; color: string; ink: string }

/**
 * Icon + accent colour per blog category — used for the cover art and category
 * chips. Colours are the Site Ledger palette: brick, safety yellow, site
 * green, steel blue and concrete. `ink` is the readable text colour on top.
 */
const STYLES: Record<string, CategoryStyle> = {
  'gst-and-compliance': { Icon: ReceiptIcon, color: '#b9502c', ink: '#fff' },
  'boq-and-cost-estimation': { Icon: ClipboardIcon, color: '#f5b400', ink: '#12100d' },
  'vendor-and-contractor-management': { Icon: TruckIcon, color: '#3d6b4f', ink: '#fff' },
  'case-studies': { Icon: DashboardIcon, color: '#3b6a8f', ink: '#fff' },
  'product-guides': { Icon: BoltIcon, color: '#8f867a', ink: '#12100d' },
}

const DEFAULT_STYLE: CategoryStyle = { Icon: ClipboardIcon, color: '#b9502c', ink: '#fff' }

export function getCategoryStyle(categorySlug: string): CategoryStyle {
  return STYLES[categorySlug] ?? DEFAULT_STYLE
}
