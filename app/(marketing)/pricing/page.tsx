'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { company } from '@/lib/company'
import { annualPrice } from '@/lib/pricing'

interface Plan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: string
  maxProjects: number
  maxUsers: number
}

function inr(n: number) {
  return n.toLocaleString('en-IN')
}

function parseFeatures(raw: string): string[] {
  try {
    const arr = JSON.parse(raw || '[]')
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

const PLAN_CTA: Record<string, string> = {
  Solo: 'Get Solo',
  Studio: 'Get Studio',
  Enterprise: 'Get Enterprise',
}

const COMPARISON_ROWS: { feature: string; solo: boolean | string; studio: boolean | string; enterprise: boolean | string }[] = [
  { feature: 'Expense Tracking',           solo: true,   studio: true,   enterprise: true   },
  { feature: 'Tally CSV Export',           solo: true,   studio: true,   enterprise: true   },
  { feature: 'GST Purchase Register',      solo: true,   studio: true,   enterprise: true   },
  { feature: 'Pending Payments Report',    solo: true,   studio: true,   enterprise: true   },
  { feature: 'PIN Lock & Security',        solo: true,   studio: true,   enterprise: true   },
  { feature: 'Custom Branding on PDF Reports', solo: true, studio: true, enterprise: true   },
  { feature: 'Multi-User Database Sharing',solo: false,  studio: true,   enterprise: true   },
  { feature: 'Machine Transfer Support',   solo: false,  studio: true,   enterprise: true   },
  { feature: 'Machines',                   solo: '1',    studio: '3',    enterprise: '10'   },
  { feature: 'Max Projects',               solo: '10',   studio: '30',   enterprise: '50'   },
  { feature: 'Monthly Price',              solo: '₹2,499', studio: '₹4,999', enterprise: '₹9,999' },
]

const FAQS = [
  {
    q: 'What is a "machine"?',
    a: 'Each installation of Arc PEM on a Windows computer counts as one machine. A Solo license works on 1 computer, Studio on up to 3, and Enterprise on up to 10.',
  },
  {
    q: 'What is Multi-User Database Sharing?',
    a: 'Studio and Enterprise users can place the project database on a shared network drive, allowing multiple team members to access and update the same data simultaneously from different computers on the same network.',
  },
  {
    q: 'What is Machine Transfer Support?',
    a: 'Studio and Enterprise users can transfer their license to a new computer directly from within the app — no need to contact support. Solo users can reach out to HashX Labs for assisted transfers.',
  },
  {
    q: 'Can I upgrade my plan later?',
    a: 'Yes. Contact HashX Labs and we\'ll issue a new license file for your upgraded plan. Your existing data is fully preserved.',
  },
  {
    q: 'How is the license delivered?',
    a: 'After purchase, HashX Labs emails you a .lic file. Open Arc PEM, go to Settings → License, and import the file to activate on your machine.',
  },
  {
    q: 'What happens when my license expires?',
    a: 'You get a 7-day grace period after expiry. A warning banner appears 30 days before expiry so you have plenty of time to renew.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, Arc PEM includes a free trial period so you can explore all features before purchasing. No credit card required.',
  },
]

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="var(--indigo)" fillOpacity="0.12" />
      <path d="M5 9.5l3 3 5-6" stroke="var(--indigo)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M5.5 9h7" stroke="var(--gray-300)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CellValue({ val }: { val: boolean | string }) {
  if (val === true) return <CheckIcon />
  if (val === false) return <DashIcon />
  return <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{val}</span>
}

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/plans')
      .then((r) => r.json())
      .then((d) => {
        if (active) setPlans(d.plans ?? [])
      })
      .catch(() => active && setPlans([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (loading) return
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('#pricing .fade-up').forEach((el) => el.classList.add('in'))
    })
    return () => cancelAnimationFrame(id)
  }, [loading])

  function openSignupWithPlan(planName: string) {
    if (session) {
      router.push(`/dashboard/subscription?plan=${encodeURIComponent(planName)}`)
    } else {
      router.push(`/register?plan=${encodeURIComponent(planName)}`)
    }
  }

  return (
    <>
      {/* ── Plan Cards ── */}
      <section className="section bg-gray" id="pricing" style={{ overflow: 'visible', paddingTop: '120px' }}>
        <div className="container">
          <div className="sec-hd fade-up">
            <span className="badge badge-indigo">Pricing</span>
            <h2>Simple Pricing for Every Firm Size</h2>
            <p>Choose your plan based on how many machines you need. All the essentials are included from day one.</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>Loading plans…</p>
          ) : plans.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-400)' }}>
              No plans are available right now. Please check back soon.
            </p>
          ) : (
            <div className="pricing-grid">
              {plans.map((plan, i) => {
                const popular = plans.length === 3 && i === 1
                const features = parseFeatures(plan.features)
                const yearly = annualPrice(plan.price)
                const ctaLabel = PLAN_CTA[plan.name] ?? 'Get Started'

                return (
                  <div key={plan.id} className={`pricing-card fade-up${popular ? ' pop' : ''}`}>
                    {popular && <div className="pop-chip">Most Popular</div>}
                    <div className="plan-tier" style={{ color: popular ? 'var(--indigo)' : 'var(--gray-500)' }}>
                      {plan.name}
                    </div>
                    <div className="plan-price">
                      <span className="plan-cur">₹</span>
                      <span className="plan-num">{inr(yearly)}</span>
                      <span className="plan-per">/year</span>
                    </div>
                    <p style={{ fontSize: '.8rem', color: 'var(--gray-400)', minHeight: '18px', marginTop: '-6px' }}>
                      ≈ ₹{inr(plan.price)}/mo · billed annually
                    </p>
                    <p className="plan-desc">{plan.description}</p>
                    <ul className="plan-feats">
                      {features.map((f) => (
                        <li key={f} className="plan-feat">
                          <span className="pf-yes">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`btn ${popular ? 'btn-primary' : 'btn-outline'}`}
                      style={{ width: '100%' }}
                      onClick={() => openSignupWithPlan(plan.name)}
                    >
                      {ctaLabel}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--gray-400)', marginTop: '28px' }}>
            One-year license · 12 months of updates included · Secure checkout by Razorpay
          </p>
          <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--gray-400)', marginTop: '8px' }}>
            All prices are in Indian Rupees (₹).{' '}
            {company.pricesIncludeGst
              ? `Inclusive of ${company.gstRatePct}% GST.`
              : `Exclusive of ${company.gstRatePct}% GST, which is added at checkout where applicable.`}{' '}
            Secure payments by Razorpay. See our{' '}
            <a href="/refund" style={{ color: 'var(--indigo)' }}>Refund Policy</a> and{' '}
            <a href="/terms" style={{ color: 'var(--indigo)' }}>Terms</a>.
          </p>
        </div>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="section" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
        <div className="container">
          <div className="sec-hd" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.6rem' }}>Compare Plans</h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '.9rem',
              minWidth: '520px',
            }}>
              <thead>
                <tr>
                  <th style={thStyle('left')}>Feature</th>
                  <th style={thStyle('center')}>Solo</th>
                  <th style={{ ...thStyle('center'), color: 'var(--indigo)', background: 'rgba(99,102,241,.06)' }}>Studio</th>
                  <th style={thStyle('center')}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} style={{ background: i % 2 === 0 ? 'var(--gray-50, #f9fafb)' : '#fff' }}>
                    <td style={tdStyle('left')}>{row.feature}</td>
                    <td style={tdStyle('center')}><CellValue val={row.solo} /></td>
                    <td style={{ ...tdStyle('center'), background: 'rgba(99,102,241,.04)' }}><CellValue val={row.studio} /></td>
                    <td style={tdStyle('center')}><CellValue val={row.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section bg-gray" style={{ paddingTop: '72px', paddingBottom: '72px' }}>
        <div className="container" style={{ maxWidth: '720px' }}>
          <div className="sec-hd" style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.6rem' }}>Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FAQS.map((faq, i) => {
              const open = openFaq === i
              return (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--gray-200)',
                    borderRadius: '10px',
                    background: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px 20px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '.95rem',
                      color: 'var(--gray-800)',
                    }}
                    aria-expanded={open}
                  >
                    {faq.q}
                    <span style={{
                      flexShrink: 0,
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      background: open ? 'var(--indigo)' : 'var(--gray-100)',
                      color: open ? '#fff' : 'var(--gray-500)',
                      transition: 'background .2s, color .2s',
                      fontSize: '16px',
                      lineHeight: 1,
                    }}>
                      {open ? '−' : '+'}
                    </span>
                  </button>
                  {open && (
                    <p style={{
                      margin: 0,
                      padding: '0 20px 18px',
                      color: 'var(--gray-600)',
                      fontSize: '.9rem',
                      lineHeight: 1.65,
                    }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Strip ── */}
      <section style={{
        background: 'var(--indigo)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '12px' }}>
            Not sure which plan is right for you?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.75)', marginBottom: '28px', fontSize: '.95rem' }}>
            Talk to us — we&apos;ll help you pick the right fit for your firm.
          </p>
          <a
            href="mailto:ansharma1292@gmail.com"
            className="btn"
            style={{
              background: '#fff',
              color: 'var(--indigo)',
              fontWeight: 700,
              borderRadius: '8px',
              padding: '12px 28px',
              display: 'inline-block',
              textDecoration: 'none',
            }}
          >
            Contact HashX Labs
          </a>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.78rem', marginTop: '24px' }}>
            Licenses are annual. Prices are exclusive of GST. This software is licensed, not sold.
          </p>
        </div>
      </section>
    </>
  )
}

function thStyle(align: 'left' | 'center'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '12px 16px',
    fontWeight: 700,
    fontSize: '.8rem',
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    color: 'var(--gray-500)',
    borderBottom: '2px solid var(--gray-200)',
  }
}

function tdStyle(align: 'left' | 'center'): React.CSSProperties {
  return {
    textAlign: align,
    padding: '12px 16px',
    borderBottom: '1px solid var(--gray-100)',
    color: 'var(--gray-700)',
    verticalAlign: 'middle',
  }
}
