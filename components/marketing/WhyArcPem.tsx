'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

/**
 * "Why ARC PEM" — modelled on the HashX Labs "idea to mainnet" chain.
 * A dark inset panel: six tool windows sit on one line that ends in an
 * ARC PEM terminal. Scrolling (desktop, pinned) connects them one by one:
 * each window flips from its messy "before" to a clean ARC PEM "after",
 * and the left column details what that tool becomes. Small screens get a
 * stacked list. Feature claims must match lib/seo-entity.ts.
 * Styles: app/(marketing)/why-arcpem.css (scoped under .wx).
 */

type Tool = {
  name: string
  file: string
  to: string
  title: string
  text: string
  gets: string[]
  before: ReactNode
  after: ReactNode
}

/* ── Mini window contents (illustrative) ── */
const Cells = ({ bad }: { bad?: boolean }) => (
  <div className="wx-sheet">
    {Array.from({ length: 12 }, (_, i) => <span key={i} className={bad && i === 7 ? 'is-err' : ''}>{bad && i === 7 ? '#VALUE!' : ''}</span>)}
  </div>
)
const Lines = ({ n = 4, strong }: { n?: number; strong?: number }) => (
  <div className="wx-lines">{Array.from({ length: n }, (_, i) => <span key={i} className={i === strong ? 'is-strong' : ''} style={{ width: `${92 - ((i * 17) % 40)}%` }} />)}</div>
)
const Rows = ({ items }: { items: [string, string][] }) => (
  <div className="wx-rows">{items.map(([a, b]) => <div key={a}><span>{a}</span><b>{b}</b></div>)}</div>
)

const TOOLS: Tool[] = [
  {
    name: 'Excel', file: 'BOQ_Rev_v12.xlsx', to: 'BOQ & Budget',
    title: 'Your BOQ becomes a live budget',
    text: 'Build the BOQ from reusable templates and get a client-ready estimate in ₹ — cost per sq ft, contingency and GST worked out for you. Every bill that arrives is then measured against it.',
    gets: ['Reusable BOQ templates', 'Contingency & GST auto-computed', 'Budget vs actual for every project'],
    before: <Cells bad />,
    after: <Rows items={[['RCC frame', '₹14.6L'], ['Masonry', '₹5.2L'], ['Budget', '₹42.8L']]} />,
  },
  {
    name: 'WhatsApp', file: '“Thekedar ko payment hua?”', to: 'Labour Tracking',
    title: 'Wages agreed once, on the record',
    text: 'No more settling labour counts with the thekedar over WhatsApp. Daily headcount is entered, or imported from the PDF manpower report your site supervisor already sends, and wages are calculated from it.',
    gets: ['Daily headcount & wages', 'PDF manpower report import', 'Labour cost per project'],
    before: <div className="wx-chat"><span>Kal 42 labour the?</span><span className="is-me">Muster bhejo…</span><span>Kaunsi site??</span></div>,
    after: <div className="wx-bars">{[28, 42, 36, 48, 44, 22].map((h, i) => <span key={i} style={{ height: `${h * 2}%` }} />)}</div>,
  },
  {
    name: 'Kachcha bills', file: 'Cash bill #104 · site', to: 'Vendor Tracking',
    title: 'Every bill booked to a project',
    text: 'Cement, steel and hardware bills — pakka or kachcha — and daily site expenses go straight into the project ledger, with GST split out where it applies. Nothing sits in a drawer at the site office.',
    gets: ['Vendor ledger with GST toggle', 'Site expense tracking', 'Party directory & autocomplete'],
    before: <div className="wx-receipt"><Lines n={5} /><em>untracked</em></div>,
    after: <Rows items={[['Shree Cement', '₹1,24,500'], ['GST 18%', '₹18,991'], ['Status', 'Booked']]} />,
  },
  {
    name: 'PDF invoice', file: 'Steel_Dec_Final.pdf', to: 'Contractor bills',
    title: 'Contractor bills, tracked to payment',
    text: 'Every sub-contractor’s bill is recorded against the BOQ, and the pending payments view shows what is due to whom across all your sites — before anyone calls asking for it.',
    gets: ['Contractor bill management', 'Pending payments dashboard', 'Overrun alerts against the BOQ'],
    before: <div className="wx-pdf"><b>PDF</b><Lines n={3} /><em>awaiting validation</em></div>,
    after: <div className="wx-bva"><span style={{ width: '78%' }} /><small>₹33.4L of ₹42.8L · 78%</small><i>Steel +6% over BOQ</i></div>,
  },
  {
    name: 'GST sheet', file: 'GST_purchase_reg.xlsx', to: 'GST register',
    title: 'GST ready before your CA asks',
    text: 'GST is split on every bill as it is entered, so the monthly GST purchase register is ready when your CA sits down for filing — no month-end chase for missing bills.',
    gets: ['GST split on every bill', 'Monthly GST purchase register', 'Ready to share with your CA'],
    before: <Cells bad />,
    after: <Rows items={[['Taxable', '₹5,84,820'], ['GST', '₹1,05,268'], ['Net', '₹6,90,088']]} />,
  },
  {
    name: 'Tally', file: 'Re-keyed by accounts', to: 'Tally export',
    title: 'One click to Tally',
    text: 'Most Indian CAs already work in Tally. Export vendor bills and expenses as Tally ERP / TallyPrime-ready CSV, and your accounts team stops re-typing site data.',
    gets: ['Tally ERP / TallyPrime CSV export', 'No double entry for accounts', 'PDF & Excel reports'],
    before: <div className="wx-dup"><Lines n={2} /><Lines n={2} /><em>entered twice</em></div>,
    after: <div className="wx-export"><span>TallyPrime CSV</span><b>Exported</b></div>,
  },
]

const N = TOOLS.length

function useMedia(query: string) {
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on(); mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

const Check = () => (<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>)
const Warn = () => (<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M8 4.8v3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><circle cx="8" cy="11.2" r=".9" fill="currentColor" /></svg>)

export default function WhyArcPem() {
  const reduce = useReducedMotion()
  const wide = useMedia('(min-width: 1000px) and (min-height: 640px)')
  const pinned = wide && !reduce

  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const fill = useTransform(p, [0.04, 0.9], [0, 1])
  const [active, setActive] = useState(0)
  const [linked, setLinked] = useState(0)
  const [complete, setComplete] = useState(false)
  useMotionValueEvent(p, 'change', (v) => {
    const raw = ((v - 0.04) / 0.86) * N
    setActive(Math.min(N - 1, Math.max(0, Math.floor(raw))))
    // A tool "connects" just under halfway through its own scroll step.
    setLinked(Math.min(N, Math.max(0, Math.floor(raw + 0.55))))
    setComplete(v > 0.9)
  })
  const connected = (i: number) => !pinned || i < linked

  return (
    <section ref={ref} className={`wx${pinned ? ' is-pinned' : ''}`} aria-labelledby="wx-title">
      <div className="wx-sticky">
        <div className="wx-panel">
          {pinned ? <DotField /> : <div className="wx-dots" aria-hidden="true" />}
          <div className="wx-glow" aria-hidden="true" />
          {pinned && <Ribbon p={p} />}

          {pinned ? (
            <div className="wx-grid">
              <div className="wx-intro">
                <div className="wx-eyebrow">Why ARC PEM</div>
                <h2 id="wx-title" className="wx-h2">Six tools in.<br /><span>One project out.</span></h2>
                <LightWords p={p} text="Excel BOQs, WhatsApp groups, kachcha bills, PDF invoices, GST sheets and Tally — scroll to see what each one becomes inside ARC PEM." />
                <div className="wx-progress" aria-hidden="true">
                  {TOOLS.map((t, i) => <span key={t.name} className={i < linked ? 'is-done' : i === active ? 'is-active' : ''} />)}
                  <em>{complete ? 'All in one place' : TOOLS[active].to}</em>
                </div>
              </div>

              <div className="wx-detail">
                <motion.span key={`g${active}`} className="wx-ghostnum" aria-hidden="true" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>{String(active + 1).padStart(2, '0')}</motion.span>
                <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="wx-block">Tool {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</div>
                    <h3 className="wx-h3">{TOOLS[active].name} <i>→</i> <span>{TOOLS[active].to}</span></h3>
                    <p className="wx-text"><strong>{TOOLS[active].title}.</strong> {TOOLS[active].text}</p>
                    <div className="wx-get">You get</div>
                    <ol className="wx-list">
                      {TOOLS[active].gets.map((g, i) => <li key={g}><b>{String(i + 1).padStart(2, '0')}</b>{g}</li>)}
                    </ol>
                </motion.div>
              </div>

              <div className="wx-chainwrap">
                <div className="wx-count">{complete ? 'All tools connected' : 'Tools connected'} · <span className="wx-roll"><motion.b key={linked} initial={{ y: '100%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>{linked}</motion.b></span> / {N}</div>
                <div className="wx-chain">
                  <div className="wx-rail" aria-hidden="true"><motion.span style={{ scaleX: fill }} /><Comet fill={fill} /></div>
                  {TOOLS.map((t, i) => <Window key={t.name} tool={t} index={i} on={connected(i)} current={i === active && !complete} />)}
                  <div className={`wx-terminal${complete ? ' is-live' : ''}`}><span className="wx-terminal-dot" />ARC PEM</div>
                </div>
                <div className="wx-note">Illustrative data. Each window shows the tool as it is today, then the same work inside ARC PEM.</div>
              </div>
            </div>
          ) : (
            <div className="wx-stack">
              <div className="wx-eyebrow">Why ARC PEM</div>
              <h2 id="wx-title" className="wx-h2">Six tools in.<br /><span>One project out.</span></h2>
              <p className="wx-lead">Excel BOQs, WhatsApp groups, kachcha bills, PDF invoices, GST sheets and Tally — and what each one becomes inside ARC PEM.</p>
              <ol className="wx-cards">
                {TOOLS.map((t, i) => (
                  <motion.li key={t.name} initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: 0.05 }}>
                    <Window tool={t} index={i} on current={false} />
                    <div>
                      <div className="wx-block">Tool {String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</div>
                      <h3 className="wx-h3">{t.name} <i>→</i> <span>{t.to}</span></h3>
                      <p className="wx-text">{t.title}. {t.text}</p>
                      <ol className="wx-list">{t.gets.map((g, k) => <li key={g}><b>{String(k + 1).padStart(2, '0')}</b>{g}</li>)}</ol>
                    </div>
                  </motion.li>
                ))}
              </ol>
              <div className="wx-terminal is-live wx-terminal-static"><span className="wx-terminal-dot" />ARC PEM · all six in one place</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** One mini app window: flips in 3D from the messy "before" to the ARC PEM "after". */
function Window({ tool, index, on, current }: { tool: Tool; index: number; on: boolean; current: boolean }) {
  return (
    <div className={`wx-win${on ? ' is-on' : ''}${current ? ' is-current' : ''}`}>
      <div className="wx-win-frame">
        <span className="wx-burst" aria-hidden="true" />
        <div className="wx-flip">
          <div className="wx-side wx-side-front">
            <div className="wx-win-bar"><i /><i /><i /><span>{tool.name}</span><em className="wx-bad"><Warn /></em></div>
            <div className="wx-face">{tool.before}<small>{tool.file}</small></div>
          </div>
          <div className="wx-side wx-side-back">
            <div className="wx-win-bar"><i /><i /><i /><span>ARC PEM</span><em className="wx-ok"><Check /></em></div>
            <div className="wx-face">{tool.after}<small>{tool.to}</small></div>
          </div>
        </div>
      </div>
      <div className="wx-win-num">{String(index + 1).padStart(2, '0')}</div>
    </div>
  )
}

/** Paragraph whose words light up one by one as the story progresses (5bix-style). */
function LightWords({ p, text }: { p: MotionValue<number>; text: string }) {
  const words = text.split(' ')
  return (
    <p className="wx-lead wx-lit">
      {words.map((w, i) => <Word key={i} p={p} at={(i / words.length) * 0.32}>{w}</Word>)}
    </p>
  )
}
function Word({ p, at, children }: { p: MotionValue<number>; at: number; children: string }) {
  const opacity = useTransform(p, [at, at + 0.05], [0.22, 1])
  return <motion.span style={{ opacity }}>{children} </motion.span>
}

/** Glowing spark riding the front of the rail fill. */
function Comet({ fill }: { fill: MotionValue<number> }) {
  const left = useTransform(fill, (v) => `${v * 100}%`)
  const opacity = useTransform(fill, [0, 0.02, 0.98, 1], [0, 1, 1, 0])
  return <motion.i className="wx-comet" style={{ left, opacity }} />
}

/** Neon ribbon that draws itself across the panel with scroll. */
function Ribbon({ p }: { p: MotionValue<number> }) {
  const draw = useTransform(p, [0.02, 0.92], [0, 1])
  const d = 'M-40 505 C 200 430, 380 570, 640 505 S 1020 440, 1200 498 S 1420 545, 1500 508'
  return (
    <svg className="wx-ribbon" viewBox="0 0 1440 800" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="wx-rib" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f5b400" /><stop offset=".5" stopColor="#c9603a" /><stop offset="1" stopColor="#d9822b" />
        </linearGradient>
      </defs>
      <motion.path d={d} className="wx-ribbon-glow" style={{ pathLength: draw }} />
      <motion.path d={d} className="wx-ribbon-core" style={{ pathLength: draw }} />
    </svg>
  )
}

/** Cursor-reactive dot matrix (canvas). Dots swell near the pointer; a slow light wave drifts through. */
function DotField() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    const host = cv.parentElement!
    let w = 0, h = 0, dpr = 1, raf = 0, visible = false
    let mx = -9999, my = -9999, tx = -9999, ty = -9999
    const GAP = 22
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = host.clientWidth; h = host.clientHeight
      cv.width = w * dpr; cv.height = h * dpr
      cv.style.width = `${w}px`; cv.style.height = `${h}px`
    }
    const onMove = (e: PointerEvent) => { const r = host.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top }
    const onLeave = () => { tx = -9999; ty = -9999 }
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      mx += (tx - mx) * 0.12; my += (ty - my) * 0.12
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const wave = (t / 1000) * 0.6
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          const dx = x - mx, dy = y - my
          const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 170)
          const ambient = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.008 - wave * 2)
          const r = 0.8 + near * 2.6 + ambient * 0.35
          const a = 0.08 + ambient * 0.07 + near * 0.75
          ctx.fillStyle = near > 0.02 ? `rgba(245, 180, 0, ${a})` : `rgba(190, 180, 165, ${a})`
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
        }
      }
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(host)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 }); io.observe(host)
    host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave) }
  }, [])
  return <canvas ref={ref} className="wx-field" aria-hidden="true" />
}
