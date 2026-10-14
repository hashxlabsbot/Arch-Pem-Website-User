'use client'

import { useEffect, useRef, useState } from 'react'
import {
  animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform,
  type MotionValue,
} from 'framer-motion'

/**
 * Project Control — a pinned "desktop" scene. One progress value `p`
 * (spring-smoothed scroll on desktop; a timed play on small screens) drives:
 * the budget gauge climbing past 100%, three OS-style alerts sliding in, then
 * the app closing while the alerts stay in the notification centre.
 * Claims match the product: alerts on launch and again on close.
 * Styles: home-sections.css (.pc).
 */

const STEPS = [
  { time: '09:02', when: 'On launch', title: 'Budget overrun, caught', text: 'The moment you open ARC PEM, every project is checked against its BOQ budget.' },
  { time: '09:02', when: 'On launch', title: 'Milestones that slipped', text: 'Overdue milestones — slab casting, brickwork, finishing — are flagged, so the site team updates them before the client asks.' },
  { time: '09:02', when: 'On launch', title: 'Money still owed', text: 'Dues to vendors and sub-contractors across every site, totalled in a single alert.' },
  { time: '18:45', when: 'On close', title: 'Still there tomorrow', text: 'Close the app and the alerts stay in your notification centre until you act on them.' },
]
const STEP_AT = [0, 0.3, 0.5, 0.7]

const TOASTS = [
  { tone: 'red', title: 'Budget Overrun: Skyline Residency', body: 'Exceeded budget by ₹2,40,000.', at: 0.22 },
  { tone: 'amber', title: '3 Overdue Milestones', body: 'Some project milestones are past their target date. Open ARC PEM to update.', at: 0.42 },
  { tone: 'indigo', title: '12 Pending Payments', body: '₹8,40,000 outstanding. Open ARC PEM to review.', at: 0.62 },
]

const BUDGET = 42.8
const SPENT_FROM = 30.1
const SPENT_TO = 45.2 // = budget + ₹2.4L, matching the overrun alert

function useMedia(query: string) {
  const [m, setM] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setM(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return m
}

export default function ProjectControl() {
  const reduce = useReducedMotion()
  const wide = useMedia('(min-width: 1000px) and (min-height: 640px)')
  const pinned = wide && !reduce

  const ref = useRef<HTMLElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 })
  const inView = useInView(screenRef, { once: true, amount: 0.5 })
  const p = useMotionValue(0)

  useEffect(() => {
    if (reduce) { p.set(1); return }
    if (pinned) { p.set(smooth.get()); return smooth.on('change', (v) => p.set(v)) }
    if (!inView) return
    const c = animate(p, 1, { duration: 6, delay: 0.3, ease: 'linear' })
    return () => c.stop()
  }, [pinned, reduce, smooth, inView, p])

  const [step, setStep] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setStep(STEP_AT.reduce((acc, at, i) => (v >= at ? i : acc), 0)))

  /* Gauge: spend climbs past budget during step 1. */
  const g = useTransform(p, [0.04, 0.24], [0, 1])
  const spent = useTransform(g, (x) => SPENT_FROM + (SPENT_TO - SPENT_FROM) * x)
  const [spentLabel, setSpentLabel] = useState(SPENT_FROM)
  useMotionValueEvent(spent, 'change', (v) => setSpentLabel(v))
  const ratio = useTransform(spent, (v) => v / BUDGET) // 0.70 → 1.056
  const needle = useTransform(ratio, [0, 1.2], [-90, 90])
  const arc = useTransform(ratio, [0, 1.2], [0, 1])
  const over = spentLabel > BUDGET

  const closing = useTransform(p, [0.72, 0.84], [0, 1])
  const appScale = useTransform(closing, [0, 1], [1, 0.86])
  const appOpacity = useTransform(closing, [0, 0.8, 1], [1, 0.2, 0])
  const centre = useTransform(closing, [0.3, 1], [0, 1])
  const glowRed = useTransform(p, [0.18, 0.26, 0.7, 0.8], [0, 1, 1, 0.4])

  return (
    <section ref={ref} className={`pc${pinned ? ' is-pinned' : ''}`} aria-labelledby="pc-title">
      <div className="pc-sticky">
        <div className="pc-panel">
          <div className="pc-dots" aria-hidden="true" />
          <motion.div className="pc-redglow" style={{ opacity: glowRed }} aria-hidden="true" />

          <div className="pc-grid">
            {/* ── Left: story ── */}
            <div className="pc-left">
              <div className="pc-eyebrow">Project control</div>
              <h2 id="pc-title" className="pc-h2">Your desktop tells you <span>before your accountant does.</span></h2>
              <p className="pc-lead">ARC PEM watches every project against its budget and its milestone dates — on launch, and again when you close the app.</p>
              <ol className="pc-steps">
                {STEPS.map((s, i) => (
                  <li key={s.title} className={i === step ? 'is-active' : i < step ? 'is-done' : ''}>
                    <span className="pc-step-time"><b>{String(i + 1).padStart(2, '0')}</b>{s.time} · {s.when}</span>
                    <strong>{s.title}</strong>
                    <span className="pc-step-text">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* ── Right: the desktop ── */}
            <div className="pc-right">
              <div ref={screenRef} className="pc-screen" aria-label="Illustration: ARC PEM alerts on a desktop">
                <div className="pc-wall" aria-hidden="true" />
                <div className="pc-menubar">
                  <span className="pc-mb-logo" />
                  <b>ARC PEM</b><span>File</span><span>Projects</span><span>Reports</span>
                  <em className="pc-clock">
                    <motion.span key={STEPS[step].time} initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 0.35 }}>{STEPS[step].time}</motion.span>
                  </em>
                </div>

                {/* App window */}
                <motion.div className="pc-app" style={{ scale: appScale, opacity: appOpacity }}>
                  <div className="pc-app-bar"><i /><i /><i /><span>ARC PEM — Skyline Residency</span></div>
                  <div className="pc-app-body">
                    <div className="pc-gauge">
                      <svg viewBox="0 0 220 130" aria-hidden="true">
                        <defs>
                          <linearGradient id="pc-g" x1="0" x2="1"><stop offset="0" stopColor="#10b981" /><stop offset=".72" stopColor="#f59e0b" /><stop offset="1" stopColor="#ef4444" /></linearGradient>
                        </defs>
                        <path d="M20 115 A90 90 0 0 1 200 115" className="pc-gauge-track" />
                        <motion.path d="M20 115 A90 90 0 0 1 200 115" className="pc-gauge-fill" style={{ pathLength: arc }} />
                        {/* budget marker at 100% (= 150° along the 180° arc for a 1.2 max) */}
                        <path d="M179.3 75 L196.6 65" className="pc-gauge-mark" />
                        <text x="168" y="56" className="pc-gauge-mtext">BUDGET</text>
                        <motion.g style={{ rotate: needle, transformOrigin: '110px 115px' }}>
                          <path d="M110 115 L110 38" className="pc-needle" />
                        </motion.g>
                        <circle cx="110" cy="115" r="7" className="pc-hub" />
                      </svg>
                      <div className={`pc-gauge-val${over ? ' is-over' : ''}`}>
                        <strong>₹{spentLabel.toFixed(1)}L</strong>
                        <span>spent of ₹{BUDGET}L budget</span>
                      </div>
                    </div>
                    <div className="pc-app-stats">
                      <div><span>Status</span><b className={over ? 'is-over' : 'is-ok'}>{over ? 'Over budget' : 'On track'}</b></div>
                      <div><span>Milestones</span><b className={step >= 1 ? 'is-warn' : ''}>{step >= 1 ? '3 overdue' : '8 on time'}</b></div>
                      <div><span>Pending</span><b className={step >= 2 ? 'is-warn' : ''}>{step >= 2 ? '₹8.4L · 12' : '—'}</b></div>
                    </div>
                  </div>
                </motion.div>

                {/* Notification centre (appears as the app closes) */}
                <motion.div className="pc-centre" style={{ opacity: centre }} aria-hidden="true">
                  <span>Notification Centre</span><em>ARC PEM · 3 alerts</em>
                </motion.div>

                {/* Toasts */}
                <div className="pc-toasts">
                  {TOASTS.map((t, i) => <Toast key={t.title} toast={t} index={i} p={p} closing={closing} />)}
                </div>

                <div className="pc-dock" aria-hidden="true">
                  {['#8a8072', '#0ea5e9', 'arc', '#d9822b', '#22c55e'].map((c, i) => (
                    <span key={i} className={c === 'arc' ? 'is-arc' : ''} style={c === 'arc' ? undefined : { background: c }}>
                      {c === 'arc' && <motion.i style={{ opacity: appOpacity }} />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pc-note">Illustration with sample data. Alerts appear on launch and again when you close ARC PEM.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Toast({ toast, index, p, closing }: { toast: (typeof TOASTS)[number]; index: number; p: MotionValue<number>; closing: MotionValue<number> }) {
  const x = useTransform(p, [toast.at - 0.05, toast.at + 0.03], ['115%', '0%'])
  const opacity = useTransform(p, [toast.at - 0.05, toast.at], [0, 1])
  // When the app closes, the stack tightens into the notification centre.
  const y = useTransform(closing, [0, 1], [0, 34 - index * 4])
  const scale = useTransform(closing, [0, 1], [1, 0.97])
  return (
    <motion.div className={`pc-toast is-${toast.tone}`} style={{ x, opacity, y, scale }}>
      <span className="pc-toast-ico" aria-hidden="true">
        {toast.tone === 'red' && <svg viewBox="0 0 20 20"><path d="M10 3l8 14H2z" /><path d="M10 8v4M10 14.5v.1" /></svg>}
        {toast.tone === 'amber' && <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7.5" /><path d="M10 6v4.5l3 2" /></svg>}
        {toast.tone === 'indigo' && <svg viewBox="0 0 20 20"><path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z" /><path d="M8.5 17.5a1.6 1.6 0 003 0" /></svg>}
      </span>
      <div>
        <strong>{toast.title}</strong>
        <span>{toast.body}</span>
        <em>ARC PEM · now</em>
      </div>
    </motion.div>
  )
}
