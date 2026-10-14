'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'

/**
 * "From the first sketch to the final handover" — pinned horizontal journey.
 * Vertical scroll moves four stage cards sideways; each card sharpens as it
 * reaches centre stage, with parallax inside its photo. Small screens get a
 * vertical stack. Styles: home-sections.css (.lc).
 */

const STAGES = [
  { word: 'Sketch', chip: 'Architecture', title: 'Design to Budget', img: '/images/blueprint-plans.jpg', bg: '/images/architecture-modern.jpg',
    desc: 'Turn drawings into a BOQ and a client-ready estimate in ₹ lakh — cost per sq ft, contingency and GST worked out before the first bill arrives.',
    feats: ['BOQ templates', 'Cost per sq ft', 'GST & contingency'] },
  { word: 'Site', chip: 'Construction', title: 'Every Site, Tracked', img: '/images/construction-crane.jpg', bg: '/images/construction-workers.jpg',
    desc: 'Daily labour from the muster, cement and steel bills, and site expenses — captured at the site office, even where there is no internet.',
    feats: ['Daily headcount', 'Vendor bills', 'Site expenses'] },
  { word: 'Books', chip: 'Finance', title: 'Every Rupee Accounted', img: '/images/finance-laptop.jpg', bg: '/images/finance-analytics.jpg',
    desc: 'Vendor ledgers, sub-contractor bills and the GST purchase register — then one-click TallyPrime export for your CA.',
    feats: ['Vendor ledger', 'GST register', 'Tally export'] },
  { word: 'Handover', chip: 'Management', title: 'One Source of Truth', img: '/images/management-meeting.jpg', bg: '/images/management-team.jpg',
    desc: 'Partners and project managers see budget vs actual and pending dues for every project — before the client or the CA asks.',
    feats: ['Budget vs actual', 'Overrun alerts', 'Pending payments'] },
]
const N = STAGES.length
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

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

export default function Lifecycle() {
  const reduce = useReducedMotion()
  const wide = useMedia('(min-width: 1000px) and (min-height: 640px)')
  const pinned = wide && !reduce

  const ref = useRef<HTMLElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 })
  const x = useTransform(p, (v) => -v * dist)
  const ruler = useTransform(p, [0, 1], [0, 1])

  useIsoLayoutEffect(() => {
    if (!pinned) return
    const measure = () => {
      const view = viewRef.current, track = trackRef.current
      if (view && track) setDist(Math.max(0, track.scrollWidth - view.clientWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (viewRef.current) ro.observe(viewRef.current)
    return () => ro.disconnect()
  }, [pinned])

  const [active, setActive] = useState(0)
  useMotionValueEvent(p, 'change', (v) => setActive(Math.min(N - 1, Math.round(v * (N - 1)))))

  const head = (
    <>
      <div className="lc-eyebrow">Built for how India builds</div>
      <h2 id="lc-title" className="lc-h2">From the first sketch <span>to the final handover.</span></h2>
      <p className="lc-lead">For Indian architects, contractors and builders — one platform from the first BOQ to the final handover, across every site and every rupee.</p>
    </>
  )

  if (!pinned) {
    return (
      <section ref={ref} className="lc" aria-labelledby="lc-title">
        <div className="container lc-stack">
          {head}
          <div className="lc-stack-cards">
            {STAGES.map((s, i) => (
              <motion.article key={s.title} className="lc-card is-focus" initial={reduce ? false : { opacity: 0, y: 40, clipPath: 'inset(12% 6% 12% 6% round 24px)' }}
                whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0% round 24px)' }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <div className="lc-img"><Image src={s.img} alt={s.title} fill sizes="100vw" /></div>
                <CardInner stage={s} index={i} />
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="lc is-pinned is-dark" aria-labelledby="lc-title">
      <div className="lc-sticky">
        <div className="lc-photos" aria-hidden="true">
          {STAGES.map((st, i) => (
            <div key={st.bg} className={`lc-photo${i === active ? ' is-on' : ''}`}>
              <Image src={st.bg} alt="" fill sizes="100vw" priority={i === 0} />
            </div>
          ))}
          <div className="lc-photo-tint" />
        </div>
        <Backdrop p={p} />
        <motion.div key={active} className="lc-bigword" aria-hidden="true" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          {STAGES[active].word}
        </motion.div>

        <div className="lc-layout">
          <div className="lc-side">
            {head}
            <div className="lc-counter"><b>{String(active + 1).padStart(2, '0')}</b> / {String(N).padStart(2, '0')} · {STAGES[active].chip}</div>
            <div className="lc-ruler" aria-hidden="true">
              <div className="lc-ruler-line"><motion.span style={{ scaleX: ruler }} /></div>
              <div className="lc-ruler-stops">
                {STAGES.map((s, i) => <span key={s.word} className={i <= active ? 'is-on' : ''}><i />{s.word}</span>)}
              </div>
            </div>
          </div>

          <div ref={viewRef} className="lc-view">
            <motion.div ref={trackRef} className="lc-track" style={{ x }}>
              {STAGES.map((s, i) => <Card key={s.title} stage={s} index={i} p={p} />)}
              <div className="lc-end" aria-hidden="true">
                <span className="lc-end-dot" />
                <strong>Handed over.</strong>
                <em>Every rupee on record.</em>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Generated blueprint backdrop that draws itself as the journey advances:
 * floor plan (sketch) → building elevation with scaffolding (site) → tower crane
 * and level marks (books / handover). Thin, faint line-work behind the cards.
 */
function Backdrop({ p }: { p: MotionValue<number> }) {
  const plan = useTransform(p, [0, 0.38], [0.12, 1])
  const build = useTransform(p, [0.22, 0.7], [0, 1])
  const crane = useTransform(p, [0.5, 0.92], [0, 1])
  const labels = useTransform(p, [0.08, 0.3], [0, 1])
  const marks = useTransform(p, [0.6, 0.9], [0, 1])
  const cols = [930, 1010, 1090, 1170, 1250]
  const slabs = [760, 690, 620, 550, 480]
  return (
    <svg className="lc-backdrop" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* survey grid crosses */}
      <g className="lc-bd-faint">
        {Array.from({ length: 10 }, (_, i) => Array.from({ length: 6 }, (_, j) => (
          <path key={`${i}-${j}`} d={`M${80 + i * 140} ${70 + j * 130} h10 m-5 -5 v10`} />
        )))}
      </g>

      {/* ── Floor plan (sketch) ── */}
      <g className="lc-bd-line">
        <motion.path d="M60 470 H640 V770 H60 Z" className="lc-bd-wall" style={{ pathLength: plan }} />
        <motion.path d="M300 470 V640 M300 690 V770 M60 600 H200 M250 600 H300 M300 620 H470 M520 620 H640 M470 470 V560 M470 600 V770" style={{ pathLength: plan }} />
        {/* door swings */}
        <motion.path d="M200 600 A50 50 0 0 1 250 650 M300 640 A50 50 0 0 1 350 690 M470 560 A40 40 0 0 0 510 600 M470 620 A50 50 0 0 1 520 670" style={{ pathLength: plan }} />
        {/* windows */}
        <motion.path d="M120 466 H220 M120 474 H220 M360 466 H440 M360 474 H440 M644 520 V580 M636 520 V580 M120 774 H240 M120 766 H240" style={{ pathLength: plan }} />
        {/* dimension lines */}
        <motion.path d="M60 440 H640 M60 432 V448 M640 432 V448 M30 470 V770 M22 470 H38 M22 770 H38" className="lc-bd-dim" style={{ pathLength: plan }} />
      </g>
      <motion.g className="lc-bd-text" style={{ opacity: labels }}>
        <text x="350" y="430" textAnchor="middle">12.00 m</text>
        <text x="18" y="625" textAnchor="middle" transform="rotate(-90 18 625)">7.50 m</text>
        <text x="130" y="545">LIVING  4.2 × 3.6</text>
        <text x="370" y="545">KITCHEN</text>
        <text x="510" y="530">POOJA</text>
        <text x="110" y="700">BED 1  3.6 × 3.3</text>
        <text x="370" y="715">TOILET</text>
        <text x="530" y="715">BED 2</text>
        <text x="60" y="800">GROUND FLOOR PLAN · SCALE 1:100</text>
      </motion.g>

      {/* ── Building under construction (site) ── */}
      <g className="lc-bd-line">
        <motion.path d="M860 760 H1420" className="lc-bd-wall" style={{ pathLength: build }} />
        {cols.map((x) => <motion.path key={x} d={`M${x} 760 V470`} style={{ pathLength: build }} />)}
        {slabs.map((y) => <motion.path key={y} d={`M915 ${y} H1265`} className="lc-bd-wall" style={{ pathLength: build }} />)}
        {/* scaffolding */}
        <motion.path d="M1285 760 V440 M1310 760 V440 M1285 700 L1310 640 M1285 640 L1310 580 M1285 580 L1310 520 M1285 520 L1310 460 M900 760 V500 M880 760 V500 M880 700 L900 640 M880 640 L900 580 M880 580 L900 520" className="lc-bd-dim" style={{ pathLength: build }} />
        {/* footings */}
        <motion.path d={cols.map((x) => `M${x - 18} 790 h36 v-12 h-12 v-18 h-12 v18 h-12 z`).join(' ')} style={{ pathLength: build }} />
      </g>

      {/* ── Tower crane + level marks (books / handover) ── */}
      <g className="lc-bd-line">
        <motion.path d="M1360 760 V170 M1376 760 V170 M1360 170 H1376" style={{ pathLength: crane }} />
        <motion.path d={Array.from({ length: 16 }, (_, i) => `M1360 ${740 - i * 36} L1376 ${704 - i * 36} M1376 ${740 - i * 36} L1360 ${704 - i * 36}`).join(' ')} className="lc-bd-dim" style={{ pathLength: crane }} />
        <motion.path d="M1368 120 V170 M1368 120 L1000 168 M1368 120 L1440 160 M980 170 H1440 M980 182 H1440 M1040 182 V260 M1032 260 h16 v14 h-16 z" style={{ pathLength: crane }} />
      </g>
      <motion.g className="lc-bd-text" style={{ opacity: marks }}>
        {['+0.00', '+3.20', '+6.40', '+9.60', '+12.80'].map((t, i) => (
          <text key={t} x="1200" y={slabs[i] - 8} textAnchor="end">{t}</text>
        ))}
        <text x="1090" y="805" textAnchor="middle">ELEVATION A–A · G+4</text>
        <path d="M760 110 l14 34 l-14 -10 l-14 10 z M760 96 v-12" className="lc-bd-north" />
        <text x="760" y="76" textAnchor="middle">N</text>
      </motion.g>
    </svg>
  )
}

function Card({ stage, index, p }: { stage: (typeof STAGES)[number]; index: number; p: MotionValue<number> }) {
  // Focus peaks when this card is the active stage.
  const centre = index / (N - 1)
  const span = 0.34
  const focus = useTransform(p, [centre - span, centre, centre + span], [0, 1, 0])
  const scale = useTransform(focus, [0, 1], [0.9, 1])
  const imgX = useTransform(p, [centre - 0.5, centre + 0.5], ['-9%', '9%'])
  const dim = useTransform(focus, [0, 1], [0.55, 0])
  const [on, setOn] = useState(index === 0)
  useMotionValueEvent(focus, 'change', (v) => setOn(v > 0.6))
  return (
    <motion.article className={`lc-card${on ? ' is-focus' : ''}`} style={{ scale }}>
      <motion.div className="lc-img" style={{ x: imgX }}>
        <Image src={stage.img} alt={stage.title} fill sizes="(max-width: 1400px) 46vw, 640px" />
      </motion.div>
      <motion.div className="lc-dim" style={{ opacity: dim }} aria-hidden="true" />
      <CardInner stage={stage} index={index} />
    </motion.article>
  )
}

function CardInner({ stage, index }: { stage: (typeof STAGES)[number]; index: number }) {
  return (
    <>
      <div className="lc-shade" aria-hidden="true" />
      <div className="lc-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
      <div className="lc-body">
        <span className="lc-chip">{stage.chip}</span>
        <h3>{stage.title}</h3>
        <p>{stage.desc}</p>
        <ul className="lc-feats">{stage.feats.map((f, i) => <li key={f} style={{ transitionDelay: `${0.08 * i + 0.1}s` }}>{f}</li>)}</ul>
      </div>
    </>
  )
}
