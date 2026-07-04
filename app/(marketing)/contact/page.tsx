import type { Metadata } from 'next'
import { Mail, Phone, MapPin, Building2, Clock } from 'lucide-react'
import { company, formatAddress, hasAddress } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ARC PEM team for sales, support, or billing questions.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const address = formatAddress()

  const cards = [
    {
      icon: <Mail size={20} />,
      title: 'Email us',
      lines: [company.supportEmail],
      href: `mailto:${company.supportEmail}`,
    },
    {
      icon: <Phone size={20} />,
      title: 'Call us',
      lines: [company.phone],
      href: `tel:${company.phone.replace(/[^+\d]/g, '')}`,
    },
  ]

  return (
    <section className="section" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '860px' }}>
        <span className="badge badge-indigo">Contact</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--navy)', margin: '14px 0 8px' }}>
          Talk to the {company.brand} team
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '620px', marginBottom: '36px', lineHeight: 1.6 }}>
          Questions about the product, a purchase, or your subscription? We&rsquo;re happy to help.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {cards.map(c => (
            <a
              key={c.title}
              href={c.href}
              className="no-underline"
              style={{
                display: 'block', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px',
                padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '11px',
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
              }}>
                {c.icon}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {c.title}
              </div>
              {c.lines.map(l => (
                <div key={l} style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{l}</div>
              ))}
            </a>
          ))}
        </div>

        {/* Business / registered details — required for Razorpay verification */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Building2 size={18} style={{ color: '#6366f1' }} />
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{company.legalName}</span>
          </div>

          {hasAddress() ? (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <MapPin size={16} style={{ color: '#94a3b8', flexShrink: 0, marginTop: '3px' }} />
              <span>{address}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', color: '#b45309', fontSize: '0.85rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', padding: '8px 12px' }}>
              <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Registered business address to be added in <code>lib/company.ts</code> before going live.</span>
            </div>
          )}

          {company.gstin ? (
            <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '12px' }}>
              <strong style={{ color: '#0f172a' }}>GSTIN:</strong> {company.gstin}
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: '10px', color: '#475569', fontSize: '0.9rem', alignItems: 'center' }}>
            <Clock size={16} style={{ color: '#94a3b8' }} />
            <span>Support hours: Mon&ndash;Sat, 10:00&ndash;18:00 IST</span>
          </div>
        </div>

        <p style={{ marginTop: '28px', fontSize: '0.85rem', color: '#94a3b8' }}>
          For billing or refund requests, see our <a href="/refund" style={{ color: '#6366f1' }}>Refund &amp; Cancellation Policy</a>.
        </p>
      </div>
    </section>
  )
}
