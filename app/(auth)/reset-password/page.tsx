'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Lock } from 'lucide-react'

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]
  const strength = checks.filter(Boolean).length
  const colors   = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
  const labels   = ['Weak', 'Fair', 'Good', 'Strong']

  if (!password) return null
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            background: i < strength ? colors[strength - 1] : '#e2e8f0',
            transition: 'background 0.2s',
          }} />
        ))}
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: colors[strength - 1] }}>
        {labels[strength - 1]}
      </span>
    </div>
  )
}

function ResetForm() {
  const params   = useSearchParams()
  const router   = useRouter()
  const token    = params.get('token') ?? ''

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showPw,    setShowPw]    = useState(false)
  const [showCf,    setShowCf]    = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')
  const [focused,   setFocused]   = useState<string | null>(null)

  if (!token) {
    return (
      <div style={{ textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Invalid Link</h2>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '24px' }}>This reset link is missing or invalid.</p>
        <a href="/forgot-password" style={{
          display: 'inline-block', padding: '12px 24px', borderRadius: '12px',
          background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: 'white',
          textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem',
        }}>
          Request a new link
        </a>
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
        }}>
          <CheckCircle size={28} style={{ color: '#10b981' }} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Password updated!</h2>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '28px', lineHeight: 1.6 }}>
          Your password has been changed successfully. You can now sign in with your new password.
        </p>
        <a href="/login" style={{
          display: 'block', padding: '13px', borderRadius: '12px', textAlign: 'center',
          background: 'linear-gradient(135deg,#6366f1,#3b82f6)', color: 'white',
          textDecoration: 'none', fontWeight: 800, fontSize: '0.9rem',
          boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
        }}>
          Sign In →
        </a>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '11px 44px 11px 40px', borderRadius: '12px',
    fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
    background: 'white', transition: 'all 0.15s', boxSizing: 'border-box',
  }

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.03em' }}>
          Set new password
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#94a3b8', fontWeight: 500 }}>
          Choose a strong password for your account
        </p>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px', padding: '12px 14px', marginBottom: '20px',
        }}>
          <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: '#dc2626' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* New password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px', letterSpacing: '0.03em' }}>
            NEW PASSWORD
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: focused === 'pw' ? '#6366f1' : '#94a3b8', pointerEvents: 'none',
            }} />
            <input
              type={showPw ? 'text' : 'password'} value={password}
              placeholder="Min. 8 characters"
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('pw')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputBase,
                border: `${focused === 'pw' ? '2px' : '1.5px'} solid ${focused === 'pw' ? '#6366f1' : '#e2e8f0'}`,
                boxShadow: focused === 'pw' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
              }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
            }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </div>

        {/* Confirm password */}
        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: '6px', letterSpacing: '0.03em' }}>
            CONFIRM PASSWORD
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: focused === 'cf' ? '#6366f1' : '#94a3b8', pointerEvents: 'none',
            }} />
            <input
              type={showCf ? 'text' : 'password'} value={confirm}
              placeholder="Re-enter your password"
              onChange={e => setConfirm(e.target.value)}
              onFocus={() => setFocused('cf')}
              onBlur={() => setFocused(null)}
              style={{
                ...inputBase,
                border: `${focused === 'cf' ? '2px' : '1.5px'} solid ${
                  confirm && confirm !== password ? '#ef4444' : focused === 'cf' ? '#6366f1' : '#e2e8f0'
                }`,
                boxShadow: focused === 'cf' ? '0 0 0 4px rgba(99,102,241,0.1)' : 'none',
              }}
            />
            <button type="button" onClick={() => setShowCf(!showCf)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
            }}>
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

        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '0.9rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.35)',
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Updating…' : 'Update Password'}
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
