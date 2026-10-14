'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'

/**
 * Hero product stage: the app window starts tilted back in perspective and
 * rotates flat / scales up as the page scrolls (Linear-style reveal), with a
 * few floating activity chips. Children = the existing app-window mockup.
 * Styles: app/(marketing)/home-sections.css (.hx-*).
 */

const CHIPS = [
  { cls: 'hx-chip-a', dot: 'green', title: 'Bill booked', body: 'Shree Cement · ₹1,24,500' },
  { cls: 'hx-chip-b', dot: 'amber', title: 'Muster imported', body: '42 labour · Site 2' },
  { cls: 'hx-chip-c', dot: 'blue', title: 'Exported to TallyPrime', body: 'Jun 2026 · 38 entries' },
]

export default function HeroStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 })
  const rotateX = useTransform(p, [0, 1], [24, 0])
  const scale = useTransform(p, [0, 1], [0.88, 1])
  const y = useTransform(p, [0, 1], [40, 0])
  const glow = useTransform(p, [0, 1], [0.35, 1])
  const chipY = useTransform(p, [0, 1], [40, 0])
  const chipO = useTransform(p, [0.35, 0.8], [0, 1])

  return (
    <div ref={ref} className="hx-stage">
      <motion.div className="hx-horizon" style={{ opacity: reduce ? 1 : glow }} aria-hidden="true" />
      <div className="hx-persp">
        <motion.div className="hx-screen" style={reduce ? undefined : { rotateX, scale, y }}>
          {children}
        </motion.div>
      </div>
      {CHIPS.map((c) => (
        <motion.div key={c.title} className={`hx-chip ${c.cls}`} style={reduce ? undefined : { y: chipY, opacity: chipO }} aria-hidden="true">
          <span className={`hx-chip-dot is-${c.dot}`} />
          <div><strong>{c.title}</strong><span>{c.body}</span></div>
        </motion.div>
      ))}
    </div>
  )
}
