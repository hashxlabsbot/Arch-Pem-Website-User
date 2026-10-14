'use client'

import { useState, useRef, useEffect } from 'react'
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff, Lock, RotateCcw } from 'lucide-react'

type Step = 'email' | 'otp' | 'password' | 'done'

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const colors   = ['#ef4444', '#f59e0b', '#c9603a', '#10b981']
  const labels   = ['Weak', 'Fair', 'Good', 'Strong']
  if (!password) return null
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < strength ? colors[strength-1] : '#ddd5c7', transition: 'background 0.2s' }} />
        ))}
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: colors[strength-1] }}>{labels[strength-1]}</span>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [step,       setStep]       = useState<Step>('email')
  const [email,      setEmail]      = useState('')
  const [otp,        setOtp]        = useState(['', '', '', '', '', ''])
  const [password,   setPassword]   = useState('')
  const [confirm,    setConfirm]    = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [showCf,     setShowCf]     = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resendSecs, setResendSecs] = useState(0)
  const [focused,    setFocused]    = useState<string | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  // Resend countdown
  useEffect(() => {
    if (resendSecs <= 0) return
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendSecs])

  /* ── Step 1: Send OTP ── */
  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email address'); return }
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    setOtp(['','','','','',''])
    setStep('otp')
    setResendSecs(60)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  }

  /* ── OTP input handling ── */
  function handleOtpChange(i: number, val: string) {
    const digit = val.replace(/\D/, '').slice(-1)
    const next  = [...otp]; next[i] = digit; setOtp(next)
    if (digit && i < 5) otpRefs.current[i + 1]?.focus()
  }
  function handleOtpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length === 6) {
      setOtp(digits)
      otpRefs.current[5]?.focus()
    }
  }

  /* ── Step 2: Verify OTP ── */
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit code'); return }
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/verify-reset-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setResetToken(data.resetToken)
    setStep('password')
  }

  /* ── Step 3: Reset password ── */
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm)  { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const res  = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setStep('done')
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '11px 14px 11px 40px', borderRadius: '3px',
    fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
    background: 'white', transition: 'all 0.15s', boxSizing: 'border-box',
  }

  /* ── Step indicators ── */
  const steps = ['Email', 'Verify OTP', 'New Password']
  const stepIdx = step === 'email' ? 0 : step === 'otp' ? 1 : step === 'password' ? 2 : 3

  return (
    <>
      {/* Step bar */}
      {step !== 'done' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '28px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: i < 2 ? 1 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i < stepIdx ? '#10b981' : i === stepIdx ? 'linear-gradient(135deg,#b9502c,#c9603a)' : '#ebe5da',
                  color: i <= stepIdx ? 'white' : '#8f8778',
                }}>
                  {i < stepIdx ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: i === stepIdx ? '#1c1a17' : '#8f8778' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: '1.5px', background: i < stepIdx ? '#10b981' : '#ddd5c7' }} />}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '3px', padding: '12px 14px', marginBottom: '20px',
        }}>
          <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      {/* ── STEP 1: Email ── */}
      {step === 'email' && (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1c1a17', marginBottom: '6px', letterSpacing: '-0.03em' }}>
              Forgot password?
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#8f8778' }}>
              Enter your registered email to receive a 6-digit code
            </p>
          </div>
          <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px', letterSpacing: '0.03em' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'email' ? '#b9502c' : '#8f8778', pointerEvents: 'none' }} />
                <input
                  type="email" value={email} autoComplete="email" placeholder="you@firm.com"
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  style={{
                    ...inputBase,
                    border: `${focused === 'email' ? '2px' : '1.5px'} solid ${focused === 'email' ? '#b9502c' : '#ddd5c7'}`,
                    boxShadow: focused === 'email' ? '0 0 0 4px rgba(185,80,44,0.1)' : 'none',
                  }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#e3b49f' : 'linear-gradient(135deg,#b9502c,#c9603a)',
              color: 'white', border: 'none', borderRadius: '3px', fontSize: '0.9rem', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 16px rgba(185,80,44,0.35)',
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        </>
      )}

      {/* ── STEP 2: OTP ── */}
      {step === 'otp' && (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1c1a17', marginBottom: '6px', letterSpacing: '-0.03em' }}>
              Enter OTP
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#8f8778', lineHeight: 1.5 }}>
              We sent a 6-digit code to <strong style={{ color: '#1c1a17' }}>{email}</strong>. It expires in 10 minutes.
            </p>
          </div>
          <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* OTP boxes */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  style={{
                    width: '48px', height: '56px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 900,
                    borderRadius: '3px', outline: 'none', fontFamily: 'monospace', color: '#1c1a17',
                    border: `2px solid ${d ? '#b9502c' : '#ddd5c7'}`,
                    background: d ? 'rgba(185,80,44,0.04)' : 'white',
                    boxShadow: d ? '0 0 0 4px rgba(185,80,44,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.join('').length < 6} style={{
              width: '100%', padding: '13px',
              background: otp.join('').length < 6 ? '#ddd5c7' : loading ? '#e3b49f' : 'linear-gradient(135deg,#b9502c,#c9603a)',
              color: otp.join('').length < 6 ? '#8f8778' : 'white', border: 'none', borderRadius: '3px',
              fontSize: '0.9rem', fontWeight: 800, cursor: otp.join('').length < 6 || loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', boxShadow: otp.join('').length === 6 && !loading ? '0 4px 16px rgba(185,80,44,0.35)' : 'none',
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center' }}>
              {resendSecs > 0 ? (
                <span style={{ fontSize: '0.78rem', color: '#8f8778' }}>
                  Resend code in <strong style={{ color: '#1c1a17' }}>{resendSecs}s</strong>
                </span>
              ) : (
                <button type="button" onClick={sendOtp} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '0.78rem', color: '#b9502c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                  <RotateCcw size={12} /> Resend OTP
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {/* ── STEP 3: New Password ── */}
      {step === 'password' && (
        <>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1c1a17', marginBottom: '6px', letterSpacing: '-0.03em' }}>
              Create new password
            </h2>
            <p style={{ fontSize: '0.84rem', color: '#8f8778' }}>Choose a strong password for your account</p>
          </div>
          <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* New password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px', letterSpacing: '0.03em' }}>NEW PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'pw' ? '#b9502c' : '#8f8778', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'} value={password} placeholder="Min. 8 characters"
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('pw')} onBlur={() => setFocused(null)}
                  style={{
                    ...inputBase, paddingRight: '44px',
                    border: `${focused === 'pw' ? '2px' : '1.5px'} solid ${focused === 'pw' ? '#b9502c' : '#ddd5c7'}`,
                    boxShadow: focused === 'pw' ? '0 0 0 4px rgba(185,80,44,0.1)' : 'none',
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8f8778', padding: 0 }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthBar password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px', letterSpacing: '0.03em' }}>CONFIRM PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: focused === 'cf' ? '#b9502c' : '#8f8778', pointerEvents: 'none' }} />
                <input
                  type={showCf ? 'text' : 'password'} value={confirm} placeholder="Re-enter your password"
                  onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocused('cf')} onBlur={() => setFocused(null)}
                  style={{
                    ...inputBase, paddingRight: '44px',
                    border: `${focused === 'cf' ? '2px' : '1.5px'} solid ${confirm && confirm !== password ? '#ef4444' : focused === 'cf' ? '#b9502c' : '#ddd5c7'}`,
                    boxShadow: focused === 'cf' ? '0 0 0 4px rgba(185,80,44,0.1)' : 'none',
                  }}
                />
                <button type="button" onClick={() => setShowCf(!showCf)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8f8778', padding: 0 }}>
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm && confirm !== password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <AlertCircle size={11} style={{ color: '#ef4444' }} />
                  <span style={{ fontSize: '0.74rem', color: '#ef4444' }}>Passwords do not match</span>
                </div>
              )}
              {confirm && confirm === password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                  <CheckCircle size={11} style={{ color: '#10b981' }} />
                  <span style={{ fontSize: '0.74rem', color: '#10b981' }}>Passwords match</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#e3b49f' : 'linear-gradient(135deg,#b9502c,#c9603a)',
              color: 'white', border: 'none', borderRadius: '3px', fontSize: '0.9rem', fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 16px rgba(185,80,44,0.35)',
            }}>
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </>
      )}

      {/* ── DONE ── */}
      {step === 'done' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <CheckCircle size={28} style={{ color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c1a17', marginBottom: '8px' }}>Password updated!</h2>
          <p style={{ fontSize: '0.84rem', color: '#6b6457', marginBottom: '28px', lineHeight: 1.6 }}>
            Your password has been changed. You can now sign in with your new password.
          </p>
          <a href="/login" style={{
            display: 'block', padding: '13px', borderRadius: '3px', textAlign: 'center',
            background: 'linear-gradient(135deg,#b9502c,#c9603a)', color: 'white',
            textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem',
            boxShadow: '0 4px 16px rgba(185,80,44,0.35)',
          }}>
            Sign In →
          </a>
        </div>
      )}

      {/* Back link */}
      {step !== 'done' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ height: '1px', background: '#ebe5da', marginBottom: '16px' }} />
          <a
            href={step === 'email' ? '/login' : '#'}
            onClick={step !== 'email' ? (e) => { e.preventDefault(); setStep(step === 'otp' ? 'email' : 'otp'); setError('') } : undefined}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '3px', border: '1.5px solid #ddd5c7', background: '#f3efe7', textDecoration: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={15} style={{ color: '#6b6457' }} />
            <span style={{ fontSize: '0.84rem', color: '#6b6457', fontWeight: 600 }}>
              {step === 'email' ? 'Back to Sign In' : step === 'otp' ? 'Change email' : 'Back'}
            </span>
          </a>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
