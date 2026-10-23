'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Turns auto-renew off after a confirmation; the firm keeps access to the end of the paid period. */
export default function CancelAutoRenew({ accessUntil }: { accessUntil: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function cancel() {
    if (!confirm(`Turn off auto-renew? Nothing more will be charged, and your firm keeps full access until ${accessUntil}.`)) return
    setBusy(true)
    setError('')
    const res = await fetch('/api/subscription/cancel', { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) return setError(data.error ?? 'Could not turn off auto-renew. Please try again.')
    router.refresh()
  }

  return (
    <div>
      <button
        onClick={cancel}
        disabled={busy}
        className="text-xs font-semibold underline underline-offset-2"
        style={{ color: '#64748b', cursor: busy ? 'wait' : 'pointer', background: 'none', border: 0, padding: 0, font: 'inherit', fontSize: '0.75rem' }}
      >
        {busy ? 'Turning off…' : 'Turn off auto-renew'}
      </button>
      {error && <div className="mt-1 text-xs" style={{ color: '#dc2626' }}>{error}</div>}
    </div>
  )
}
