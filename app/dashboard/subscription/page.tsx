import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { CheckCircle2, ArrowRight, Zap, Star } from 'lucide-react'
import UpgradeButton from '@/components/dashboard/UpgradeButton'
import { company } from '@/lib/company'
import { annualPrice } from '@/lib/pricing'

const POPULAR_PLAN = 'Studio'

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [user, plans] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, include: { plan: true } }),
    db.plan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } }),
  ])

  return (
    <div style={{ maxWidth: '900px' }}>

      {/* Current plan banner */}
      <div
        className="rounded-2xl p-6 mb-6 bg-white"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
          Current Subscription
        </div>
        {user?.plan ? (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black" style={{ color: '#0f172a' }}>{user.plan.name}</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  Active
                </span>
              </div>
              <div className="text-sm" style={{ color: '#64748b' }}>
                {user.plan.price === 0
                  ? 'Custom pricing'
                  : `₹${annualPrice(user.plan.price).toLocaleString('en-IN')} / year`}
              </div>
              <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{user.plan.description}</div>
            </div>
            <a
              href={`mailto:${company.supportEmail}`}
              className="manage-link no-underline flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ background: '#f1f5f9', color: '#3b82f6' }}
            >
              Manage / Contact <ArrowRight size={12} />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black" style={{ color: '#0f172a' }}>No Active Plan</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  Inactive
                </span>
              </div>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Purchase a plan below to get your license key and unlock all features.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plan grid */}
      <div className="text-sm font-black mb-4 uppercase tracking-widest" style={{ color: '#0f172a' }}>
        {user?.plan ? 'Other Available Plans' : 'Choose a Plan'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map(plan => {
          const isCurrent = user?.planId === plan.id
          const isPopular = plan.name === POPULAR_PLAN
          const features  = JSON.parse(plan.features) as string[]

          return (
            <div
              key={plan.id}
              className={`plan-card relative rounded-2xl flex flex-col bg-white${isCurrent ? ' current' : ''}${isPopular ? ' popular' : ''}`}
              style={{
                border: isCurrent
                  ? '2px solid #3b82f6'
                  : isPopular
                  ? '2px solid #6366f1'
                  : '1px solid #f1f5f9',
                boxShadow: isCurrent
                  ? '0 0 0 4px rgba(59,130,246,0.08)'
                  : isPopular
                  ? '0 8px 24px rgba(99,102,241,0.12)'
                  : '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Popular badge */}
              {isPopular && !isCurrent && (
                <div
                  className="absolute -top-3 left-1/2 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: 'white',
                  }}
                >
                  <Star size={9} /> Most Popular
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                {/* Plan name + current badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                    {plan.name}
                  </span>
                  {isCurrent && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}
                    >
                      <Zap size={9} /> Active
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-black" style={{ color: '#0f172a' }}>Custom</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-black" style={{ color: '#0f172a' }}>
                        ₹{annualPrice(plan.price).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>/year</span>
                    </div>
                  )}
                </div>

                <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>{plan.description}</p>

                {/* Features */}
                <ul className="flex flex-col gap-2 flex-1 mb-5">
                  {features.slice(0, 5).map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: '#475569' }}>
                      <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div
                    className="text-center text-xs font-bold py-2.5 rounded-xl"
                    style={{ background: 'rgba(59,130,246,0.08)', color: '#3b82f6' }}
                  >
                    Current Plan
                  </div>
                ) : plan.price === 0 ? (
                  <a
                    href={`mailto:${company.supportEmail}?subject=Enterprise Plan Enquiry`}
                    className="no-underline block text-center text-xs font-bold py-2.5 rounded-xl transition-colors"
                    style={{ background: '#f1f5f9', color: '#475569' }}
                  >
                    Contact Sales
                  </a>
                ) : (
                  <UpgradeButton
                    planId={plan.id}
                    planName={plan.name}
                    price={plan.price}
                    userName={session.user.name ?? ''}
                    userEmail={session.user.email ?? ''}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs mt-5 text-center" style={{ color: '#cbd5e1' }}>
        Secure payments powered by Razorpay · For help email{' '}
        <a href={`mailto:${company.supportEmail}`} style={{ color: '#6366f1' }}>{company.supportEmail}</a>{' '}
        or call <strong style={{ color: '#94a3b8' }}>{company.phone}</strong>
      </p>
    </div>
  )
}
