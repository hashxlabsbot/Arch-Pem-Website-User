'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from '@/components/icons'
import { useReveal, type RevealState } from './useReveal'

/** Renders the final value on the server; counts up from 0 once revealed. */
function CountUp({ to, reveal }: { to: number; reveal: RevealState }) {
  const [n, setN] = useState(to)

  useEffect(() => {
    if (reveal === 'armed') setN(0)
    if (reveal !== 'in') return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min((t - t0) / 1400, 1)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reveal, to])

  return <>{n}</>
}

// Owner-confirmed figures only — same as lib/seo-entity.ts `proof`.
export default function ProofBand() {
  const [ref, reveal] = useReveal<HTMLDivElement>('0px 0px -10% 0px')

  return (
    <section className="pf" aria-label="Results reported by ARC PEM customers">
      <div className="container">
        <div className="pf-card" ref={ref} data-reveal={reveal}>
          <div className="pf-top">
            <span>What firms report after moving to ARC PEM</span>
            <Link href="/about#testimonials" className="pf-link">
              Read their stories <ArrowRightIcon size={14} />
            </Link>
          </div>

          <div className="pf-grid">
            <div className="pf-cell">
              <div className="pf-num"><CountUp to={30} reveal={reveal} /><em>+</em></div>
              <p>architecture, interior and construction firms run their projects on it</p>
            </div>

            <div className="pf-cell">
              <div className="pf-num"><em className="pf-cur">₹</em><CountUp to={120} reveal={reveal} /><em> Cr+</em></div>
              <p>of project value tracked, bill by bill</p>
            </div>

            <div className="pf-cell">
              <div className="pf-num pf-num--swap">
                <s>2 days</s>
                <span>2<em> hrs</em></span>
              </div>
              <p>for monthly GST reconciliation, after replacing 14 Excel sheets per project</p>
              <span className="pf-src">Arch Consultancy</span>
            </div>

            <div className="pf-cell">
              <div className="pf-num"><em className="pf-cur">₹</em><CountUp to={35} reveal={reveal} /><em> lakh</em></div>
              <p>of pending dues recovered within 3 months, across 12 active projects</p>
              <span className="pf-src">Munesh Associates</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
