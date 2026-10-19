'use client'

import { useState } from 'react'
import { CheckCircle2, Minus, Plus } from 'lucide-react'
import SubscribeButton from '@/components/dashboard/SubscribeButton'
import {
  annualSavingPct,
  subscriptionPrice,
  type BillingInterval,
  type BillingRules,
  type SeatAddons,
} from '@/lib/pricing'
import { isQuoted, isUnlimited } from '@/lib/plan-order'

export type PickerPlan = {
  id: string
  name: string
  tier: string | null
  price: number
  description: string
  features: string[]
  maxUsers: number
  maxSiteUsers: number
}

export type CurrentSubscription = {
  planId: string
  interval: BillingInterval
  autoRenew: boolean
  extraSeats: number
  extraSiteSeats: number
}

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
const shortName = (name: string) => name.replace(/^web\s+/i, '')
const cleanFeature = (f: string) => f.replace(/\bWeb (Solo|Starter|Studio|Business|Enterprise)\b/g, '$1')

function Stepper({ label, hint, value, max, onChange }: { label: string; hint: string; value: number; max: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.max(0, Math.min(max, n)))
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <div>
        <div className="text-sm font-bold" style={{ color: '#0f172a' }}>{label}</div>
        <div className="text-xs" style={{ color: '#64748b' }}>{hint}</div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Fewer ${label.toLowerCase()}`} onClick={() => set(value - 1)} disabled={value === 0}
          className="grid h-8 w-8 place-items-center rounded-lg" style={{ border: '1px solid #cbd5e1', background: '#fff', opacity: value === 0 ? 0.4 : 1 }}>
          <Minus size={14} />
        </button>
        <span className="w-7 text-center text-sm font-black" style={{ color: '#0f172a' }} aria-live="polite">{value}</span>
        <button type="button" aria-label={`More ${label.toLowerCase()}`} onClick={() => set(value + 1)} disabled={value >= max}
          className="grid h-8 w-8 place-items-center rounded-lg" style={{ border: '1px solid #cbd5e1', background: '#fff' }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

/** ARC PEM plans with a monthly / annual switch and add-on seats; each card starts an auto-renewing subscription. */
export default function WebPlanPicker({
  plans,
  current,
  userName,
  userEmail,
  gstNote,
  initialInterval,
  trialAvailable,
  salesEmail,
  rules,
}: {
  rules: BillingRules
  initialInterval?: BillingInterval
  gstNote: string
  plans: PickerPlan[]
  current: CurrentSubscription | null
  userName: string
  userEmail: string
  trialAvailable: boolean
  salesEmail: string
}) {
  const [interval, setBilling] = useState<BillingInterval>(initialInterval ?? current?.interval ?? 'MONTH')
  const [addons, setAddons] = useState<SeatAddons>({ seats: current?.extraSeats ?? 0, siteSeats: current?.extraSiteSeats ?? 0 })
  const saving = annualSavingPct(rules)
  const per = interval === 'MONTH' ? 'month' : 'year'
  const addonCost = subscriptionPrice(0, interval, addons, rules)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="text-sm font-bold" style={{ color: '#0f172a' }}>
          {current ? 'Change plan, seats or billing' : 'Choose your plan'}
        </div>
        <div role="radiogroup" aria-label="Billing cycle" className="inline-flex rounded-xl p-1" style={{ background: '#f1f5f9' }}>
          {(['MONTH', 'YEAR'] as const).map((i) => (
            <button
              key={i}
              role="radio"
              aria-checked={interval === i}
              onClick={() => setBilling(i)}
              className="rounded-lg px-4 py-1.5 text-xs font-bold transition"
              style={{
                border: 0,
                cursor: 'pointer',
                ...(interval === i
                  ? { background: '#fff', color: '#4f46e5', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }
                  : { background: 'transparent', color: '#64748b' }),
              }}
            >
              {i === 'MONTH' ? 'Monthly' : 'Annual'}
              {i === 'YEAR' && saving > 0 && <span className="ml-1.5 text-[10px]" style={{ color: '#059669' }}>Save {saving}%</span>}
            </button>
          ))}
        </div>
      </div>

      {trialAvailable && rules.trialDays > 0 && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' }}>
          <b>{rules.trialDays}-day free trial.</b> Set up auto-pay now and nothing is charged until the trial ends. Cancel before then
          and you pay nothing.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 mb-5">
        <Stepper
          label="Extra team seats"
          hint={`₹${rules.seatAddonMonthly}/month each · partners, accounts, office`}
          max={rules.maxAddonSeats}
          value={addons.seats}
          onChange={(seats) => setAddons((a) => ({ ...a, seats }))}
        />
        <Stepper
          label="Extra site seats"
          hint={`₹${rules.siteSeatAddonMonthly}/month each · site engineers, supervisors`}
          max={rules.maxAddonSeats}
          value={addons.siteSeats}
          onChange={(siteSeats) => setAddons((a) => ({ ...a, siteSeats }))}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const quoted = isQuoted(plan)
          // Site seats are already unlimited on Business: extra ones would add nothing, so they are not charged.
          const planAddons = isUnlimited(plan.maxSiteUsers) ? { ...addons, siteSeats: 0 } : addons
          const sameSeats = current?.extraSeats === planAddons.seats && current?.extraSiteSeats === planAddons.siteSeats
          const isCurrent = current?.planId === plan.id && current.interval === interval && current.autoRenew && sameSeats
          const price = subscriptionPrice(plan.price, interval, planAddons, rules)
          const seats = plan.maxUsers + addons.seats
          const siteSeats = isUnlimited(plan.maxSiteUsers) ? 'Unlimited' : plan.maxSiteUsers + addons.siteSeats
          return (
            <div
              key={plan.id}
              className="rounded-2xl flex flex-col bg-white"
              style={{ border: isCurrent ? '2px solid #6366f1' : plan.tier === 'STUDIO' ? '1.5px solid #c7d2fe' : '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="p-5 flex flex-col flex-1">
                <span className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: plan.tier === 'STUDIO' ? '#4f46e5' : '#94a3b8' }}>
                  {shortName(plan.name)}{plan.tier === 'STUDIO' ? ' · Most popular' : ''}
                </span>
                {quoted ? (
                  <div className="text-3xl font-black mb-1" style={{ color: '#0f172a' }}>Custom</div>
                ) : (
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-3xl font-black" style={{ color: '#0f172a' }}>{inr(price)}</span>
                    <span className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>/{per}</span>
                  </div>
                )}
                <p className="text-[11px] mb-2 font-semibold" style={{ color: '#6366f1' }}>
                  {quoted ? 'Annual agreement' : `${seats} team seats · ${siteSeats} site seats`}
                </p>
                <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>{plan.description}</p>
                <ul className="flex flex-col gap-2 flex-1 mb-5">
                  {plan.features.slice(0, 5).map(cleanFeature).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs" style={{ color: '#475569' }}>
                      <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {quoted ? (
                  <a
                    href={`mailto:${salesEmail}?subject=${encodeURIComponent('ARC PEM Enterprise')}`}
                    className="w-full rounded-xl py-2.5 text-center text-sm font-bold no-underline"
                    style={{ border: '1px solid #c7d2fe', color: '#4f46e5', background: '#eef2ff' }}
                  >
                    Talk to sales
                  </a>
                ) : isCurrent ? (
                  <div className="rounded-xl py-2.5 text-center text-sm font-bold" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                    Your current plan
                  </div>
                ) : (
                  <SubscribeButton
                    planId={plan.id}
                    planName={plan.name.replace(/^web\s+/i, 'ARC PEM ')}
                    interval={interval}
                    addons={planAddons}
                    userName={userName}
                    userEmail={userEmail}
                    primary={!current && plan.tier === 'STUDIO'}
                    label={
                      current?.autoRenew
                        ? current.planId === plan.id
                          ? 'Update seats or billing'
                          : 'Switch to this plan'
                        : current?.planId === plan.id && current.interval === interval
                          ? 'Turn on auto-renew'
                          : trialAvailable && rules.trialDays > 0
                            ? 'Start free trial'
                            : 'Subscribe'
                    }
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
        {addonCost > 0 && <>Prices include your add-on seats (up to {inr(addonCost)}/{per}; site seats are already unlimited on Business). </>}
        Pay by credit or debit card, UPI AutoPay or netbanking / debit-card e-mandate. You authorise auto-pay once and
        each {per} is charged automatically; turn auto-renew off at any time.
        {current?.autoRenew ? ' Changing plan or seats starts the new subscription now and stops the old one from renewing; the time you have already paid for is kept.' : ''}{' '}
        {gstNote} By subscribing you agree to our{' '}
        <a href="/terms" target="_blank" className="underline">Terms</a> and{' '}
        <a href="/refund" target="_blank" className="underline">Refund Policy</a>.
      </p>
    </div>
  )
}
