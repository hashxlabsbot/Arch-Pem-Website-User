'use client'

import { useState } from 'react'
import { LinkIcon, CheckIcon } from '@/components/icons'

/**
 * Copies the current URL (with the calculator's inputs already encoded as
 * query params by the parent) so a contractor can send a live-editable link
 * to a client or site supervisor instead of re-describing the numbers.
 */
export default function ShareButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = window.location.href
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" className={`share-link-btn${className ? ` ${className}` : ''}`} onClick={copy}>
      {copied ? <CheckIcon size={15} color="#10b981" /> : <LinkIcon size={15} color="currentColor" />}
      {copied ? 'Link copied!' : 'Share this calculation'}
    </button>
  )
}
