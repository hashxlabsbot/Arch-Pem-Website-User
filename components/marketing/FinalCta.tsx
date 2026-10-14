'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { useDemoModal } from '@/components/marketing/DemoModalContext'
import { company, phoneTel, whatsappLink } from '@/lib/company'

/**
 * Site-wide closing CTA (rendered by MarketingShell). HashX-style dark inset
 * panel; headline words light up on scroll; a magnetic demo button; and an
 * interactive "ARC PEM" wordmark made of dots that assemble on view and
 * scatter from the cursor. Every claim here is verifiable — no ratings or
 * encryption claims. Styles: app/(marketing)/final-cta.css (.fc).
 */

const STEPS = [
  ['Tell us about one project', 'Its budget, sites, and how bills reach you today — WhatsApp, paper or Excel.'],
  ['See it working live', 'BOQ, bills, labour, GST and Tally export — on data like yours.'],
  ['Get a plan for your firm', 'The right licence for your office and sites, with clear annual pricing in ₹.'],
]
const FACTS = ['30+ firms onboard', '₹120 Cr+ tracked', 'Works 100% offline', 'Data stays on your machine', 'Windows & Mac']

export default function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'start 25%'] })

  return (
    <section ref={ref} className="fc" aria-labelledby="fc-title">
      <div className="fc-panel">
        <div className="fc-glow" aria-hidden="true" />
        <div className="fc-grid">
          <div className="fc-main">
            <div className="fc-eyebrow"><span className="fc-dot" />Free live demo · 1 call · no obligation</div>
            <h2 id="fc-title" className="fc-h2">
              <Lit p={scrollYProgress} text="Ready to take control of" from={0} />
              <br />
              <span className="fc-grad"><Lit p={scrollYProgress} text="your project finances?" from={0.45} /></span>
            </h2>
            <p className="fc-lead">Join 30+ Indian architecture and construction firms tracking BOQs, vendor bills, labour, GST and Tally exports in ARC PEM — without a single spreadsheet.</p>
            <div className="fc-actions">
              <Magnetic disabled={!!reduce} />
              <a className="fc-ghost" href={phoneTel}>Call {company.phone}</a>
            </div>
            <ul className="fc-facts">{FACTS.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>

          <div className="fc-side">
            <div className="fc-side-label">What happens on the demo</div>
            <ol className="fc-steps">
              {STEPS.map(([t, d], i) => (
                <motion.li key={t} initial={reduce ? false : { opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <div><strong>{t}</strong><span>{d}</span></div>
                </motion.li>
              ))}
            </ol>
            <div className="fc-contacts">
              <a href={`mailto:${company.salesEmail}`}><span>Email</span>{company.salesEmail}</a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span>Chat with sales</a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

/** Words that brighten as the section scrolls in. */
function Lit({ p, text, from }: { p: MotionValue<number>; text: string; from: number }) {
  const words = text.split(' ')
  return <>{words.map((w, i) => <Word key={i} p={p} at={from + (i / words.length) * 0.45}>{w}</Word>)}</>
}
function Word({ p, at, children }: { p: MotionValue<number>; at: number; children: string }) {
  const opacity = useTransform(p, [at, at + 0.12], [0.18, 1])
  const y = useTransform(p, [at, at + 0.12], [10, 0])
  return <motion.span className="fc-word" style={{ opacity, y }}>{children} </motion.span>
}

/** Demo button that leans toward the cursor. */
function Magnetic({ disabled }: { disabled: boolean }) {
  const openDemo = useDemoModal()
  const mx = useMotionValue(0), my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 16 }), y = useSpring(my, { stiffness: 220, damping: 16 })
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left - r.width / 2) * 0.28)
    my.set((e.clientY - r.top - r.height / 2) * 0.4)
  }
  return (
    <motion.button className="fc-btn" style={{ x, y }} onPointerMove={onMove} onPointerLeave={() => { mx.set(0); my.set(0) }} onClick={openDemo}>
      <span className="fc-btn-sheen" aria-hidden="true" />
      Book a free demo
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </motion.button>
  )
}
