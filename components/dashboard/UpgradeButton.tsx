'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

interface Props {
  planId:    string
  planName:  string
  price:     number
  userName:  string
  userEmail: string
  label?:    string
}

// Razorpay injects this global once checkout.js is loaded.
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void }
  }
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.Razorpay) return resolve(true)
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(true))
      existing.addEventListener('error', () => resolve(false))
      return
    }
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function UpgradeButton({ planId, planName, userName, userEmail, label = 'Upgrade →' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)    // creating order / opening checkout
  const [verifying, setVerifying] = useState(false) // post-payment verification
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  async function handleUpgrade() {
    if (loading || verifying) return
    setError('')
    setLoading(true)

    try {
      const ok = await loadCheckout()
      if (!ok || !window.Razorpay) {
        setError('Could not load the payment window. Check your connection and try again.')
        setLoading(false)
        return
      }

      // 1) Create the order server-side (amount + notes are set there, not here).
      const orderRes = await fetch('/api/payment/create-order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId }),
      })
      const order = await orderRes.json()
      if (!orderRes.ok) {
        setError(order.error ?? 'Could not start payment. Please try again.')
        setLoading(false)
        return
      }

      // 2) Open Razorpay Checkout.
      const rzp = new window.Razorpay({
        key:         order.keyId,
        order_id:    order.orderId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'ARC PEM',
        description: `${order.planName} Plan`,
        prefill:     { name: userName, email: userEmail },
        theme:       { color: '#4f46e5' },
        // 3) On success, verify server-side before we trust anything.
        handler: async (response: unknown) => {
          const r = response as {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }
          setVerifying(true)
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                razorpay_order_id:   r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature:  r.razorpay_signature,
              }),
            })
            const data = await verifyRes.json()
            if (!verifyRes.ok) {
              setError(data.error ?? 'We could not confirm your payment. If you were charged, it will be activated shortly — contact support if not.')
              setVerifying(false)
              return
            }
            setVerifying(false)
            setSuccess(true)
            // router.refresh() is deferred to after the user closes the success modal,
            // otherwise the page re-render unmounts this component (plan card switches to
            // "Current Plan") before the modal is seen, causing it to blink and vanish.
          } catch {
            setError('We could not confirm your payment. If you were charged, it will be activated shortly — contact support if not.')
            setVerifying(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })

      rzp.on('payment.failed', (resp: unknown) => {
        const desc = (resp as { error?: { description?: string } })?.error?.description
        setError(desc ?? 'Payment failed. Please try again.')
        setLoading(false)
      })

      rzp.open()
      // Checkout is now open; its own modal takes over, so clear our loading state.
      setLoading(false)
    } catch {
      setError('Something went wrong starting the payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleUpgrade}
        disabled={loading || verifying}
        style={{
          width: '100%', padding: '10px',
          background: loading || verifying ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '0.8rem', fontWeight: 700,
          cursor: loading || verifying ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        }}
      >
        {(loading || verifying) && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
        {verifying ? 'Confirming…' : loading ? 'Loading…' : label}
      </button>

      <p style={{ fontSize: '0.66rem', color: '#94a3b8', textAlign: 'center', marginTop: '8px', lineHeight: 1.4 }}>
        By upgrading you agree to our{' '}
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>Terms</a> and{' '}
        <a href="/refund" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>Refund Policy</a>.
      </p>

      {error && !success && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#dc2626', fontSize: '0.72rem', marginTop: '8px', lineHeight: 1.4 }}>
          <AlertCircle size={12} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
        </div>
      )}

      {success && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setSuccess(false); router.refresh() } }}
        >
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '380px',
            margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', overflow: 'hidden',
          }}>
            <div style={{ background: 'linear-gradient(135deg, #0f766e, #10b981)', padding: '24px', position: 'relative' }}>
              <button onClick={() => { setSuccess(false); router.refresh() }} style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'rgba(255,255,255,0.18)', border: 'none', borderRadius: '8px',
                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
              }}><X size={14} /></button>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Payment successful</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>{planName} Plan activated</div>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={28} style={{ color: '#10b981' }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, marginBottom: '8px' }}>
                Your <strong>{planName}</strong> plan is now active. A receipt has been emailed to you.
              </p>
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '20px' }}>
                <ShieldCheck size={12} /> Secured by Razorpay
              </p>
              <button
                onClick={() => { setSuccess(false); router.refresh() }}
                style={{
                  padding: '10px 24px', background: '#0f172a', border: 'none', borderRadius: '10px',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: '#fff', fontFamily: 'inherit',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
