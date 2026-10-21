import { NextRequest, NextResponse } from 'next/server'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { getRazorpay } from '@/lib/payment'
import { createSubscription } from '@/lib/billing'
import { isBillingInterval } from '@/lib/pricing'
import { getBillingRules } from '@/lib/billing-rules'
import { trialEligible } from '@/lib/web-app'

export const dynamic = 'force-dynamic'

/** Starts an auto-renewing ARC PEM subscription; the browser opens Razorpay Checkout with the returned id. */
export async function POST(req: NextRequest) {
  const session = await getActiveSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed, retryAfter } = await rateLimit(`subscribe:${session.user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  const razorpay = getRazorpay()
  if (!razorpay) {
    logger.error('subscription/checkout: Razorpay keys not configured')
    return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const planId = typeof body?.planId === 'string' ? body.planId : null
  const interval = body?.interval
  if (!planId || !isBillingInterval(interval)) {
    return NextResponse.json({ error: 'planId and interval (MONTH or YEAR) are required' }, { status: 400 })
  }
  const rules = await getBillingRules()
  const count = (v: unknown) => (v === undefined || v === null ? 0 : Number(v))
  const addons = { seats: count(body?.extraSeats), siteSeats: count(body?.extraSiteSeats) }
  const valid = (n: number) => Number.isInteger(n) && n >= 0 && n <= rules.maxAddonSeats
  if (!valid(addons.seats) || !valid(addons.siteSeats)) {
    return NextResponse.json({ error: `Add-on seats must be whole numbers from 0 to ${rules.maxAddonSeats}.` }, { status: 400 })
  }

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan || plan.product !== 'WEB') return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  if (!plan.isActive) return NextResponse.json({ error: 'This plan is no longer offered' }, { status: 400 })
  if (plan.price <= 0) return NextResponse.json({ error: 'Contact sales for this plan' }, { status: 400 })

  // Every payment gets a GST invoice, which needs the customer's billing name, address and state.
  const billing = await db.billingProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } })
  if (!billing) {
    return NextResponse.json(
      { error: 'Add your billing details first: they are printed on your GST invoice.', code: 'billing_details_required' },
      { status: 409 },
    )
  }

  // Extra site seats add nothing to a plan whose site seats are already unlimited: never charge for them.
  if (plan.maxSiteUsers >= 100_000) addons.siteSeats = 0

  const current = await db.webSubscription.findUnique({ where: { userId: session.user.id } })
  if (
    current?.autoRenew &&
    current.planId === plan.id &&
    current.billingInterval === interval &&
    current.extraSeats === addons.seats &&
    current.extraSiteSeats === addons.siteSeats
  ) {
    return NextResponse.json({ error: 'You are already subscribed to this plan.' }, { status: 409 })
  }

  try {
    const { subscriptionId, amountPaise, trialEndsAt } = await createSubscription(razorpay, {
      userId: session.user.id,
      email: session.user.email ?? '',
      plan,
      interval,
      addons,
      trial: rules.trialDays > 0 && !current && (await trialEligible(db, session.user.id)),
      rules,
      replaces: current?.autoRenew ? current.razorpaySubscriptionId : null,
    })
    return NextResponse.json({
      subscriptionId,
      amount: amountPaise,
      planName: plan.name,
      interval,
      trialEndsAt,
      keyId: env.razorpayKeyId(),
    })
  } catch (err) {
    logger.error('subscription/checkout: Razorpay subscription creation failed', err, { userId: session.user.id, planId })
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 })
  }
}
