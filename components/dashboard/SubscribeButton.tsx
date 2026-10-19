'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck, X } from 'lucide-react'
import type { BillingInterval, SeatAddons } from '@/lib/pricing'

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void }

function loadCheckout(): Promise<RazorpayCtor | null> {
  return new Promise((resolve) => {
    const w = window as unknown as { Razorpay?: RazorpayCtor }
    if (w.Razorpay) return resolve(w.Razorpay)
    const done = () => resolve(w.Razorpay ?? null)
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', done)
      existing.addEventListener('error', () => resolve(null))
      return
    }
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.onload = done
    script.onerror = () => resolve(null)
    document.body.appendChild(script)
  })
}

/**
 * Starts an auto-renewing ARC PEM subscription: the server creates it, Razorpay Checkout collects the first payment
 * and sets up auto-pay (card, UPI AutoPay or bank e-mandate), and the server confirms it before we say so.
 */
export default function SubscribeButton({
  planId,
  planName,
  interval,
  addons,
  userName,
  userEmail,
  label,
  primary = true,
}: {
  planId: string
  planName: string
  interval: BillingInterval
  addons: SeatAddons
  userName: string
  userEmail: string
  label: string
  primary?: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<'' | 'opening' | 'confirming'>('')
  const [error, setError] = useState('')
  const [done, setDone] = useState<'' | 'active' | 'pending' | 'trial'>('')
  const close = () => {
    setDone('')
    router.refresh()
  }

  async function start() {
    if (busy) return
    setError('')
    setBusy('opening')
    try {
      const Razorpay = await loadCheckout()
      if (!Razorpay) throw new Error('Could not load the payment window. Check your connection and try again.')
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, interval, extraSeats: addons.seats, extraSiteSeats: addons.siteSeats }),
      })
      const sub = await res.json()
      if (!res.ok) throw new Error(sub.error ?? 'Could not start payment. Please try again.')

      const rzp = new Razorpay({
        key: sub.keyId,
        subscription_id: sub.subscriptionId,
        name: 'ARC PEM',
        description: sub.trialEndsAt
          ? `${planName} · free trial, first charge on ${new Date(sub.trialEndsAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
          : `${planName} · ${interval === 'MONTH' ? 'billed monthly' : 'billed annually'} · auto-renews`,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#6366f1' },
        handler: async (r: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
          setBusy('confirming')
          try {
            const v = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(r),
            })
            const data = await v.json()
            if (!v.ok) throw new Error(data.error)
            setDone(data.trial ? 'trial' : data.pending ? 'pending' : 'active')
          } catch (err) {
            setError(
              (err as Error).message ||
                'We could not confirm your payment yet. If you were charged, your plan activates within a few minutes.',
            )
          } finally {
            setBusy('')
          }
        },
        modal: { ondismiss: () => setBusy('') },
      })
      rzp.on('payment.failed', (resp) => {
        setError((resp as { error?: { description?: string } })?.error?.description ?? 'Payment failed. Please try again.')
        setBusy('')
      })
      rzp.open()
      setBusy('')
    } catch (err) {
      setError((err as Error).message || 'Something went wrong starting the payment. Please try again.')
      setBusy('')
    }
  }

  return (
    <>
      <button
        onClick={start}
        disabled={Boolean(busy)}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold"
        style={{
          border: primary ? 0 : '1px solid #c7d2fe',
          color: primary ? '#fff' : '#4f46e5',
          background: primary ? 'linear-gradient(100deg, #7c3aed, #6366f1 50%, #3b82f6)' : '#eef2ff',
          opacity: busy ? 0.7 : 1,
          cursor: busy ? 'wait' : 'pointer',
        }}
      >
        {busy && <Loader2 size={14} className="animate-spin" />}
        {busy === 'confirming' ? 'Confirming…' : busy === 'opening' ? 'Opening checkout…' : label}
      </button>
      {error && !done && (
        <div className="flex items-start gap-1.5 text-xs mt-2" style={{ color: '#dc2626' }}>
          <AlertCircle size={12} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}
      {done && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="relative p-6" style={{ background: 'linear-gradient(120deg, #7c3aed, #6366f1 55%, #3b82f6)' }}>
              <button onClick={close} aria-label="Close" className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg text-white" style={{ background: 'rgba(255,255,255,.18)' }}>
                <X size={14} />
              </button>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.75)' }}>
                {done === 'trial' ? 'Free trial started' : done === 'active' ? 'Subscription active' : 'Payment received'}
              </div>
              <div className="mt-1 text-xl font-black text-white">{planName}</div>
            </div>
            <div className="p-6 text-center">
              <CheckCircle2 size={40} className="mx-auto mb-3" style={{ color: '#10b981' }} />
              <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
                {done === 'trial'
                  ? 'Your firm’s workspace is ready. Auto-pay is set up and nothing is charged until your trial ends — turn off auto-renew before then and you pay nothing.'
                  : done === 'active'
                  ? `Your firm's workspace is ready. Auto-pay is set up, so your plan renews ${interval === 'MONTH' ? 'every month' : 'every year'} without you doing anything. A receipt is on its way to your inbox.`
                  : 'Auto-pay is set up and your first payment is being confirmed by your bank. Your plan activates within a few minutes; we will email you when it does.'}
              </p>
              <p className="mt-3 flex items-center justify-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                <ShieldCheck size={12} /> Secured by Razorpay
              </p>
              <button onClick={close} className="mt-5 rounded-xl px-6 py-2.5 text-sm font-bold text-white" style={{ background: '#0f172a' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
