'use client'

import { useEffect, useState } from 'react'

/** Thin fixed bar at the top of the viewport showing scroll progress through the article. */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    function onScroll() {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const scrollable = scrollHeight - clientHeight
      setPct(scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return <div className="reading-progress" style={{ width: `${pct}%` }} aria-hidden="true" />
}
