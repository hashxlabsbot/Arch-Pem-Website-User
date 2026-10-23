import { Download, ExternalLink, FileText, Globe, RefreshCcw } from 'lucide-react'
import type { Plan, WebSubscription } from '@prisma/client'
import WebPlanPicker from '@/components/dashboard/WebPlanPicker'
import BillingDetailsForm from '@/components/dashboard/BillingDetailsForm'
import type { BillingDetails } from '@/lib/gst'
import CancelAutoRenew from '@/components/dashboard/CancelAutoRenew'
import { company } from '@/lib/company'
import { env } from '@/lib/env'
import { isBillingInterval, type BillingInterval, type BillingRules } from '@/lib/pricing'
import { isUnlimited } from '@/lib/plan-order'

const limitLabel = (n: number) => (isUnlimited(n) ? 'unlimited' : String(n))

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: 'Active', color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  PAST_DUE: { label: 'Payment due', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  EXPIRED: { label: 'Expired', color: '#dc2626', bg: 'rgba(239,68,68,0.08)' },
  SUSPENDED: { label: 'Suspended', color: '#dc2626', bg: 'rgba(239,68,68,0.08)' },
  CANCELED: { label: 'Cancelled', color: '#64748b', bg: '#f1f5f9' },
}

const day = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })

/** The firm's ARC PEM subscription: status, auto-renew, a way into the app, and plans to subscribe or switch to. */
export default function WebAppSubscription({
  subscription,
  plans,
  userName,
  userEmail,
  initialInterval,
  rules,
  billing,
  invoices,
}: {
  rules: BillingRules
  initialInterval?: BillingInterval
  subscription: (WebSubscription & { plan: Plan }) | null
  plans: Plan[]
  userName: string
  userEmail: string
  billing: BillingDetails | null
  invoices: { id: string; invoiceNumber: string; planName: string; total: number; issuedAt: Date }[]
}) {
  const appUrl = env.webAppUrl()
  const end = subscription?.currentPeriodEnd ?? null
  const lapsed = end ? end < new Date() : false
  const status = subscription ? STATUS[lapsed && subscription.status === 'ACTIVE' ? 'EXPIRED' : subscription.status] : null
  const interval = subscription && isBillingInterval(subscription.billingInterval) ? subscription.billingInterval : 'YEAR'
  const gstNote = company.pricesIncludeGst
    ? `Prices include ${company.gstRatePct}% GST.`
    : `Prices are before ${company.gstRatePct}% GST, which is added at checkout and shown on your invoice.`

  return (
    <section id="web" style={{ marginBottom: '40px' }}>
      <div className="flex items-center gap-2 mb-4">
        <Globe size={16} style={{ color: '#4f46e5' }} />
        <span className="text-sm font-black uppercase tracking-widest" style={{ color: '#0f172a' }}>
          ARC PEM subscription
        </span>
      </div>

      <div className="rounded-2xl p-6 mb-6 bg-white" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {subscription && status ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-2xl font-black" style={{ color: '#0f172a' }}>
                  {subscription.plan.name.replace(/^web\s+/i, 'ARC PEM ')}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: status.bg, color: status.color }}>
                  {status.label}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  {interval === 'MONTH' ? 'Monthly' : 'Annual'}
                </span>
              </div>
              <div className="text-sm" style={{ color: '#64748b' }}>
                {subscription.firmName} · {subscription.seatLimit ?? subscription.plan.maxUsers} team seats ·{' '}
                {limitLabel(subscription.siteSeatLimit ?? subscription.plan.maxSiteUsers)} site seats ·{' '}
                {limitLabel(subscription.projectLimit ?? subscription.plan.maxProjects)} active projects
              </div>
              {end && (
                <div className="flex items-center gap-1.5 text-xs mt-2 font-semibold" style={{ color: '#475569' }}>
                  {subscription.trialEndsAt && !lapsed ? (
                    <>
                      <RefreshCcw size={12} style={{ color: '#059669' }} />
                      Free trial until {day(subscription.trialEndsAt)} · {subscription.autoRenew ? 'first charge then' : 'auto-renew off, nothing will be charged'}
                    </>
                  ) : subscription.autoRenew && !lapsed ? (
                    <>
                      <RefreshCcw size={12} style={{ color: '#059669' }} /> Auto-renews on {day(end)}
                    </>
                  ) : lapsed ? (
                    <>Ended on {day(end)}</>
                  ) : (
                    <>Auto-renew is off · access until {day(end)}</>
                  )}
                </div>
              )}
              {subscription.status === 'PAST_DUE' && (
                <div className="text-xs mt-2 font-semibold" style={{ color: '#d97706' }}>
                  Your last renewal payment did not go through. Subscribe again below to keep your workspace active.
                </div>
              )}
              {subscription.autoRenew && end && !lapsed && (
                <div className="mt-3">
                  <CancelAutoRenew accessUntil={day(end)} />
                </div>
              )}
            </div>
            {appUrl && (
              <a
                href={`${appUrl}/auth/arcpem`}
                className="no-underline flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl"
                style={{ background: 'linear-gradient(100deg, #7c3aed, #6366f1 50%, #3b82f6)', color: 'white' }}
              >
                Open ARC PEM <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <div>
            <div className="text-lg font-black mb-1" style={{ color: '#0f172a' }}>
              Run your firm&apos;s projects in ARC PEM
            </div>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Choose a plan and pay monthly or annually. Your firm&apos;s workspace is ready the moment payment completes:
              you sign in with this account and invite your team from inside the app.
            </p>
          </div>
        )}
      </div>

      <BillingDetailsForm initial={billing} />

      {plans.length > 0 && (
        <WebPlanPicker
          billingReady={Boolean(billing)}
          plans={plans.map((p) => ({
            id: p.id,
            name: p.name,
            tier: p.tier,
            maxUsers: p.maxUsers,
            maxSiteUsers: p.maxSiteUsers,
            price: p.price,
            description: p.description,
            features: JSON.parse(p.features || '[]') as string[],
          }))}
          current={
            subscription
              ? {
                  planId: subscription.planId,
                  interval,
                  autoRenew: subscription.autoRenew,
                  extraSeats: subscription.extraSeats,
                  extraSiteSeats: subscription.extraSiteSeats,
                }
              : null
          }
          trialAvailable={!subscription}
          salesEmail={company.salesEmail}
          rules={rules}
          userName={userName}
          userEmail={userEmail}
          gstNote={gstNote}
          initialInterval={initialInterval}
        />
      )}

      {invoices.length > 0 && (
        <div className="rounded-2xl p-6 mt-6 bg-white" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} style={{ color: '#4f46e5' }} />
            <span className="text-sm font-bold" style={{ color: '#0f172a' }}>GST invoices</span>
          </div>
          <ul className="flex flex-col">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5" style={{ borderTop: '1px solid #f1f5f9' }}>
                <div className="text-sm" style={{ color: '#475569' }}>
                  <span className="font-semibold" style={{ color: '#0f172a' }}>{inv.invoiceNumber}</span> · {day(inv.issuedAt)} ·{' '}
                  {inv.planName.replace(/^web\s+/i, 'ARC PEM ')} · ₹{inv.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <a href={`/api/invoices/${inv.id}`} className="flex items-center gap-1 text-xs font-bold no-underline" style={{ color: '#4f46e5' }}>
                  <Download size={12} /> PDF
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
