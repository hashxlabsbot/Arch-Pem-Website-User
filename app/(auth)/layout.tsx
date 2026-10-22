import Link from 'next/link'
import LogoMark from '@/components/LogoMark'
import { company } from '@/lib/company'
import { ClipboardIcon, ReceiptIcon, FileIcon, CompassIcon } from '@/components/icons'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "var(--font-body), 'Inter', system-ui, sans-serif" }}>
      <style>{`
        .auth-mobile-logo { display: none; }
        @media (max-width: 767px) {
          .auth-left        { display: none !important; }
          .auth-right       { padding: 24px 20px 40px !important; justify-content: flex-start !important; align-items: flex-start !important; }
          .auth-form-card   { padding: 24px 20px !important; border-radius: 18px !important; }
          .auth-mobile-logo { display: flex !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════
          LEFT — architectural hero panel
      ══════════════════════════════════════════════ */}
      <div className="auth-left" style={{
        width: '50%', minHeight: '100vh', position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(155deg, #020817 0%, #06101f 35%, #09163a 70%, #0c1d4d 100%)',
      }}>

        {/* ── ambient glow blobs ── */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-100px',
          width: '440px', height: '440px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 62%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '0', right: '-80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 62%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '42%', left: '20%',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* ── top accent line ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #3b82f6 28%, #6366f1 58%, transparent)',
        }} />

        {/* ── CONTENT ── */}
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          height: '100%', padding: '32px 42px 28px',
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginBottom: '28px' }}>
            <LogoMark size={18} onDark />
          </Link>

          {/* Headline */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '12px',
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '100px', padding: '4px 12px',
            }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
              <span style={{ fontSize: '0.67rem', color: '#93c5fd', fontWeight: 600 }}>v{company.product.version} live · Trusted by 30+ firms</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: 'white', lineHeight: 1.18, margin: '0 0 9px', letterSpacing: '-0.04em' }}>
              India&apos;s smartest<br />
              <span style={{
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>BOQ &amp; estimation</span> platform
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, margin: 0 }}>
              Built for Indian construction professionals — generate accurate bills of quantities in minutes, not days.
            </p>
          </div>

          {/* ── Architectural illustration ── */}
          <div style={{
            flex: 1, borderRadius: '16px', overflow: 'hidden', marginBottom: '18px',
            border: '1px solid rgba(99,102,241,0.18)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.35), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.08) inset',
            background: 'rgba(4,8,15,0.35)',
            display: 'flex', alignItems: 'center',
          }}>
            <img
              src="/arch-illustration.svg"
              alt="ARC PEM — Architectural project estimation visualisation"
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>

          {/* ── Feature pills ── */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { icon: <ClipboardIcon size={12} color="rgba(255,255,255,0.55)" />, label: 'BOQ Builder' },
              { icon: <ReceiptIcon size={12} color="rgba(255,255,255,0.55)" />,   label: 'GST Auto-calc' },
              { icon: <FileIcon size={12} color="rgba(255,255,255,0.55)" />,      label: 'PDF Export' },
              { icon: <CompassIcon size={12} color="rgba(255,255,255,0.55)" />,   label: 'Quantity Takeoff' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 11px', borderRadius: '100px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500,
              }}>
                {icon}
                {label}
              </div>
            ))}
          </div>

          {/* ── Stats row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {[
              { value: '₹50 Cr+', label: 'Estimated', accent: '#60a5fa' },
              { value: '30+',      label: 'Firms active', accent: '#a78bfa' },
              { value: '4.9 ★',   label: 'User rating',  accent: '#34d399' },
            ].map(({ value, label, accent }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.07)', padding: '10px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 900, color: accent, letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.32)', fontWeight: 500, marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* ── Footer avatar stack ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '11px',
            paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto',
          }}>
            <div style={{ display: 'flex' }}>
              {['R','K','A','S'].map((l, i) => (
                <div key={l} style={{
                  width: '24px', height: '24px', borderRadius: '50%', marginLeft: i === 0 ? 0 : '-6px',
                  background: ['#3b82f6','#6366f1','#8b5cf6','#0ea5e9'][i],
                  border: '2px solid #06101f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.58rem', fontWeight: 700, color: 'white',
                }}>{l}</div>
              ))}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)', lineHeight: 1.5 }}>
              Join professionals already using ARC PEM
            </span>
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════
          RIGHT — form panel
      ══════════════════════════════════════════════ */}
      <div className="auth-right" style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px', overflowY: 'auto',
        background: 'linear-gradient(160deg, #eef2ff 0%, #f8fafc 50%, #eff6ff 100%)',
      }}>
        {/* decorative blobs */}
        <div style={{
          position: 'fixed', top: '10%', right: '5%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', bottom: '10%', right: '15%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Mobile-only branding header (left panel is hidden on small screens) */}
        <div className="auth-mobile-logo" style={{
          alignItems: 'center', gap: '10px',
          width: '100%', maxWidth: '420px',
          marginBottom: '20px', position: 'relative', zIndex: 1,
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <LogoMark size={18} />
          </Link>
        </div>

        {/* Form card */}
        <div className="auth-form-card" style={{
          width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
          background: 'white', borderRadius: '24px',
          border: '1.5px solid #e2e8f0',
          padding: '36px 36px 32px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 16px 48px rgba(99,102,241,0.08)',
        }}>
          {children}
        </div>

        <p style={{ marginTop: '20px', fontSize: '0.72rem', color: '#cbd5e1', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          © 2026 ARCPEM · All rights reserved
        </p>
      </div>

    </div>
  )
}
