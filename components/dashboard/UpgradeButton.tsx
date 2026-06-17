'use client'

import { useState } from 'react'
import QRCode from 'react-qr-code'
import { Copy, CheckCheck, X, Loader2, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react'

const UPI_ID   = '93105302202ybl'
const UPI_NAME = 'ARC PEM'

interface Props {
  planId:    string
  planName:  string
  price:     number
  userName:  string
  userEmail: string
}

export default function UpgradeButton({ planId, planName, price }: Props) {
  const [open, setOpen]       = useState(false)
  const [copied, setCopied]   = useState(false)
  const [utr, setUtr]         = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

  const upiString = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${price}&cu=INR&tn=${encodeURIComponent(planName + ' Plan - ARC PEM')}`

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function closeModal() {
    if (success) return
    setOpen(false)
    setUtr('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!utr.trim()) { setError('Enter your UTR / Transaction ID'); return }
    setSubmitting(true)
    setError('')

    const res = await fetch('/api/payment/upi-submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ planId, planName, amount: price, utr }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) { setError(data.error ?? 'Submission failed. Try again.'); return }
    setSuccess(true)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', padding: '10px',
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          color: 'white', border: 'none', borderRadius: '10px',
          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Upgrade →
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '420px',
            margin: '16px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            overflow: 'hidden',
          }}>

            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
              padding: '20px 24px 24px',
              position: 'relative',
            }}>
              {!success && (
                <button onClick={closeModal} style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  borderRadius: '8px', width: '28px', height: '28px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'white',
                }}>
                  <X size={14} />
                </button>
              )}
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Upgrading to
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{planName} Plan</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#60a5fa', marginTop: '2px' }}>
                ₹{price.toLocaleString('en-IN')}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>/month</span>
              </div>
            </div>

            <div style={{ padding: '24px' }}>

              {success ? (
                /* Success state */
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'rgba(16,185,129,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <CheckCircle2 size={28} style={{ color: '#10b981' }} />
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Payment Submitted!
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.5', marginBottom: '20px' }}>
                    We&apos;ve received your UTR. Our team will verify your payment and activate your plan within <strong>2–4 hours</strong>.
                    You&apos;ll see the update in your dashboard.
                  </p>
                  <button
                    onClick={() => { setOpen(false); setSuccess(false); setUtr('') }}
                    style={{
                      padding: '10px 24px', background: '#f1f5f9', border: 'none',
                      borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700,
                      cursor: 'pointer', color: '#0f172a', fontFamily: 'inherit',
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* QR Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{
                      background: '#fff', padding: '12px', borderRadius: '12px',
                      border: '1px solid #e2e8f0', marginBottom: '12px',
                    }}>
                      <QRCode value={upiString} size={160} />
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '10px' }}>
                      Scan with PhonePe, GPay, Paytm, or BHIM
                    </p>

                    {/* UPI ID row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      borderRadius: '10px', padding: '8px 12px', width: '100%',
                    }}>
                      <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: '#334155', fontFamily: 'monospace' }}>
                        {UPI_ID}
                      </span>
                      <button
                        onClick={copyUpiId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: copied ? 'rgba(16,185,129,0.1)' : '#f1f5f9',
                          border: 'none', borderRadius: '7px', padding: '5px 10px',
                          fontSize: '0.72rem', fontWeight: 700,
                          color: copied ? '#10b981' : '#64748b',
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {copied ? <><CheckCheck size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>

                    {/* Open in app */}
                    <a
                      href={upiString}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        marginTop: '8px', width: '100%', padding: '9px',
                        background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
                        color: 'white', borderRadius: '10px',
                        fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none',
                      }}
                    >
                      <ExternalLink size={13} />
                      Open in PhonePe / GPay
                    </a>
                  </div>

                  {/* UTR form */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px', lineHeight: '1.5' }}>
                      After paying, enter your <strong>UTR / Transaction ID</strong> from the payment confirmation. We&apos;ll verify and activate your plan.
                    </p>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        value={utr}
                        onChange={e => { setUtr(e.target.value); setError('') }}
                        placeholder="e.g. 506123456789 or T2506XXXXXXXX"
                        style={{
                          width: '100%', padding: '10px 14px', marginBottom: '10px',
                          border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                          borderRadius: '10px', fontSize: '0.82rem', outline: 'none',
                          fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                      />
                      {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '0.74rem', marginBottom: '10px' }}>
                          <AlertCircle size={12} /> {error}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          width: '100%', padding: '11px',
                          background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                          color: 'white', border: 'none', borderRadius: '10px',
                          fontSize: '0.85rem', fontWeight: 700,
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          fontFamily: 'inherit',
                        }}
                      >
                        {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                        {submitting ? 'Submitting…' : 'Submit & Confirm Payment'}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
