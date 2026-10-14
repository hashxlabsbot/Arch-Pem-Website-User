'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Site Ledger intro, in four beats:
 *  1. a skyline elevation is drawn as a live blueprint,
 *  2. thousands of bricks rain down and stack into the towers,
 *  3. windows light up while ₹120 Cr+ is counted onto the ledger,
 *  4. a giant ARC PEM slams in as a cut-out and the camera zooms through
 *     the letters into the page.
 * Plays on every full page load (client-side navigation doesn't remount it).
 * The page is server-rendered underneath the whole time.
 */

// Lets page intros (e.g. the hero ledger) wait until the preloader lifts.
let revealed = false
const waiting = new Set<() => void>()
export function onReveal(cb: () => void) {
  if (revealed) { cb(); return () => {} }
  let fired = false
  const once = () => { if (!fired) { fired = true; waiting.delete(once); clearTimeout(t); cb() } }
  const t = setTimeout(once, 12000) // failsafe in case the preloader never runs
  waiting.add(once)
  return () => { waiting.delete(once); clearTimeout(t) }
}
function reveal() {
  if (revealed) return
  revealed = true
  Array.from(waiting).forEach((cb) => cb()); waiting.clear()
}
// timeline, ms
const TR0 = 0, TR1 = 1800          // blueprint trace
const FILL0 = 900, FILL1 = 3700    // bricks
const LIGHT0 = 3400                // windows
const WORD = 4500                  // ARC PEM slam
const ZOOM = 5200, ZOOM_MS = 1200  // zoom-through

const INK = '#12100d', YEL = '#f5b400'
const BRICKS = ['#b9502c', '#a9461f', '#c4603a', '#b14b27']
const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeInExpo = (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10))

type Cell = { tx: number; ty: number; sx: number; sy: number; d: number; col: string; lit: number }
type Word = { w: number; h: number; fs: number; y: number; len: number; ox: number; oy: number }

export default function SitePreloader() {
  const [done, setDone] = useState(false)
  const [word, setWord] = useState<Word | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const amtRef = useRef<HTMLSpanElement>(null)
  const stageRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const tapeRef = useRef<HTMLElement>(null)
  const zoomA = useRef<SVGGElement>(null)
  const zoomB = useRef<SVGGElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const geomRef = useRef<Word | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const html = document.documentElement
    const root = rootRef.current!
    html.classList.add('pl-lock')

    if (reduce) {
      root.classList.add('is-fade')
      const t = window.setTimeout(() => { html.classList.remove('pl-lock'); reveal(); setDone(true) }, 300)
      return () => { clearTimeout(t); html.classList.remove('pl-lock') }
    }

    const W = window.innerWidth, H = window.innerHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const cv = cvRef.current!
    cv.width = W * dpr; cv.height = H * dpr
    const ctx = cv.getContext('2d')!
    const mobile = W < 760

    // ── scene: four towers on one ground line ──
    const ground = H * (mobile ? 0.88 : 0.86)
    const span = Math.min(W * (mobile ? 0.92 : 0.6), 960)
    const x0 = mobile ? (W - span) / 2 : W - span - W * 0.05
    const hMax = Math.min(H * (mobile ? 0.44 : 0.66), 620)
    const towers = [
      { a: 0.0, b: 0.2, h: 0.42 },
      { a: 0.24, b: 0.46, h: 0.62 },
      { a: 0.5, b: 0.74, h: 1.0 },
      { a: 0.78, b: 1.0, h: 0.72 },
    ]
    const c = mobile ? 6 : 9
    const cells: Cell[] = []
    const segs: [number, number, number, number][] = []
    const labels: { x: number; y: number; seg: number; at: number; text: string }[] = []
    segs.push([x0 - 30, ground, x0 + span + 30, ground])
    let tallTop = ground, tallA = 0, tallB = 0
    for (const tw of towers) {
      const tx0 = x0 + tw.a * span, tx1 = x0 + tw.b * span
      const cols = Math.floor((tx1 - tx0) / c), rows = Math.floor((tw.h * hMax) / c / 4) * 4
      const left = tx0 + ((tx1 - tx0) - cols * c) / 2, right = left + cols * c
      const top = ground - rows * c
      segs.push([left, ground, left, top])
      labels.push({ x: left, y: top - 10, seg: segs.length, at: 1, text: `+${((rows / 4) * 3.2).toFixed(1)} M` })
      segs.push([left, top, right, top], [right, top, right, ground])
      for (let r = 4; r < rows; r += 4) segs.push([left, ground - r * c, right, ground - r * c])
      if (top < tallTop) { tallTop = top; tallA = left; tallB = right }
      for (let r = 0; r < rows; r++) {
        const fr = r / rows, m = r % 4
        for (let k = 0; k < cols; k++) {
          const win = (m === 1 || m === 2) && (k % 4 === 1 || k % 4 === 2) && k < cols - 1
          const tx = left + k * c, ty = ground - (r + 1) * c
          cells.push({
            tx, ty,
            sx: tx + (Math.random() - 0.5) * 70,
            sy: -Math.random() * H * 0.5 - 20,
            d: FILL0 + fr * (FILL1 - FILL0 - 600) + Math.random() * 240,
            col: m === 0 ? '#8f867a' : win ? '#3a1a0e' : BRICKS[(Math.random() * BRICKS.length) | 0],
            lit: win && Math.random() < 0.6 ? LIGHT0 + fr * 600 + Math.random() * 300 : Infinity,
          })
        }
      }
    }
    // tower crane on the tallest block
    const mx = tallB - (tallB - tallA) * 0.22, jy = tallTop - Math.min(120, H * 0.12)
    const jl = (tallB - tallA) * 1.25
    segs.push(
      [mx, tallTop, mx, jy - 26], [mx - jl, jy, mx + jl * 0.38, jy],
      [mx, jy - 26, mx - jl * 0.8, jy], [mx, jy - 26, mx + jl * 0.38, jy],
      [mx - jl * 0.62, jy, mx - jl * 0.62, jy + 64],
    )
    const lens = segs.map(([a, b, x, y]) => Math.hypot(x - a, y - b))
    const total = lens.reduce((s, v) => s + v, 0)
    let acc = 0
    const ends = lens.map((l) => (acc += l))
    labels.forEach((lb) => { lb.at = ends[lb.seg] / total })
    const grid = new Path2D()
    for (let x = (W % 48) / 2; x < W; x += 48) { grid.moveTo(x, 0); grid.lineTo(x, H) }
    for (let y = (H % 48) / 2; y < H; y += 48) { grid.moveTo(0, y); grid.lineTo(W, y) }
    const MONO = '600 11px "IBM Plex Mono", ui-monospace, monospace'

    const draw = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = INK; ctx.fillRect(0, 0, W, H)
      ctx.lineWidth = 1
      ctx.strokeStyle = `rgba(245,180,0,${0.07 * clamp(t / 500)})`; ctx.stroke(grid)

      // blueprint trace with a glowing pen head
      const tp = easeInOut(clamp((t - TR0) / (TR1 - TR0)))
      const fade = 1 - 0.7 * clamp((t - FILL1) / 400)
      let left = tp * total, hx = 0, hy = 0
      ctx.strokeStyle = `rgba(245,180,0,${0.9 * fade})`; ctx.lineWidth = 1.4
      ctx.beginPath()
      for (let i = 0; i < segs.length && left > 0; i++) {
        const [a, b, x, y] = segs[i]
        const f = Math.min(1, left / lens[i])
        hx = a + (x - a) * f; hy = b + (y - b) * f
        ctx.moveTo(a, b); ctx.lineTo(hx, hy)
        left -= lens[i]
      }
      ctx.stroke()
      if (tp > 0 && tp < 1) {
        const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 20)
        g.addColorStop(0, 'rgba(255,236,170,1)'); g.addColorStop(1, 'rgba(245,180,0,0)')
        ctx.fillStyle = g; ctx.fillRect(hx - 20, hy - 20, 40, 40)
      }
      ctx.font = MONO; ctx.fillStyle = `rgba(245,180,0,${fade})`
      for (const lb of labels) if (tp >= lb.at) ctx.fillText(lb.text, lb.x, lb.y)

      // bricks
      const s = c - 1
      for (let i = 0; i < cells.length; i++) {
        const p = cells[i]
        if (t < p.d) continue
        const e = easeOut(clamp((t - p.d) / 600))
        ctx.fillStyle = t >= p.lit ? YEL : p.col
        ctx.fillRect(p.sx + (p.tx - p.sx) * e, p.sy + (p.ty - p.sy) * e, s, s)
      }
      const glow = clamp((t - LIGHT0) / 500)
      if (glow > 0) {
        const g = ctx.createRadialGradient(x0 + span / 2, ground, 0, x0 + span / 2, ground, span * 0.7)
        g.addColorStop(0, `rgba(245,180,0,${0.16 * glow})`); g.addColorStop(1, 'rgba(245,180,0,0)')
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      }
    }

    // ── zoom-through word ──
    const measure = async () => {
      try { await document.fonts.load('900 200px "Big Shoulders Display"') } catch { /* fallback */ }
      const fs = Math.min(H * 0.44, W * 0.36)
      const len = W * 0.9
      const m = document.createElement('canvas').getContext('2d')!
      m.font = `900 ${fs}px "Big Shoulders Display", Impact, sans-serif`
      const k = len / m.measureText('ARC PEM').width
      const y = H / 2 + fs * 0.34
      const oy = Math.round(y - fs * 0.34)
      // zoom into the stem of the P so the page fills the screen: rasterise the
      // word as the SVG lays it out and find the stem along the zoom row
      let ox = W * 0.05 + (m.measureText('ARC ').width + fs * 0.07) * k
      try {
        const off = document.createElement('canvas')
        off.width = W; off.height = H
        const o = off.getContext('2d')!
        o.font = m.font
        o.setTransform(k, 0, 0, 1, W * 0.05, 0)
        o.fillText('ARC PEM', 0, y)
        const row = o.getImageData(0, oy, W, 1).data
        let x = Math.floor(W * 0.05 + m.measureText('ARC ').width * k * 0.97)
        while (x < W && row[x * 4 + 3] < 128) x++
        const a = x
        while (x < W && row[x * 4 + 3] >= 128) x++
        if (x > a && x < W) ox = (a + x) / 2
      } catch { /* keep the estimate */ }
      const g = { w: W, h: H, fs, y, len, ox, oy }
      geomRef.current = g
      setWord(g)
    }
    measure()
    const zoomTo = (sc: number) => {
      const g = geomRef.current
      if (!g) return
      const tf = `translate(${g.ox} ${g.oy}) scale(${sc}) translate(${-g.ox} ${-g.oy})`
      zoomA.current?.setAttribute('transform', tf)
      zoomB.current?.setAttribute('transform', tf)
    }

    const offset = 0
    const start = performance.now()
    let raf = 0, phase = 0
    const loop = (now: number) => {
      const t = now - start + offset
      if (t < WORD) {
        draw(t)
        const pc = clamp(t / WORD)
        if (amtRef.current) amtRef.current.textContent = String(Math.round(120 * easeOut(clamp((t - 150) / (FILL1 + 150)))))
        if (pctRef.current) pctRef.current.textContent = `${String(Math.round(pc * 100)).padStart(3, '0')}%`
        if (tapeRef.current) tapeRef.current.style.transform = `scaleX(${pc})`
        if (stageRef.current) {
          stageRef.current.textContent = t < TR1 ? 'Sheet A-101 · Drawing elevation'
            : t < FILL1 ? 'Casting slabs · brick by brick'
            : 'Reconciling ledger · Tally ready'
        }
        if (t > FILL1) root.classList.add('is-total')
      } else if (t < ZOOM || !geomRef.current) {
        if (phase < 1 && geomRef.current) { phase = 1; root.classList.add('is-word') }
        zoomTo(1.3 - 0.3 * easeOut(clamp((t - WORD) / 420)))
      } else {
        if (phase < 2) { phase = 2; root.classList.add('is-word', 'is-zoom'); html.classList.remove('pl-lock'); reveal() }
        const k = clamp((t - ZOOM) / ZOOM_MS)
        zoomTo(1 + 140 * easeInExpo(k))
        if (svgRef.current) svgRef.current.style.opacity = String(1 - clamp((k - 0.72) / 0.28))
        if (k >= 1) { setDone(true); return }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); html.classList.remove('pl-lock') }
  }, [])

  if (done) return null

  return (
    <div ref={rootRef} className="pl" role="status" aria-live="polite" aria-label="Loading ARC PEM">
      <noscript><style>{'.pl{display:none!important}'}</style></noscript>
      <canvas ref={cvRef} className="pl-canvas" aria-hidden="true" />

      <div className="pl-hud" aria-hidden="true">
        <i className="pl-tape" ref={tapeRef} />
        <div className="pl-top">
          <span className="pl-kick">ARC PEM · Site ledger</span>
          <span className="pl-stage" ref={stageRef}>Sheet A-101 · Drawing elevation</span>
        </div>
        <div className="pl-count">
          <div className="pl-num"><em>₹</em><span ref={amtRef}>0</span><small>Cr</small><b>+</b></div>
          <div className="pl-lbl">Construction spend tracked on ARC PEM</div>
          <div className="pl-sub">30+ Indian architecture &amp; construction firms</div>
        </div>
        <div className="pl-foot">
          <span>Plan · Engineer · Manage</span>
          <span ref={pctRef}>000%</span>
        </div>
      </div>

      {word && (
        <svg ref={svgRef} className="pl-word" width={word.w} height={word.h} viewBox={`0 0 ${word.w} ${word.h}`} aria-hidden="true">
          <defs>
            <mask id="pl-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={word.w} height={word.h}>
              <rect width={word.w} height={word.h} fill="#fff" />
              <g ref={zoomA}>
                <text x={word.w / 2} y={word.y} textAnchor="middle" textLength={word.len} lengthAdjust="spacingAndGlyphs"
                  fontSize={word.fs} className="pl-word-t" fill="#000">ARC PEM</text>
              </g>
            </mask>
          </defs>
          <rect width={word.w} height={word.h} fill={INK} mask="url(#pl-mask)" />
          <g ref={zoomB}>
            <text x={word.w / 2} y={word.y} textAnchor="middle" textLength={word.len} lengthAdjust="spacingAndGlyphs"
              fontSize={word.fs} className="pl-word-t" fill="none" stroke={YEL} strokeWidth="2" vectorEffect="non-scaling-stroke">ARC PEM</text>
          </g>
        </svg>
      )}
    </div>
  )
}
