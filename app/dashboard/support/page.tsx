'use client'

import { useState } from 'react'
import {
  Phone, Mail, MessageCircle, BookOpen, Video, FileText,
  ChevronDown, ArrowRight, Clock, Headphones, Zap,
} from 'lucide-react'

const CHANNELS = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 9266103145',
    action: 'tel:+919266103145',
    badge: 'Mon–Fri, 10am–6pm IST',
    accent: '#16a34a',
    bg: 'rgba(22,163,74,0.08)',
    btnLabel: 'Call Now',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 9266103145',
    action: 'https://wa.me/919266103145',
    badge: 'Quick replies, Mon–Fri',
    accent: '#059669',
    bg: 'rgba(5,150,105,0.08)',
    btnLabel: 'Chat on WhatsApp',
  },
  {
    icon: Mail,
    label: 'Email Support',
    value: 'hashxlabs@gmail.com',
    action: 'mailto:hashxlabs@gmail.com',
    badge: 'Response within 24 hours',
    accent: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    btnLabel: 'Send Email',
  },
]

const FAQS = [
  {
    q: 'How do I activate my license key?',
    a: 'Open ARC PEM, go to Settings → License, and paste your license key. Click Activate. The key is tied to your purchase email.',
  },
  {
    q: 'Can I use ARC PEM on multiple machines?',
    a: 'Each license is valid for one machine at a time. Contact support to transfer your license to a different device.',
  },
  {
    q: 'How do I upgrade my plan?',
    a: 'Go to Subscription in your dashboard, choose a plan, and complete the payment. Your account is upgraded instantly.',
  },
  {
    q: 'What if the software crashes or has a bug?',
    a: 'Email us at hashxlabs@gmail.com with a description of the issue and your OS version. We typically respond within 24 hours.',
  },
  {
    q: 'Is my data backed up?',
    a: 'ARC PEM stores data locally on your machine. We recommend regular manual backups of your project files.',
  },
]

const RESOURCES = [
  {
    icon: BookOpen,
    label: 'User Guide',
    desc: 'Complete documentation with screenshots',
    href: '#',
    accent: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    icon: Video,
    label: 'Video Tutorials',
    desc: 'Step-by-step walkthroughs for every feature',
    href: '#',
    accent: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
  },
  {
    icon: FileText,
    label: 'BOQ Templates',
    desc: 'Free pre-built templates for all project types',
    href: '#',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
  },
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: '820px', paddingBottom: '48px' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)',
        borderRadius: '24px',
        padding: '36px 32px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-30px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '30%',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Headphones size={24} color="#a5b4fc" />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>
              Support Center
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0, marginTop: '2px' }}>
              We're here to help — reach us any way you prefer
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {[
            { icon: Clock, text: 'Mon–Fri, 10am–6pm IST' },
            { icon: Zap,   text: 'WhatsApp replies in minutes' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Icon size={13} color="#6366f1" />
              <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contact channels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        {CHANNELS.map(({ icon: Icon, label, value, action, badge, accent, bg, btnLabel }) => (
          <div key={label} className="channel-card" style={{
            background: 'white',
            borderRadius: '20px',
            border: '1.5px solid #e2e8f0',
            padding: '22px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '13px',
              background: bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={21} color={accent} />
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: '3px' }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{value}</div>
              <div style={{
                display: 'inline-block', marginTop: '6px',
                fontSize: '0.72rem', fontWeight: 600, color: accent,
                background: bg, borderRadius: '6px', padding: '2px 8px',
              }}>
                {badge}
              </div>
            </div>

            <a
              href={action}
              target={action.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px 0', borderRadius: '11px',
                background: bg, color: accent,
                fontSize: '0.82rem', fontWeight: 700,
                textDecoration: 'none', marginTop: 'auto',
                border: `1.5px solid ${accent}22`,
              }}
            >
              {btnLabel} <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>

      {/* ── FAQ ── */}
      <div style={{
        background: 'white', borderRadius: '20px',
        border: '1.5px solid #e2e8f0', marginBottom: '20px', overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>
        {FAQS.map(({ q, a }, i) => (
          <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '12px',
                padding: '16px 24px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e293b' }}>{q}</span>
              <ChevronDown
                size={17}
                color="#94a3b8"
                style={{
                  flexShrink: 0,
                  transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
            {openFaq === i && (
              <div style={{ padding: '0 24px 18px', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.65 }}>
                {a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Self-help resources ── */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
          Self-Help Resources
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {RESOURCES.map(({ icon: Icon, label, desc, href, accent, bg }) => (
            <a
              key={label}
              href={href}
              className="resource-card"
              style={{
                background: 'white', borderRadius: '16px',
                border: '1.5px solid #e2e8f0', padding: '18px',
                textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '10px',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '11px',
                background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={accent} />
              </div>
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.5 }}>{desc}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: accent }}>Explore</span>
                <ArrowRight size={13} color={accent} />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── CTA banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        borderRadius: '20px', padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px',
      }}>
        <div>
          <h3 style={{ color: 'white', fontSize: '1rem', fontWeight: 800, margin: '0 0 6px' }}>
            Still need help?
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.83rem', margin: 0 }}>
            Describe your issue and our team will respond within 24 hours.
          </p>
        </div>
        <a
          href="mailto:hashxlabs@gmail.com?subject=ARC PEM Support Request"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'white', color: '#4f46e5',
            fontSize: '0.84rem', fontWeight: 800,
            padding: '11px 22px', borderRadius: '12px',
            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}
        >
          <Mail size={15} /> Email Us
        </a>
      </div>

    </div>
  )
}
