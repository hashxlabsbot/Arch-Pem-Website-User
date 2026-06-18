'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'arcpem.cookieConsent'

/**
 * Minimal cookie-consent notice. We only use essential cookies (auth/session),
 * so this is an acknowledgement rather than a granular opt-in. The choice is
 * persisted in localStorage so it shows once.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
    } catch {
      /* localStorage unavailable — don't block the page */
    }
  }, [])

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, 'accepted') } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      style={{
        position: 'fixed', left: '16px', right: '16px', bottom: '16px', zIndex: 1200,
        maxWidth: '560px', margin: '0 auto',
        background: '#0f172a', color: '#e2e8f0',
        borderRadius: '14px', padding: '16px 18px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
        fontSize: '0.82rem', lineHeight: 1.5,
      }}
    >
      <span style={{ flex: 1, minWidth: '220px' }}>
        We use only essential cookies to keep you signed in and operate the service. See our{' '}
        <a href="/privacy" style={{ color: '#93c5fd' }}>Privacy Policy</a>.
      </span>
      <button
        onClick={accept}
        style={{
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
          border: 'none', borderRadius: '9px', padding: '8px 18px',
          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        Got it
      </button>
    </div>
  )
}
