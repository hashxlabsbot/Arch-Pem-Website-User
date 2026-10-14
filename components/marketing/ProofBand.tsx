'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

/**
 * Proof band — four owner-confirmed figures (same as the About page).
 * Numbers count up in step with scroll; huge outlined words drift sideways
 * behind; each tile has a cursor spotlight. Styles: home-sections.css (.px).
 */

const STATS = [
  { label: 'Firms', to: 30, prefix: '', suffix: '+', title: 'Architecture & construction firms onboard', note: 'Studios, contractors and builders across India' },
  { label: 'Tracked', to: 120, prefix: '₹', suffix: ' Cr+', title: 'Project value tracked in ARC PEM', note: 'Budgets, bills and labour — every rupee on record' },
  { label: 'GST', to: 80, prefix: '', suffix: '%', title: 'Faster GST reconciliation', note: '2 days → 2 hours a month · DesignCraft Architects' },
  { label: 'Recovered', to: 35, prefix: '₹', suffix: 'L', title: 'Pending dues recovered', note: '35% less outstanding in 3 months · Vertex Constructions' },
]

export default function ProofBand() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const drift1 = useTransform(scrollYProgress, [0, 1], ['4%', '-34%'])
  const drift2 = useTransform(scrollYProgress, [0, 1], ['-30%', '2%'])

  return (
    <section ref={ref} className="px" aria-labelledby="px-title">
      <div className="px-marquee" aria-hidden="true">
        <motion.div style={{ x: reduce ? 0 : drift1 }}>BUILT FOR INDIA&apos;S BUILDERS · PROJECT FINANCE · BUILT FOR INDIA&apos;S BUILDERS ·</motion.div>
        <motion.div style={{ x: reduce ? 0 : drift2 }} className="is-solid">BOQ · BILLS · LABOUR · GST · TALLY · BOQ · BILLS · LABOUR · GST · TALLY ·</motion.div>
      </div>

      <div className="container px-inner">
        <div className="px-head">
          <div className="px-eyebrow">Proof, not promises</div>
          <h2 id="px-title" className="px-h2">Numbers our customers <span>actually measured.</span></h2>
        </div>
        <div className="px-grid">
          {STATS.map((s, i) => <Tile key={s.label} stat={s} index={i} reduce={!!reduce} />)}
        </div>
      </div>
    </section>
  )
}

function Tile({ stat, index, reduce }: { stat: (typeof STATS)[number]; index: number; reduce: boolean }) {
  const tileRef = useRef<HTMLDivElement>(null)
  // Each tile counts up as it travels from the bottom of the screen to just past the middle,
  // so the final figure is always showing by the time it is read.
  const { scrollYProgress } = useScroll({ target: tileRef, offset: ['start 95%', 'start 50%'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 })
  const start = (index % 4) * 0.06
  const local = useTransform(p, [start, 1], [0, 1])
  const [v, setV] = useState(reduce ? stat.to : 0)
  useMotionValueEvent(local, 'change', (x) => { if (!reduce) setV(Math.round(stat.to * x)) })
  const bar = useTransform(local, [0, 1], [0, 1])
  const onMove = (e: React.PointerEvent) => {
    const el = tileRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <motion.div ref={tileRef} className="px-tile" onPointerMove={onMove}
      initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
      <span className="px-spot" aria-hidden="true" />
      <div className="px-tag"><b>{String(index + 1).padStart(2, '0')}</b> / {stat.label}</div>
      <div className="px-num" aria-label={`${stat.prefix}${stat.to}${stat.suffix}`}>
        <span aria-hidden="true">{stat.prefix}{reduce ? stat.to : v}<small>{stat.suffix}</small></span>
      </div>
      <div className="px-bar" aria-hidden="true"><motion.span style={{ scaleX: reduce ? 1 : bar }} /></div>
      <div className="px-title">{stat.title}</div>
      <div className="px-note">{stat.note}</div>
    </motion.div>
  )
}
