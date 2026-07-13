import type { ReactNode } from 'react'
import { ReceiptIcon, ClipboardIcon, TruckIcon, DashboardIcon, BoltIcon } from '@/components/icons'

type CategoryStyle = { Icon: (p: { size?: number; color?: string }) => ReactNode; color: string }

/** Icon + accent colour per blog category — used for the branded cover card and category pills. */
const STYLES: Record<string, CategoryStyle> = {
  'gst-and-compliance': { Icon: ReceiptIcon, color: '#4f46e5' },
  'boq-and-cost-estimation': { Icon: ClipboardIcon, color: '#0ea5e9' },
  'vendor-and-contractor-management': { Icon: TruckIcon, color: '#10b981' },
  'case-studies': { Icon: DashboardIcon, color: '#f59e0b' },
  'product-guides': { Icon: BoltIcon, color: '#8b5cf6' },
}

const DEFAULT_STYLE: CategoryStyle = { Icon: ClipboardIcon, color: '#4f46e5' }

export function getCategoryStyle(categorySlug: string): CategoryStyle {
  return STYLES[categorySlug] ?? DEFAULT_STYLE
}
