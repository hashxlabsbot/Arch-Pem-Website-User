'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, Mail, ShieldCheck, User, Building2, Lock, X, ExternalLink } from 'lucide-react'
import LogoMark from '@/components/LogoMark'
import { DocumentIcon, GoogleIcon } from '@/components/icons'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const preplan = params.get('plan') ?? ''

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [company,  setCompany]  = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [plan]                  = useState(preplan)
  const [focused,  setFocused]  = useState<string | null>(null)

  const [step,     setStep]     = useState<'form' | 'otp'>('form')
  const [otp,      setOtp]      = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [error,   setError]   = useState('')
  const [legalOpen, setLegalOpen] = useState<'terms' | 'privacy' | null>(null)

  useEffect(() => {
    getProviders().then(providers => setGoogleEnabled(!!providers?.google))
  }, [])

  function handleGoogleSignUp() {
    setGoogleLoading(true)
    signIn('google', { callbackUrl: '/dashboard' })
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(c => (c <= 1 ? (clearInterval(id), 0) : c - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  useEffect(() => {
    if (step === 'otp') setTimeout(() => otpRefs.current[0]?.focus(), 80)
  }, [step])

  const pwStrength = password.length === 0 ? 0
    : password.length < 8  ? 1
    : password.length < 12 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981']

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: '11px',
    fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
    background: '#fafafa', transition: 'all 0.15s', boxSizing: 'border-box',
    color: '#0f172a',
  }
  const inputStyle = (field: string): React.CSSProperties => ({
    ...inputBase,
    border:    focused === field ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
    boxShadow: focused === field ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
    background: focused === field ? 'white' : '#fafafa',
  })
  const iconInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle(field),
    paddingLeft: '38px',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send code.'); setLoading(false); return }
      setOtp(['', '', '', '', '', ''])
      setCooldown(60)
      setStep('otp')
    } catch {
      setError('Could not connect. Please try again.')
    }
    setLoading(false)
  }

  function handleOtpChange(i: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]; next[i] = value.slice(-1); setOtp(next)
    if (value && i < 5) otpRefs.current[i + 1]?.focus()
  }
  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft'  && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus()
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (digits.length === 6) { setOtp(digits.split('')); otpRefs.current[5]?.focus() }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return }
    setLoading(true); setError('')
    try {
      const payload: Record<string, string> = { email, name, password, otp: code }
      if (company) payload.company  = company
      if (plan)    payload.planName = plan
      const res  = await fetch('/api/auth/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Verification failed.'); setLoading(false); return }
      router.push('/login?registered=true')
    } catch {
      setError('Could not connect. Please try again.')
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0) return
    setError(''); setLoading(true)
    try {
      const res  = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to resend.'); setLoading(false); return }
      setOtp(['', '', '', '', '', '']); setCooldown(60)
      otpRefs.current[0]?.focus()
    } catch { setError('Could not connect. Please try again.') }
    setLoading(false)
  }

  const ErrorBanner = error ? (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
      borderRadius: '12px', padding: '11px 13px', marginBottom: '18px',
    }}>
      <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
      <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>{error}</span>
    </div>
  ) : null

  /* ── Step indicator ── */
  const StepIndicator = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
      {[
        { n: 1, label: 'Details', active: step === 'form', done: step === 'otp' },
        { n: 2, label: 'Verify',  active: step === 'otp',  done: false },
      ].map(({ n, label, active, done }, i) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: done ? '#10b981' : active ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 800,
              color: active || done ? 'white' : '#94a3b8',
              flexShrink: 0,
              boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
            }}>
              {done ? '✓' : n}
            </div>
            <span style={{
              fontSize: '0.74rem', fontWeight: active ? 700 : 500,
              color: active ? '#0f172a' : done ? '#10b981' : '#94a3b8',
            }}>{label}</span>
          </div>
          {i === 0 && (
            <div style={{ flex: 1, height: '1.5px', width: '32px', background: step === 'otp' ? '#10b981' : '#e2e8f0', borderRadius: '2px' }} />
          )}
        </div>
      ))}
    </div>
  )

  /* ════════════════════════════════════════
     OTP STEP
  ════════════════════════════════════════ */
  if (step === 'otp') {
    const otpFull = otp.join('').length === 6
    return (
      <>
        {StepIndicator}

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '15px', marginBottom: '18px',
            background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.03em' }}>
            Check your email
          </h2>
          <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: '#0f172a' }}>{email}</strong>
          </p>
        </div>

        {ErrorBanner}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Verification Code
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: '46px', height: '56px', textAlign: 'center',
                    fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace',
                    borderRadius: '12px', outline: 'none', transition: 'all 0.15s',
                    border: digit ? '2px solid #6366f1' : '1.5px solid #e2e8f0',
                    background: digit ? 'rgba(99,102,241,0.05)' : '#fafafa',
                    boxShadow: digit ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
                    color: '#0f172a', caretColor: '#6366f1',
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit" disabled={loading || !otpFull}
            style={{
              width: '100%', padding: '13px',
              background: (loading || !otpFull) ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '0.88rem', fontWeight: 800,
              cursor: (loading || !otpFull) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit',
              boxShadow: (loading || !otpFull) ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
            }}
          >
            {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Verifying…' : 'Verify & Create Account →'}
          </button>
        </form>

        {/* Resend + hint */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '4px' }}>
            Didn&apos;t receive the code?{' '}
            {cooldown > 0 ? (
              <span style={{ color: '#6366f1', fontWeight: 700 }}>Resend in {cooldown}s</span>
            ) : (
              <button onClick={handleResend} disabled={loading} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: '#6366f1', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'inherit',
              }}>
                Resend code
              </button>
            )}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Code expires in 10 minutes</p>
        </div>

        <div style={{
          marginTop: '18px', padding: '12px 14px', borderRadius: '11px',
          background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <Mail size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <span style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
            Check your spam folder if you don&apos;t see it within a minute.
          </span>
        </div>

        <button
          onClick={() => { setStep('form'); setError('') }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '14px 0 0',
            fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto',
          }}
        >
          ← Back to details
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    )
  }

  /* ════════════════════════════════════════
     FORM STEP
  ════════════════════════════════════════ */
  return (
    <>
      {StepIndicator}

      <div style={{ marginBottom: '22px' }}>
        <LogoMark size={21} style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '4px', letterSpacing: '-0.03em' }}>
          Create your account
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>
          Create your account to purchase and download ARC PEM
        </p>
      </div>

      {ErrorBanner}

      {/* Google sign-up */}
      {googleEnabled && (
        <>
          <button
            type="button" onClick={handleGoogleSignUp} disabled={googleLoading}
            style={{
              width: '100%', padding: '12px', marginBottom: '18px',
              background: 'white', color: '#0f172a',
              border: '1.5px solid #e2e8f0', borderRadius: '12px',
              fontSize: '0.87rem', fontWeight: 700, cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              fontFamily: 'inherit', transition: 'all 0.15s',
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {googleLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#94a3b8' }} /> : <GoogleIcon size={17} />}
            {googleLoading ? 'Redirecting…' : 'Sign up with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>OR SIGN UP WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Name + Email row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: focused === 'name' ? '#6366f1' : '#94a3b8', pointerEvents: 'none' }} />
              <input type="text" value={name} required autoComplete="name" placeholder="Your Name"
                onChange={e => setName(e.target.value)}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                style={iconInputStyle('name')} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#6366f1' : '#94a3b8', pointerEvents: 'none' }} />
              <input type="email" value={email} required autoComplete="email" placeholder="you@firm.com"
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={iconInputStyle('email')} />
            </div>
          </div>
        </div>

        {/* Company */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Firm / Studio <span style={{ color: '#cbd5e1', fontWeight: 500 }}>(optional)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: focused === 'company' ? '#6366f1' : '#94a3b8', pointerEvents: 'none' }} />
            <input type="text" value={company} autoComplete="organization" placeholder="Skyline Architects"
              onChange={e => setCompany(e.target.value)}
              onFocus={() => setFocused('company')} onBlur={() => setFocused(null)}
              style={iconInputStyle('company')} />
          </div>
        </div>

        {/* Password + strength */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#374151', marginBottom: '5px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={13} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: focused === 'password' ? '#6366f1' : '#94a3b8', pointerEvents: 'none' }} />
            <input
              type={showPw ? 'text' : 'password'} value={password} required autoComplete="new-password"
              placeholder="Min. 8 characters"
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
              style={{ ...iconInputStyle('password'), paddingRight: '44px' }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
              display: 'flex', alignItems: 'center', padding: 0,
            }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px', alignItems: 'center' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  height: '3px', flex: 1, borderRadius: '100px',
                  background: i <= pwStrength ? strengthColor[pwStrength] : '#e2e8f0',
                  transition: 'background 0.2s',
                }} />
              ))}
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: strengthColor[pwStrength], marginLeft: '6px', whiteSpace: 'nowrap' }}>
                {strengthLabel[pwStrength]}
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '0.88rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', marginTop: '4px',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          {loading && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Sending code…' : 'Continue →'}
        </button>

        {/* Trust bullets */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', paddingTop: '4px' }}>
          {['✓ One-year license', '✓ 12 months of updates', '✓ Secure checkout'].map(t => (
            <span key={t} style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>{t}</span>
          ))}
        </div>

        <p style={{ fontSize: '0.68rem', color: '#cbd5e1', textAlign: 'center', lineHeight: 1.5, margin: 0 }}>
          By creating an account you agree to our{' '}
          <button type="button" onClick={() => setLegalOpen('terms')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', textDecoration: 'underline', fontSize: 'inherit', fontFamily: 'inherit' }}>Terms of Service</button>
          {' '}and{' '}
          <button type="button" onClick={() => setLegalOpen('privacy')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#94a3b8', textDecoration: 'underline', fontSize: 'inherit', fontFamily: 'inherit' }}>Privacy Policy</button>
        </p>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '18px 0 14px' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 600 }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
      </div>

      <p style={{ textAlign: 'center', fontSize: '0.84rem', color: '#64748b' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#6366f1', fontWeight: 800, textDecoration: 'none' }}>Sign in →</a>
      </p>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        <a href="/" style={{ fontSize: '0.74rem', color: '#cbd5e1', textDecoration: 'none' }}>← Back to website</a>
      </p>

      {/* ── Legal modal ── */}
      {legalOpen && (
        <div
          onClick={() => setLegalOpen(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
            background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '90vw', maxWidth: '860px', height: '85vh',
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderBottom: '1px solid #f1f5f9', flexShrink: 0,
              background: '#fafafa',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <DocumentIcon size={15} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>
                  {legalOpen === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={legalOpen === 'terms' ? '/terms' : '/privacy'}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    fontSize: '0.72rem', color: '#6366f1', fontWeight: 600,
                    textDecoration: 'none', padding: '5px 10px', borderRadius: '8px',
                    background: 'rgba(99,102,241,0.08)',
                  }}
                >
                  <ExternalLink size={11} /> Open in new tab
                </a>
                <button
                  onClick={() => setLegalOpen(null)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', background: '#f1f5f9', color: '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            {/* Content */}
            <iframe
              src={legalOpen === 'terms' ? '/terms' : '/privacy'}
              title={legalOpen === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              style={{ flex: 1, border: 'none', width: '100%' }}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
