'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'arcpem.cookieConsent'

/**
 * Minimal cookie-consent notice. We use essential cookies (auth/session) plus
 * Google Analytics for aggregate usage stats — no ad-targeting cookies — so
 * this is an acknowledgement rather than a granular opt-in. The choice is
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
    <div role="dialog" aria-label="Cookie notice" className="ck">
      <style>{`
        .ck{position:fixed;left:16px;right:16px;bottom:16px;z-index:1200;max-width:600px;margin:0 auto;
          background:#12100d;color:#efe9df;border:1px solid rgba(239,233,223,.16);border-top:5px solid #f5b400;border-radius:2px;
          padding:16px 18px 16px;box-shadow:6px 6px 0 rgba(18,16,13,.35),0 18px 40px rgba(0,0,0,.28);
          display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:.76rem;line-height:1.6}
        .ck-t{flex:1;min-width:220px}
        .ck-k{display:block;font-weight:600;font-size:.64rem;letter-spacing:.18em;text-transform:uppercase;color:#f5b400;margin-bottom:4px}
        .ck a{color:#efe9df;text-decoration:underline;text-decoration-color:#b9502c;text-decoration-thickness:2px;text-underline-offset:3px}
        .ck a:hover{color:#f5b400}
        .ck button{background:#f5b400;color:#12100d;border:2px solid #12100d;border-radius:2px;padding:9px 20px;cursor:pointer;
          font-family:'Big Shoulders Display','Bricolage Grotesque',Impact,sans-serif;font-weight:800;font-size:1rem;letter-spacing:.06em;text-transform:uppercase;
          box-shadow:3px 3px 0 #b9502c;transition:transform .12s,box-shadow .12s}
        .ck button:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #b9502c}
        .ck button:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #b9502c}
        @media(max-width:520px){.ck{bottom:78px}.ck button{width:100%}}
      `}</style>
      <span className="ck-t">
        <span className="ck-k">Site notice · Cookies</span>
        We use essential cookies to keep you signed in, plus Google Analytics to understand site usage. See our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </span>
      <button onClick={accept}>Got it</button>
    </div>
  )
}
