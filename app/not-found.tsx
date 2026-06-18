import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '24px', background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', color: '#fff',
      }}
    >
      <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, color: '#60a5fa' }}>404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '12px 0 8px' }}>Page not found</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '420px', marginBottom: '28px', lineHeight: 1.6 }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
      </p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
            padding: '11px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
            textDecoration: 'none',
          }}
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff',
            padding: '11px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem',
            textDecoration: 'none',
          }}
        >
          Contact support
        </Link>
      </div>
    </div>
  )
}
