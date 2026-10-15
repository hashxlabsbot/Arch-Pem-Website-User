import { CheckCircle2, ExternalLink, Globe } from 'lucide-react'
import type { Plan, WebSubscription } from '@prisma/client'
import UpgradeButton from '@/components/dashboard/UpgradeButton'
import { annualPrice } from '@/lib/pricing'
import { env } from '@/lib/env'

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  PAST_DUE: { label: 'Payment due', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  EXPIRED: { label: 'Expired', color: '#dc2626', bg: 'rgba(239,68,68,0.08)' },
  SUSPENDED: { label: 'Suspended', color: '#dc2626', bg: 'rgba(239,68,68,0.08)' },
  CANCELED: { label: 'Cancelled', color: '#64748b', bg: '#f1f5f9' },
}

const day = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

/** The firm's ARC PEM Web subscription: status, a way into the web app, and web plans to buy or renew. */
export default function WebAppSubscription({
  subscription,
  plans,
  userName,
  userEmail,
}: {
  subscription: (WebSubscription & { plan: Plan }) | null
  plans: Plan[]
  userName: string
  userEmail: string
}) {
  const appUrl = env.webAppUrl()
  const lapsed = subscription?.currentPeriodEnd ? subscription.currentPeriodEnd < new Date() : false
  const status = subscription ? STATUS[lapsed && subscription.status === 'ACTIVE' ? 'EXPIRED' : subscription.status] : null

  return (
    <section id="web" style={{ marginBottom: '40px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} style={{ color: '#4f46e5' }} />
        <span className="text-sm font-black uppercase tracking-widest" style={{ color: '#0f172a' }}>
          ARC PEM Web
        </span>
      </div>

      <div
        className="rounded-2xl p-6 mb-5 bg-white"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        {subscription && status ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-black" style={{ color: '#0f172a' }}>{subscription.plan.name}</span>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: status.bg, color: status.color }}
                >
                  {status.label}
                </span>
              </div>
              <div className="text-sm" style={{ color: '#64748b' }}>
                {subscription.firmName} · {subscription.seatLimit ?? subscription.plan.maxUsers} seats ·{' '}
                {subscription.projectLimit ?? subscription.plan.maxProjects} active projects
              </div>
              {subscription.currentPeriodEnd && (
                <div className="text-xs mt-2 font-semibold" style={{ color: '#475569' }}>
                  {lapsed ? 'Ended on ' : 'Renews / ends on '}
                  {day(subscription.currentPeriodEnd)}
                </div>
              )}
            </div>
            {appUrl && (
              <a
                href={`${appUrl}/auth/arcpem`}
                className="no-underline flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white' }}
              >
                Open ARC PEM Web <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <div>
            <div className="text-lg font-black mb-1" style={{ color: '#0f172a' }}>
              Run your firm&apos;s projects in the browser
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Choose a web plan below. Your firm&apos;s workspace is ready the moment payment completes: you sign in with
              this account and invite your team from inside the app.
            </p>
          </div>
        )}
      </div>

      {plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const current = subscription?.planId === plan.id
            const features = JSON.parse(plan.features || '[]') as string[]
            return (
              <div
                key={plan.id}
                className="rounded-2xl flex flex-col bg-white"
                style={{
                  border: current ? '2px solid #3b82f6' : '1px solid #f1f5f9',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#94a3b8' }}>
                    {plan.name}
                  </span>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-black" style={{ color: '#0f172a' }}>
                      ₹{annualPrice(plan.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>/year</span>
                  </div>
                  <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>{plan.description}</p>
                  <ul className="flex flex-col gap-2 flex-1 mb-5">
                    {features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs" style={{ color: '#475569' }}>
                        <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <UpgradeButton
                    planId={plan.id}
                    planName={plan.name}
                    price={plan.price}
                    userName={userName}
                    userEmail={userEmail}
                    label={current ? 'Renew for a year →' : subscription ? 'Switch to this plan →' : 'Buy →'}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
