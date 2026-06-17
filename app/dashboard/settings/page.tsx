'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  User, Lock, Shield, CheckCircle, AlertCircle,
  Loader2, Eye, EyeOff,
} from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update } = useSession()

  /* ── Profile ── */
  const [name,        setName]        = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg,     setNameMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  /* ── Password ── */
  const [curPw,     setCurPw]     = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg,     setPwMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [showCur,   setShowCur]   = useState(false)
  const [showNew,   setShowNew]   = useState(false)

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session?.user?.name])

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === session?.user?.name) return
    setNameLoading(true); setNameMsg(null)
    const res  = await fetch('/api/user/update-profile', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    const data = await res.json()
    setNameLoading(false)
    if (res.ok) {
      await update({ name: trimmed })
      setNameMsg({ type: 'ok', text: 'Name updated successfully.' })
    } else {
      setNameMsg({ type: 'err', text: data.error ?? 'Something went wrong.' })
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw.length < 8)    { setPwMsg({ type: 'err', text: 'New password must be at least 8 characters.' }); return }
    if (newPw !== confirmPw) { setPwMsg({ type: 'err', text: 'Passwords do not match.' }); return }
    setPwLoading(true); setPwMsg(null)
    const res  = await fetch('/api/user/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    })
    const data = await res.json()
    setPwLoading(false)
    if (res.ok) {
      setCurPw(''); setNewPw(''); setConfirmPw('')
      setPwMsg({ type: 'ok', text: 'Password changed successfully.' })
    } else {
      setPwMsg({ type: 'err', text: data.error ?? 'Something went wrong.' })
    }
  }

  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  const pwStrength = !newPw ? 0
    : newPw.length >= 12 && /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) && /[^a-zA-Z0-9]/.test(newPw) ? 4
    : newPw.length >= 10 && /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 3
    : newPw.length >= 8 ? 2 : 1

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][pwStrength]
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][pwStrength]

  const CARD: React.CSSProperties = {
    background: 'white', borderRadius: '20px',
    border: '1.5px solid #e2e8f0', padding: '26px',
    marginBottom: '16px',
  }
  const SECTION_ICON = (bg: string, color: string) => ({
    width: '30px', height: '30px', borderRadius: '9px',
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color,
  } as React.CSSProperties)
  const LABEL: React.CSSProperties = {
    fontSize: '0.72rem', fontWeight: 700, color: '#374151',
    letterSpacing: '0.06em', display: 'block', marginBottom: '6px',
    textTransform: 'uppercase' as const,
  }
  const INPUT: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '11px',
    border: '1.5px solid #e2e8f0', fontSize: '0.88rem',
    outline: 'none', fontFamily: 'inherit', background: 'white',
    boxSizing: 'border-box' as const, color: '#0f172a',
  }
  const PW_INPUT: React.CSSProperties = { ...INPUT, paddingRight: '44px' }

  const feedbackBox = (msg: { type: 'ok' | 'err'; text: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '10px 14px', borderRadius: '10px',
      background: msg.type === 'ok' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
      border: `1px solid ${msg.type === 'ok' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      {msg.type === 'ok'
        ? <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0 }} />
        : <AlertCircle size={13} color="#ef4444" style={{ flexShrink: 0 }} />}
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: msg.type === 'ok' ? '#059669' : '#dc2626' }}>
        {msg.text}
      </span>
    </div>
  )

  const saveBtn = (loading: boolean, disabled: boolean, danger?: boolean) => ({
    alignSelf: 'flex-start' as const, padding: '9px 22px', borderRadius: '11px',
    background: disabled
      ? '#e2e8f0'
      : danger
      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
      : 'linear-gradient(135deg, #6366f1, #3b82f6)',
    color: disabled ? '#94a3b8' : 'white',
    border: 'none', fontFamily: 'inherit', fontSize: '0.84rem', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px',
    boxShadow: disabled ? 'none' : danger ? '0 4px 14px rgba(239,68,68,0.3)' : '0 4px 14px rgba(99,102,241,0.3)',
  } as React.CSSProperties)

  return (
    <div style={{ maxWidth: '620px', paddingBottom: '48px' }}>

      {/* ── Header hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)',
        borderRadius: '24px', padding: '28px 32px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '18px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-20px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '58px', height: '58px', borderRadius: '16px', flexShrink: 0,
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', fontWeight: 900, color: 'white',
          border: '2.5px solid rgba(255,255,255,0.15)',
        }}>
          {initials}
        </div>
        <div style={{ position: 'relative' }}>
          <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Account Settings
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '4px 0 0' }}>
            {session?.user?.email ?? '—'}
          </p>
          <span style={{
            display: 'inline-block', marginTop: '6px',
            fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
            color: '#a5b4fc', background: 'rgba(99,102,241,0.2)',
            padding: '2px 8px', borderRadius: '6px',
            border: '1px solid rgba(99,102,241,0.3)',
          }}>
            {session?.user?.planName ?? 'Free Trial'}
          </span>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={SECTION_ICON('rgba(99,102,241,0.1)', '#6366f1')}>
            <User size={15} color="#6366f1" />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Profile</span>
        </div>
        <form onSubmit={saveName} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={LABEL}>Display Name</label>
            <input
              style={INPUT} value={name}
              onChange={e => { setName(e.target.value); setNameMsg(null) }}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label style={LABEL}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...INPUT, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed', paddingRight: '96px' }}
                value={session?.user?.email ?? ''} readOnly
              />
              <span style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8',
                background: '#e2e8f0', padding: '2px 8px', borderRadius: '5px', letterSpacing: '0.04em',
              }}>READ ONLY</span>
            </div>
          </div>
          {nameMsg && feedbackBox(nameMsg)}
          <button
            type="submit" disabled={nameLoading || !name.trim() || name.trim() === session?.user?.name}
            style={saveBtn(nameLoading, nameLoading || !name.trim() || name.trim() === session?.user?.name)}
          >
            {nameLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Save Changes
          </button>
        </form>
      </div>

      {/* ── Password card ── */}
      <div style={CARD}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={SECTION_ICON('rgba(239,68,68,0.08)', '#ef4444')}>
            <Lock size={15} color="#ef4444" />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Change Password</span>
        </div>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Current password */}
          <div>
            <label style={LABEL}>Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCur ? 'text' : 'password'} value={curPw}
                onChange={e => { setCurPw(e.target.value); setPwMsg(null) }}
                style={PW_INPUT} placeholder="Enter current password"
              />
              <button type="button" onClick={() => setShowCur(!showCur)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                display: 'flex', alignItems: 'center', padding: 0,
              }}>
                {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label style={LABEL}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'} value={newPw}
                onChange={e => { setNewPw(e.target.value); setPwMsg(null) }}
                style={PW_INPUT} placeholder="Min. 8 characters"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8',
                display: 'flex', alignItems: 'center', padding: 0,
              }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {newPw && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      background: i <= pwStrength ? strengthColor : '#e2e8f0',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: strengthColor, minWidth: '38px' }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label style={LABEL}>Confirm New Password</label>
            <input
              type="password" value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwMsg(null) }}
              style={{ ...INPUT, borderColor: confirmPw && confirmPw !== newPw ? '#fca5a5' : '#e2e8f0' }}
              placeholder="Repeat new password"
            />
            {confirmPw && confirmPw !== newPw && (
              <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '5px', display: 'block' }}>
                Passwords don't match
              </span>
            )}
          </div>

          {pwMsg && feedbackBox(pwMsg)}
          <button
            type="submit" disabled={pwLoading || !curPw || !newPw || !confirmPw}
            style={saveBtn(pwLoading, pwLoading || !curPw || !newPw || !confirmPw, true)}
          >
            {pwLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Update Password
          </button>
        </form>
      </div>

      {/* ── Account info card ── */}
      <div style={{ ...CARD, marginBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={SECTION_ICON('rgba(16,185,129,0.08)', '#10b981')}>
            <Shield size={15} color="#10b981" />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>Account Info</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { label: 'Account Status', value: 'Active',                                   color: '#10b981' },
            { label: 'Current Plan',   value: session?.user?.planName ?? 'Free Trial',    color: '#6366f1' },
            { label: 'Account ID',     value: (session?.user?.id ?? '—').slice(0, 12) + '…', color: '#64748b' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px', borderRadius: '11px', background: '#f8fafc',
            }}>
              <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
