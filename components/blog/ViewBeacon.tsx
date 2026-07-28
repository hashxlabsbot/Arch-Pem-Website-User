'use client'

import { useEffect } from 'react'

/**
 * Fires a single view beacon per browser session per article, so a refresh or
 * re-navigation within the same tab doesn't inflate counts. Renders nothing.
 */
export default function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `bv:${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      /* private mode / storage blocked — still count, just may repeat */
    }
    fetch('/api/blog/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {})
  }, [slug])

  return null
}
