import Link from 'next/link'

/**
 * Shared wrapper for policy/legal pages so Terms, Privacy, Refund and Shipping
 * all share one consistent, readable layout. Renders inside the marketing shell
 * (navbar + footer come from app/(marketing)/layout.tsx).
 */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <section className="section" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <span className="badge badge-indigo">Legal</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--navy)', margin: '14px 0 6px' }}>{title}</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '32px' }}>Last updated: {updated}</p>

        <div className="legal-prose">{children}</div>

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
          See also:{' '}
          <Link href="/terms" style={{ color: '#6366f1' }}>Terms</Link> ·{' '}
          <Link href="/privacy" style={{ color: '#6366f1' }}>Privacy</Link> ·{' '}
          <Link href="/refund" style={{ color: '#6366f1' }}>Refunds</Link> ·{' '}
          <Link href="/shipping" style={{ color: '#6366f1' }}>Delivery</Link> ·{' '}
          <Link href="/contact" style={{ color: '#6366f1' }}>Contact</Link>
        </div>
      </div>

      <style>{`
        .legal-prose { color: #334155; font-size: 0.95rem; line-height: 1.75; }
        .legal-prose h2 { font-size: 1.15rem; font-weight: 700; color: var(--navy); margin: 32px 0 10px; }
        .legal-prose h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 22px 0 8px; }
        .legal-prose p { margin: 0 0 14px; }
        .legal-prose ul { margin: 0 0 16px; padding-left: 22px; }
        .legal-prose li { margin: 0 0 8px; }
        .legal-prose a { color: #6366f1; }
        .legal-prose strong { color: #0f172a; }
      `}</style>
    </section>
  )
}
