'use client'

import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * "ARC PEM" drawn as particles: text is rasterised off-screen, sampled into
 * dots, which fly in when visible and are pushed away by the cursor.
 */
export default function DotWord({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    let w = 0, h = 0, dpr = 1, raf = 0, visible = false, assembled = 0
    let pts: { hx: number; hy: number; x: number; y: number; vx: number; vy: number; c: string }[] = []
    let mx = -9999, my = -9999

    const build = async () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = cv.clientWidth; h = cv.clientHeight
      cv.width = w * dpr; cv.height = h * dpr
      try { await document.fonts.load('800 200px "Bricolage Grotesque"') } catch { /* fallback font is fine */ }
      const off = document.createElement('canvas')
      off.width = w; off.height = h
      const o = off.getContext('2d')!
      let size = h * 0.92
      o.font = `800 ${size}px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif`
      const tw = o.measureText('ARC PEM').width
      if (tw > w * 0.96) { size *= (w * 0.96) / tw; o.font = `800 ${size}px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif` }
      o.textAlign = 'center'; o.textBaseline = 'alphabetic'
      o.fillStyle = '#fff'
      o.fillText('ARC PEM', w / 2, h * 0.86)
      const data = o.getImageData(0, 0, w, h).data
      const gap = w < 700 ? 4 : 6
      const next: typeof pts = []
      for (let y = 0; y < h; y += gap) {
        for (let x = 0; x < w; x += gap) {
          if (data[(y * w + x) * 4 + 3] > 128) {
            const t = x / w
            // safety yellow (245,180,0) → brick (201,96,58) across the word
            const c = `rgb(${Math.round(245 - t * 44)}, ${Math.round(180 - t * 84)}, ${Math.round(t * 58)})`
            next.push({ hx: x, hy: y, x: reduce ? x : Math.random() * w, y: reduce ? y : h + Math.random() * h, vx: 0, vy: 0, c })
          }
        }
      }
      pts = next
      assembled = reduce ? 1 : 0
    }

    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      if (assembled < 1) assembled = Math.min(1, assembled + 0.012)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const pull = 0.02 + assembled * 0.06
      for (const pt of pts) {
        const dx = pt.x - mx, dy = pt.y - my
        const d2 = dx * dx + dy * dy
        if (d2 < 9000) { const f = (9000 - d2) / 9000 * 2.4; const d = Math.sqrt(d2) || 1; pt.vx += (dx / d) * f; pt.vy += (dy / d) * f }
        pt.vx += (pt.hx - pt.x) * pull; pt.vy += (pt.hy - pt.y) * pull
        pt.vx *= 0.82; pt.vy *= 0.82
        pt.x += pt.vx; pt.y += pt.vy
        const speed = Math.min(1, Math.abs(pt.vx) + Math.abs(pt.vy))
        ctx.fillStyle = pt.c
        ctx.globalAlpha = 0.78 + speed * 0.22
        ctx.fillRect(pt.x, pt.y, 2.6, 2.6)
      }
      ctx.globalAlpha = 1
    }

    const onMove = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top }
    const onLeave = () => { mx = -9999; my = -9999 }
    build()
    const ro = new ResizeObserver(() => build()); ro.observe(cv)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.15 }); io.observe(cv)
    cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerleave', onLeave) }
  }, [reduce])
  return <canvas ref={ref} className={className} role="img" aria-label="ARC PEM" />
}
