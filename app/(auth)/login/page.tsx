'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Mail, Lock, ShieldCheck } from 'lucide-react'
import LedgerLogo from '@/components/LedgerLogo'
import { GoogleIcon } from '@/components/icons'

function validateEmail(v: string) {
  if (!v.trim()) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address'
  return ''
}
function validatePassword(v: string) {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Password must be at least 8 characters'
  return ''
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [apiError, setApiError] = useState('')
  const [focused,  setFocused]  = useState<string | null>(null)
  const [touched,  setTouched]  = useState<Record<string, boolean>>({})

  useEffect(() => {
    getProviders().then(providers => setGoogleEnabled(!!providers?.google))
  }, [])

  const registered = params.get('registered')
  const errParam   = params.get('error')

  const emailErr  = touched.email    ? validateEmail(email)      : ''
  const pwErr     = touched.password ? validatePassword(password) : ''
  const hasErrors = !!emailErr || !!pwErr

  function touch(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  function borderColor(field: string, err: string) {
    if (focused === field) return err ? '#ef4444' : '#b9502c'
    return err ? '#fca5a5' : '#ddd5c7'
  }
  function shadowStyle(field: string, err: string): React.CSSProperties {
    if (focused !== field) return {}
    return { boxShadow: err ? '0 0 0 4px rgba(239,68,68,0.1)' : '0 0 0 4px rgba(185,80,44,0.1)' }
  }

  const inputBase: React.CSSProperties = {
    width: '100%', padding: '11px 14px 11px 40px', borderRadius: '3px',
    fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
    background: '#fafafa', transition: 'all 0.15s', boxSizing: 'border-box',
    color: '#1c1a17',
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (validateEmail(email) || validatePassword(password)) return

    setLoading(true); setApiError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)

    if (result?.error) {
      setApiError(
        result.error === 'TooManyRequests'
          ? 'Too many sign-in attempts. Please wait 15 minutes and try again.'
          : result.error === 'AccountSuspended'
          ? 'Your account has been suspended. Please contact support.'
          : 'Incorrect email or password. Please try again.'
      )
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  function handleGoogleSignIn() {
    setGoogleLoading(true)
    signIn('google', { callbackUrl: params.get('callbackUrl') || '/dashboard' })
  }

  const googleErrorMsg =
    errParam === 'AccessDenied'
      ? 'That Google account is suspended, or access was denied. Please contact support.'
      : errParam === 'OAuthSignin' || errParam === 'OAuthCallback' || errParam === 'OAuthAccountNotLinked'
      ? 'Google sign-in failed. Please try again or sign in with your email and password.'
      : ''

  return (
    <>
      {/* Brand icon + heading */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ marginBottom: '18px' }}><LedgerLogo height={40} /></div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1c1a17', marginBottom: '5px', letterSpacing: '-0.03em' }}>
          Welcome back
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#8f8778', fontWeight: 500 }}>
          Sign in to your ARC PEM account
        </p>
      </div>

      {/* Success banner */}
      {registered && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '3px', padding: '12px 14px', marginBottom: '20px',
        }}>
          <CheckCircle size={15} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600 }}>
            Account created! Sign in to access your dashboard.
          </span>
        </div>
      )}

      {/* Error banner */}
      {(apiError || errParam === 'unauthorized' || googleErrorMsg) && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '3px', padding: '12px 14px', marginBottom: '20px',
        }}>
          <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
          <span style={{ fontSize: '0.82rem', color: '#dc2626' }}>
            {apiError || googleErrorMsg || 'You do not have permission to access that area.'}
          </span>
        </div>
      )}

      {/* Google sign-in */}
      {googleEnabled && (
        <>
          <button
            type="button" onClick={handleGoogleSignIn} disabled={googleLoading}
            style={{
              width: '100%', padding: '12px', marginBottom: '20px',
              background: 'white', color: '#1c1a17',
              border: '1.5px solid #ddd5c7', borderRadius: '3px',
              fontSize: '0.87rem', fontWeight: 700, cursor: googleLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              fontFamily: 'inherit', transition: 'all 0.15s',
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {googleLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite', color: '#8f8778' }} /> : <GoogleIcon size={17} />}
            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#ddd5c7' }} />
            <span style={{ fontSize: '0.72rem', color: '#c9c0b0', fontWeight: 600 }}>OR SIGN IN WITH EMAIL</span>
            <div style={{ flex: 1, height: '1px', background: '#ddd5c7' }} />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Email */}
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#374151', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: emailErr && touched.email ? '#ef4444' : focused === 'email' ? '#b9502c' : '#8f8778',
              pointerEvents: 'none', transition: 'color 0.15s',
            }} />
            <input
              type="email" value={email} autoComplete="email" placeholder="you@firm.com"
              onChange={e => { setEmail(e.target.value); if (touched.email) touch('email') }}
              onFocus={() => setFocused('email')}
              onBlur={() => { setFocused(null); touch('email') }}
              style={{
                ...inputBase,
                border: `${focused === 'email' ? '2px' : '1.5px'} solid ${borderColor('email', emailErr)}`,
                ...shadowStyle('email', emailErr),
                background: focused === 'email' ? 'white' : '#fafafa',
              }}
            />
          </div>
          {emailErr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
              <AlertCircle size={11} color="#ef4444" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.73rem', color: '#ef4444' }}>{emailErr}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Password
            </label>
            <a href="/forgot-password" style={{ fontSize: '0.75rem', color: '#b9502c', fontWeight: 600, textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
          <div style={{ position: 'relative' }}>
            <Lock size={15} style={{
              position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
              color: pwErr && touched.password ? '#ef4444' : focused === 'password' ? '#b9502c' : '#8f8778',
              pointerEvents: 'none', transition: 'color 0.15s',
            }} />
            <input
              type={showPw ? 'text' : 'password'} value={password} autoComplete="current-password"
              placeholder="Enter your password"
              onChange={e => { setPassword(e.target.value); if (touched.password) touch('password') }}
              onFocus={() => setFocused('password')}
              onBlur={() => { setFocused(null); touch('password') }}
              style={{
                ...inputBase,
                paddingRight: '44px',
                border: `${focused === 'password' ? '2px' : '1.5px'} solid ${borderColor('password', pwErr)}`,
                ...shadowStyle('password', pwErr),
                background: focused === 'password' ? 'white' : '#fafafa',
              }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#8f8778',
              display: 'flex', alignItems: 'center', padding: 0,
            }}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {pwErr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
              <AlertCircle size={11} color="#ef4444" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.73rem', color: '#ef4444' }}>{pwErr}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#e3b49f' : 'linear-gradient(135deg, #b9502c, #c9603a)',
            color: 'white', border: 'none', borderRadius: '3px',
            fontSize: '0.9rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit', marginTop: '4px',
            boxShadow: loading ? 'none' : '0 4px 16px rgba(185,80,44,0.35)',
            transition: 'all 0.15s',
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {hasErrors && touched.email && touched.password && (
          <p style={{ fontSize: '0.73rem', color: '#f87171', textAlign: 'center', marginTop: '-4px' }}>
            Please fix the errors above before continuing.
          </p>
        )}
      </form>

      {/* Create account card */}
      <div style={{ marginTop: '16px' }}>
        <a href="/register" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: '3px',
          border: '1.5px solid #ddd5c7', background: '#f3efe7',
          textDecoration: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '9px',
              background: 'linear-gradient(135deg, rgba(185,80,44,0.12), rgba(201,96,58,0.08))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={15} color="#b9502c" />
            </div>
            <div>
              <div style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1c1a17' }}>New to ARC PEM?</div>
              <div style={{ fontSize: '0.72rem', color: '#8f8778' }}>One-year license · Secure checkout</div>
            </div>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#b9502c', fontWeight: 800 }}>Create Account →</span>
        </a>
      </div>

      <p style={{ textAlign: 'center', marginTop: '14px' }}>
        <a href="/" style={{ fontSize: '0.75rem', color: '#c9c0b0', textDecoration: 'none', fontWeight: 500 }}>
          ← Back to website
        </a>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
