'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-triggered reveal state for a section's illustration.
 * 'idle' on the server (content visible without JS), 'armed' once mounted and
 * waiting off-screen, 'in' when it scrolls into view. Reduced-motion users go
 * straight to 'in'. CSS keys off the value via the data-reveal attribute.
 */
export type RevealState = 'idle' | 'armed' | 'in'

export function useReveal<T extends Element>(rootMargin = '0px 0px -18% 0px') {
  const ref = useRef<T | null>(null)
  const [state, setState] = useState<RevealState>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      setState('in')
      return
    }
    setState('armed')
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('in')
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return [ref, state] as const
}

/** Cursor-following spotlight: sets --mx / --my on the hovered [data-spot] card. */
export function trackSpotlight(e: React.MouseEvent<HTMLElement>) {
  const card = (e.target as HTMLElement).closest<HTMLElement>('[data-spot]')
  if (!card) return
  const r = card.getBoundingClientRect()
  card.style.setProperty('--mx', `${e.clientX - r.left}px`)
  card.style.setProperty('--my', `${e.clientY - r.top}px`)
}
