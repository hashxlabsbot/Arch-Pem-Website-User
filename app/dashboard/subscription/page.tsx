import { ArrowRight, Monitor } from 'lucide-react'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import WebAppSubscription from '@/components/dashboard/WebAppSubscription'
import { company } from '@/lib/company'
import { annualPrice, type BillingInterval } from '@/lib/pricing'
import { sortByTier } from '@/lib/plan-order'
import { getBillingRules } from '@/lib/billing-rules'

export default async function SubscriptionPage(props: { searchParams: Promise<{ billing?: string }> }) {
  const searchParams = await props.searchParams
  const session = await getActiveSession()
  if (!session) return null

  const [user, plans, rules, invoices] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { plan: true, webSubscription: { include: { plan: true } }, billingProfile: true },
    }),
    db.plan.findMany({ where: { isActive: true, product: 'WEB' } }).then(sortByTier),
    getBillingRules(),
    db.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { issuedAt: 'desc' },
      take: 24,
      select: { id: true, invoiceNumber: true, planName: true, total: true, issuedAt: true },
    }),
  ])
  // /pricing sends ?billing=annual|monthly with the plan the visitor picked.
  const billing: BillingInterval | undefined =
    searchParams.billing === 'annual' ? 'YEAR' : searchParams.billing === 'monthly' ? 'MONTH' : undefined
  const desktop = user?.plan?.product === 'DESKTOP' ? user.plan : null

  return (
    <div style={{ maxWidth: '900px' }}>
      <WebAppSubscription
        subscription={user?.webSubscription ?? null}
        plans={plans}
        userName={session.user.name ?? ''}
        userEmail={session.user.email ?? ''}
        initialInterval={billing}
        rules={rules}
        billing={user?.billingProfile ?? null}
        invoices={invoices}
      />

      {/* Customers from before ARC PEM moved to the web keep seeing their desktop licence here. */}
      {desktop && (
        <section className="rounded-2xl p-5 mb-6 bg-white" style={{ border: '1px solid #f1f5f9' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="grid place-items-center rounded-xl" style={{ width: 38, height: 38, background: '#f1f5f9', color: '#475569' }}>
                <Monitor size={18} />
              </span>
              <div>
                <div className="text-sm font-black" style={{ color: '#0f172a' }}>
                  Desktop licence · {desktop.name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  {desktop.price === 0 ? 'Custom pricing' : `₹${annualPrice(desktop.price).toLocaleString('en-IN')} / year`}
                  {user?.planExpiresAt &&
                    ` · ${user.planExpiresAt < new Date() ? 'expired on' : 'valid until'} ${user.planExpiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                </div>
                <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  Moving to ARC PEM on the web? We&apos;ll help bring your desktop data across.
                </div>
              </div>
            </div>
            <a
              href={`mailto:${company.supportEmail}?subject=${encodeURIComponent('Desktop licence')}`}
              className="no-underline flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ background: '#f1f5f9', color: '#4f46e5' }}
            >
              Contact support <ArrowRight size={12} />
            </a>
          </div>
        </section>
      )}

      <p className="text-xs mt-5 text-center" style={{ color: '#94a3b8' }}>
        Secure payments powered by Razorpay · For help email{' '}
        <a href={`mailto:${company.supportEmail}`} style={{ color: '#6366f1' }}>{company.supportEmail}</a>{' '}
        or call <strong style={{ color: '#64748b' }}>{company.phone}</strong>
      </p>
    </div>
  )
}
