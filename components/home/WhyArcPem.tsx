'use client'

import { useEffect, useRef, useState } from 'react'
import {
  WhatsappIcon, FileIcon, GaugeIcon, HardHatIcon, ReceiptIcon, ClockIcon, ExportIcon, CheckIcon,
} from '@/components/icons'
import { ArcAppIcon, SheetGlyph, NotebookGlyph, KeyboardGlyph, SlipGlyph } from './glyphs'
import { useReveal } from './useReveal'

const sources = [
  { icon: <WhatsappIcon size={16} />, tone: 'wa', title: 'Bill photos on WhatsApp', note: 'buried in site group chats' },
  { icon: <SlipGlyph size={16} />, tone: 'paper', title: 'Kachcha bills', note: 'in a drawer at the site office' },
  { icon: <SheetGlyph size={16} />, tone: 'xls', title: 'Budget in Excel', note: 'BOQ_v7_final_FINAL.xlsx' },
  { icon: <NotebookGlyph size={16} />, tone: 'note', title: 'Muster register', note: "the supervisor's notebook" },
  { icon: <FileIcon size={16} />, tone: 'mail', title: 'Contractor bills', note: 'on email, paper and memory' },
  { icon: <KeyboardGlyph size={16} />, tone: 'key', title: 'Tally entries', note: 'retyped by your CA every month' },
]

const outputs = [
  { icon: <GaugeIcon size={16} />, title: 'Budget vs actual', note: 'for every project, every bill' },
  { icon: <HardHatIcon size={16} />, title: 'Labour wages', note: 'worked out from the muster' },
  { icon: <ReceiptIcon size={16} />, title: 'GST purchase register', note: 'ready for your CA' },
  { icon: <ClockIcon size={16} />, title: 'Pending payments', note: 'who is owed, and how much' },
  { icon: <ExportIcon size={16} />, title: 'TallyPrime export', note: 'one CSV, no retyping' },
]

type Beam = { d: string; kind: 'in' | 'out' }

export default function WhyArcPem() {
  const [flowRef, reveal] = useReveal<HTMLDivElement>()
  const coreRef = useRef<HTMLDivElement>(null)
  const srcRefs = useRef<(HTMLLIElement | null)[]>([])
  const outRefs = useRef<(HTMLLIElement | null)[]>([])
  const [beams, setBeams] = useState<Beam[]>([])
  const [box, setBox] = useState({ w: 0, h: 0, inEnd: 0, outStart: 0 })

  // Measure the nodes and draw a curve from each source into the hub, and from
  // the hub out to each result. Beams only exist in the 3-column layout.
  useEffect(() => {
    const flow = flowRef.current
    const core = coreRef.current
    if (!flow || !core) return
    const wide = window.matchMedia('(min-width: 961px)')

    const compute = () => {
      if (!wide.matches) { setBeams([]); return }
      const f = flow.getBoundingClientRect()
      const c = core.getBoundingClientRect()
      const cy = c.top + c.height / 2 - f.top
      const cl = c.left - f.left
      const cr = c.right - f.left
      const next: Beam[] = []
      srcRefs.current.forEach((el) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const x1 = r.right - f.left
        const y1 = r.top + r.height / 2 - f.top
        const mx = (x1 + cl) / 2
        next.push({ kind: 'in', d: `M${x1},${y1} C${mx},${y1} ${mx},${cy} ${cl},${cy}` })
      })
      outRefs.current.forEach((el) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const x2 = r.left - f.left
        const y2 = r.top + r.height / 2 - f.top
        const mx = (cr + x2) / 2
        next.push({ kind: 'out', d: `M${cr},${cy} C${mx},${cy} ${mx},${y2} ${x2},${y2}` })
      })
      setBox({ w: f.width, h: f.height, inEnd: cl, outStart: cr })
      setBeams(next)
    }

    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(flow)
    wide.addEventListener('change', compute)
    document.fonts?.ready.then(compute)
    return () => { ro.disconnect(); wide.removeEventListener('change', compute) }
  }, [])

  let inIdx = 0
  let outIdx = 0

  return (
    <section className="hs wa" aria-labelledby="wa-title">
      <div className="wa-glow" aria-hidden="true" />
      <div className="container">
        <div className="hs-head fade-up">
          <span className="hs-eyebrow hs-eyebrow--dark"><i />Why ARC PEM</span>
          <h2 id="wa-title">
            Every rupee of every project,<br />
            <span className="hs-grad">finally in one place.</span>
          </h2>
          <p>
            Today it&apos;s bill photos on WhatsApp, the muster in a supervisor&apos;s notebook, a budget sheet only
            one person understands — and your CA retyping all of it into Tally. ARC PEM pulls it into one
            offline desktop app and gives you back the numbers you actually run the firm on.
          </p>
        </div>

        <div className="wa-flow" ref={flowRef} data-reveal={reveal}>
          {beams.length > 0 && (
            <svg className="wa-beams" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
              <defs>
                <linearGradient id="wa-in" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={box.inEnd} y2="0">
                  <stop offset="0" stopColor="#94a3b8" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="wa-out" gradientUnits="userSpaceOnUse" x1={box.outStart} y1="0" x2={box.w} y2="0">
                  <stop offset="0" stopColor="#818cf8" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
                <filter id="wa-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {beams.map((b, i) => (
                <path key={`t${i}`} d={b.d} className={`wa-track wa-track--${b.kind}`} />
              ))}
              <g filter="url(#wa-blur)">
                {beams.map((b, i) => {
                  const n = b.kind === 'in' ? inIdx++ : outIdx++
                  const delay = b.kind === 'in' ? n * 0.55 : 1.4 + n * 0.62
                  return (
                    <path
                      key={`p${i}`}
                      d={b.d}
                      pathLength={1}
                      className="wa-pulse"
                      stroke={`url(#wa-${b.kind})`}
                      style={{ animationDelay: `${delay}s` }}
                    />
                  )
                })}
              </g>
            </svg>
          )}

          <div className="wa-col wa-col--src">
            <p className="wa-label"><span className="wa-dot wa-dot--red" />Where it lives today</p>
            <ul>
              {sources.map((s, i) => (
                <li key={s.title} ref={(el) => { srcRefs.current[i] = el }} className="wa-node wa-node--src" style={{ '--i': i } as React.CSSProperties}>
                  <span className={`wa-ico wa-ico--${s.tone}`}>{s.icon}</span>
                  <span className="wa-txt"><strong>{s.title}</strong><small>{s.note}</small></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="wa-hub">
            <div className="wa-core" ref={coreRef}>
              <span className="wa-ring" /><span className="wa-ring" /><span className="wa-ring" />
              <ArcAppIcon size={56} />
            </div>
            <strong className="wa-hub-name">ARC PEM</strong>
            <span className="wa-hub-meta">One offline desktop app<br />Windows · Mac</span>
          </div>

          <div className="wa-col wa-col--out">
            <p className="wa-label"><span className="wa-dot wa-dot--green" />What you get with ARC PEM</p>
            <ul>
              {outputs.map((o, i) => (
                <li key={o.title} ref={(el) => { outRefs.current[i] = el }} className="wa-node wa-node--out" style={{ '--i': i } as React.CSSProperties}>
                  <span className="wa-ico wa-ico--out">{o.icon}</span>
                  <span className="wa-txt"><strong>{o.title}</strong><small>{o.note}</small></span>
                  <span className="wa-ok"><CheckIcon size={12} strokeWidth={2.5} /></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
