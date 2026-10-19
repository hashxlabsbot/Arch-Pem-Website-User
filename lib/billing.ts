/**
 * Recurring billing for ARC PEM through Razorpay Subscriptions: a firm picks a plan and monthly or annual billing,
 * authorises auto-pay once (card, UPI AutoPay or bank e-mandate) and Razorpay charges every cycle after that.
 *
 * Each charge reaches us as `subscription.charged` (here and in the admin app) and is applied exactly once by
 * applySubscriptionCharge in lib/payment.ts. The firm, plan and interval are written into the subscription's notes
 * here, server-side; nothing the browser sends decides what is paid for.
 */
import type Razorpay from 'razorpay'
import type { Plan } from '@prisma/client'
import { db } from '@/lib/db'
import { isDuplicatePayment } from '@/lib/web-app'
import { subscriptionPrice, type BillingInterval, type BillingRules, type SeatAddons } from '@/lib/pricing'

/** How many cycles a subscription runs before Razorpay asks the customer to authorise again (~10 years). */
const TOTAL_COUNT: Record<BillingInterval, number> = { MONTH: 120, YEAR: 10 }
const PERIOD: Record<BillingInterval, 'monthly' | 'yearly'> = { MONTH: 'monthly', YEAR: 'yearly' }
/** An unpaid checkout stops accepting the first payment after this long. */
const CHECKOUT_TTL_S = 24 * 60 * 60

/**
 * The Razorpay plan for this plan, interval and amount (plan plus add-on seats), created on first use. Razorpay plans
 * are only a price; which seats were bought travels in the subscription's notes.
 */
export async function ensureRazorpayPlan(
  razorpay: Razorpay,
  plan: Plan,
  interval: BillingInterval,
  addons: SeatAddons,
  rules: BillingRules,
) {
  const amountPaise = Math.round(subscriptionPrice(plan.price, interval, addons, rules) * 100)
  const known = await db.razorpayPlan.findUnique({
    where: { planId_billingInterval_amountPaise: { planId: plan.id, billingInterval: interval, amountPaise } },
  })
  if (known) return { id: known.id, amountPaise }

  const created = (await razorpay.plans.create({
    period: PERIOD[interval],
    interval: 1,
    item: {
      name: `ARC PEM ${plan.name.replace(/^web\s+/i, '')} (${interval === 'MONTH' ? 'monthly' : 'annual'})${addons.seats || addons.siteSeats ? ` + ${addons.seats} seats, ${addons.siteSeats} site seats` : ''}`,
      amount: amountPaise,
      currency: 'INR',
      description: plan.description.slice(0, 250),
    },
    notes: { planId: plan.id, interval, extraSeats: String(addons.seats), extraSiteSeats: String(addons.siteSeats) },
  })) as { id: string }
  try {
    await db.razorpayPlan.create({ data: { id: created.id, planId: plan.id, billingInterval: interval, amountPaise } })
    return { id: created.id, amountPaise }
  } catch (err) {
    // Another checkout created it at the same moment: use theirs (the extra Razorpay plan is never used).
    if (!isDuplicatePayment(err)) throw err
    const winner = await db.razorpayPlan.findUniqueOrThrow({
      where: { planId_billingInterval_amountPaise: { planId: plan.id, billingInterval: interval, amountPaise } },
    })
    return { id: winner.id, amountPaise }
  }
}

/** Starts a subscription for the firm; the browser then opens Razorpay Checkout with its id. */
export async function createSubscription(
  razorpay: Razorpay,
  input: {
    userId: string
    email: string
    plan: Plan
    interval: BillingInterval
    addons: SeatAddons
    /** First subscription only: auto-pay is set up now and the first charge is taken when the trial ends. */
    trial: boolean
    rules: BillingRules
    replaces?: string | null
  },
) {
  const rzpPlan = await ensureRazorpayPlan(razorpay, input.plan, input.interval, input.addons, input.rules)
  const trialDays = input.trial ? input.rules.trialDays : 0
  const trialEndsAt = trialDays > 0 ? new Date(Date.now() + trialDays * 86_400_000) : null
  const sub = (await razorpay.subscriptions.create({
    plan_id: rzpPlan.id,
    total_count: TOTAL_COUNT[input.interval],
    quantity: 1,
    customer_notify: 1,
    expire_by: Math.floor(Date.now() / 1000) + CHECKOUT_TTL_S,
    ...(trialEndsAt ? { start_at: Math.floor(trialEndsAt.getTime() / 1000) } : {}),
    // Server-set binding: every charge of this subscription is applied to this firm, plan and interval.
    // `replaces`: the firm's running subscription, retired once this one's first charge goes through.
    notes: {
      userId: input.userId,
      planId: input.plan.id,
      interval: input.interval,
      email: input.email,
      extraSeats: String(input.addons.seats),
      extraSiteSeats: String(input.addons.siteSeats),
      ...(trialEndsAt ? { trial: '1', trialEndsAt: trialEndsAt.toISOString() } : {}),
      ...(input.replaces ? { replaces: input.replaces } : {}),
    },
  })) as { id: string }
  return { subscriptionId: sub.id, amountPaise: rzpPlan.amountPaise, trialEndsAt }
}
