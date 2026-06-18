'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { company } from '@/lib/company'

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

// Annual billing discount. Admin sets only the monthly price; the annual price
// is derived here so the "20% off" rule lives in one place.
const ANNUAL_DISCOUNT = 0.2

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

export default function PricingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [annual, setAnnual] = useState(false)

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

  // The marketing shell's reveal observer only runs once over the .fade-up
  // elements that exist at mount. Our cards render after the /api/plans fetch
  // (and the heading is missed on client-side nav), so reveal them ourselves
  // once content is in the DOM — otherwise they stay at opacity:0.
  useEffect(() => {
    if (loading) return
    const id = requestAnimationFrame(() => {
      document.querySelectorAll('#pricing .fade-up').forEach((el) => el.classList.add('in'))
    })
    return () => cancelAnimationFrame(id)
  }, [loading])

  function openSignupWithPlan(planName: string) {
    const billing = annual ? 'annual' : 'monthly'
    if (session) {
      router.push(`/dashboard/subscription?plan=${encodeURIComponent(planName)}&billing=${billing}`)
    } else {
      router.push(`/register?plan=${encodeURIComponent(planName)}&billing=${billing}`)
    }
  }

  return (
    <section className="section bg-gray" id="pricing" style={{ overflow: 'visible', paddingTop: '120px' }}>
      <div className="container">
        <div className="sec-hd fade-up">
          <span className="badge badge-indigo">Pricing</span>
          <h2>Simple, Transparent Pricing</h2>
          <p>One license. One machine. No hidden fees. Cancel anytime. Updates included for 12 months. Your data stays yours — always.</p>
        </div>

        {/* Monthly / Annual toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', margin: '8px 0 40px' }}>
          <span style={{ fontWeight: annual ? 400 : 600, color: annual ? 'var(--gray-500)' : 'var(--gray-900)' }}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Toggle annual billing"
            onClick={() => setAnnual((v) => !v)}
            style={{
              position: 'relative',
              width: '52px',
              height: '28px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: annual ? 'var(--indigo)' : 'var(--gray-300, #cbd5e1)',
              transition: 'background .2s',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '3px',
                left: annual ? '27px' : '3px',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left .2s',
              }}
            />
          </button>
          <span style={{ fontWeight: annual ? 600 : 400, color: annual ? 'var(--gray-900)' : 'var(--gray-500)' }}>
            Annual
          </span>
          <span className="badge badge-indigo" style={{ marginLeft: '2px' }}>Save 20%</span>
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
              const perMonth = annual ? Math.round(plan.price * (1 - ANNUAL_DISCOUNT)) : plan.price
              const yearlyTotal = Math.round(plan.price * 12 * (1 - ANNUAL_DISCOUNT))

              return (
                <div key={plan.id} className={`pricing-card fade-up${popular ? ' pop' : ''}`}>
                  {popular && <div className="pop-chip">Most Popular</div>}
                  <div className="plan-tier" style={{ color: popular ? 'var(--indigo)' : 'var(--gray-500)' }}>
                    {plan.name}
                  </div>
                  <div className="plan-price">
                    <span className="plan-cur">₹</span>
                    <span className="plan-num">{inr(perMonth)}</span>
                    <span className="plan-per">/month</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: 'var(--gray-400)', minHeight: '18px', marginTop: '-6px' }}>
                    {annual ? `₹${inr(yearlyTotal)} billed yearly` : ' '}
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
                    Get Started
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--gray-400)', marginTop: '28px' }}>
          All plans include a 14-day free trial · No credit card required · Cancel anytime
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
  )
}
