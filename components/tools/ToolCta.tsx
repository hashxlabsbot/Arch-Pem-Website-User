'use client'

import Link from 'next/link'
import { useDemoModal } from '@/components/marketing/DemoModalContext'

/**
 * Inline CTA band shown after each free tool — bridges tool traffic into the
 * demo funnel via the shared marketing-shell modal.
 */
export default function ToolCta({
  heading = 'This tool is free forever. The full app goes much further.',
  sub = 'ARC PEM tracks your BOQ, vendor bills, labour attendance, contractor ledgers and GST across every project — fully offline, on your own computer.',
}: {
  heading?: string
  sub?: string
}) {
  const openDemo = useDemoModal()
  return (
    <div className="container">
      <div className="tool-cta-band fade-up">
        <div>
          <h3>{heading}</h3>
          <p>{sub}</p>
        </div>
        <div className="tool-cta-actions">
          <button className="btn btn-primary btn-lg" onClick={openDemo}>
            Book a Free Demo
          </button>
          <Link href="/solutions" className="btn btn-ghost btn-lg">
            Explore ARC PEM →
          </Link>
        </div>
      </div>
    </div>
  )
}
