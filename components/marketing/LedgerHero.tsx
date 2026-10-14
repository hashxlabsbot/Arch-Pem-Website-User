'use client'

import { useEffect, useRef, useState } from 'react'
import { onReveal } from '@/components/marketing/SitePreloader'
import { animate, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useDemoModal } from '@/components/marketing/DemoModalContext'

/**
 * "Site Ledger" hero — ARC PEM's own identity (concrete, terracotta brick,
 * safety yellow, condensed site-signage type). The signature is a live
 * account-book page: sample entries write in, the total ticks up, and a
 * rubber stamp lands. A measuring tape slides with scroll; proof points are
 * laid like a brick course. Styles: app/(marketing)/ledger.css (.lg).
 */

const ENTRIES = [
  { date: '13-06', party: 'Shree Cement Traders', note: '4,800 bags OPC 53', site: 'Tower B', amt: 1968000 },
  { date: '13-06', party: 'Labour muster', note: '186 workers · weekly wages', site: 'Tower B', amt: 1406160 },
  { date: '14-06', party: 'Om Steel & Alloys', note: 'TMT Fe500 · 62 T', site: 'Tower A', amt: 3844000 },
  { date: '14-06', party: 'Prime RMC', note: 'M25 concrete · 420 m³', site: 'Tower A', amt: 2352000 },
  { date: '15-06', party: 'Kumar Contractors', note: 'RCC slab work · bill 7', site: 'Tower B', amt: 4680000 },
]
const TOTAL = ENTRIES.reduce((a, e) => a + e.amt, 0)
const BRICKS = ['30+ Indian firms', '₹120 Cr+ tracked', 'Works offline', 'Windows & Mac', 'TallyPrime export']

const inr = (n: number) => n.toLocaleString('en-IN')

export default function LedgerHero() {
  const openDemo = useDemoModal()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const tapeX = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  // Ledger write-in: one entry every 0.55s, then the stamp.
  const [shown, setShown] = useState(reduce ? ENTRIES.length : 0)
  const [total, setTotal] = useState(reduce ? TOTAL : 0)
  const [stamped, setStamped] = useState(!!reduce)
  useEffect(() => {
    if (reduce) return
    const timers: ReturnType<typeof setTimeout>[] = []
    // start writing once the site preloader has lifted
    const stop = onReveal(() => {
      ENTRIES.forEach((_, i) => timers.push(setTimeout(() => setShown(i + 1), 450 + i * 550)))
      timers.push(setTimeout(() => setStamped(true), 450 + ENTRIES.length * 550 + 500))
    })
    return () => { stop(); timers.forEach(clearTimeout) }
  }, [reduce])
  useEffect(() => {
    if (reduce) return
    const target = ENTRIES.slice(0, shown).reduce((a, e) => a + e.amt, 0)
    const c = animate(total, target, { duration: 0.5, ease: 'easeOut', onUpdate: (v) => setTotal(Math.round(v)) })
    return () => c.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, reduce])

  return (
    <section ref={ref} className="lg" aria-labelledby="lg-title">
      <div className="lg-grain" aria-hidden="true" />

      {/* Measuring tape */}
      <div className="lg-tape" aria-hidden="true">
        <motion.div className="lg-tape-track" style={{ x: reduce ? 0 : tapeX }}>
          {Array.from({ length: 60 }, (_, i) => (
            <span key={i} className="lg-tape-cm"><b>{i * 10}</b></span>
          ))}
        </motion.div>
      </div>

      <div className="container lg-grid">
        <div className="lg-copy">
          <div className="lg-sheet"><span>Sheet 01</span>Built for Indian architects, contractors &amp; builders</div>
          <h1 id="lg-title" className="lg-h1">
            <Line d={0.05}>Every rupee.</Line>
            <Line d={0.15}>Every site.</Line>
            <Line d={0.25} accent>On record.</Line>
            <span className="lg-sr"> ARC PEM — India&apos;s construction finance platform</span>
          </h1>
          <motion.p className="lg-sub" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}>
            <strong>India&apos;s construction finance platform.</strong> BOQ, vendor bills, labour muster, contractor ledgers and GST in one desktop app — it works offline at the site office and exports straight to TallyPrime for your CA.
          </motion.p>
          <motion.div className="lg-ctas" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
            <button className="lg-btn" onClick={openDemo}>Book a free demo <span aria-hidden="true">→</span></button>
            <a className="lg-link" href="/solutions">See how it works</a>
          </motion.div>
        </div>

        {/* Live ledger page */}
        <motion.div className="lg-book" initial={reduce ? false : { opacity: 0, rotate: 3, y: 30 }} animate={{ opacity: 1, rotate: -1.5, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="lg-book-head">
            <div><b>Site ledger</b><span>Skyline Residency · G+12 · June 2026</span></div>
            <em>Sample</em>
          </div>
          <table className="lg-table">
            <thead><tr><th>Date</th><th>Particulars</th><th className="r">Debit ₹</th></tr></thead>
            <tbody>
              {ENTRIES.map((e, i) => (
                <tr key={e.party} className={i < shown ? 'is-in' : ''}>
                  <td className="m">{e.date}</td>
                  <td><b>{e.party}</b><small>{e.note} · <span className="lg-site">{e.site}</span></small></td>
                  <td className="r m">{inr(e.amt)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><td colSpan={2}>Total · GST split on every bill</td><td className="r m">₹{inr(total)}</td></tr></tfoot>
          </table>
          <div className={`lg-stamp${stamped ? ' is-on' : ''}`} aria-hidden="true">
            <i>★ ARC PEM ★</i>
            <b>On record</b>
            <span>GST split · Tally ready</span>
            <em>15 · 06 · 2026</em>
          </div>
        </motion.div>
      </div>

      {/* Brick course */}
      <div className="container">
        <ul className="lg-bricks" aria-label="Highlights">
          {BRICKS.map((b, i) => (
            <motion.li key={b} initial={reduce ? false : { opacity: 0, y: -26, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.9 + i * 0.12 }}>
              {b}
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="lg-hazard" aria-hidden="true" />
    </section>
  )
}

function Line({ children, d, accent }: { children: string; d: number; accent?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <span className={`lg-line${accent ? ' is-accent' : ''}`}>
      <motion.span initial={reduce ? false : { y: '105%' }} animate={{ y: '0%' }} transition={{ duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.span>
    </span>
  )
}
