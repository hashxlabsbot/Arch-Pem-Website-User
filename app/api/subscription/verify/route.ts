import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getActiveSession } from '@/lib/auth'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { applySubscriptionCharge, getRazorpay, startSubscriptionTrial } from '@/lib/payment'
import type { RazorpayPaymentEntity, RazorpaySubscriptionEntity } from '@/lib/web-app'

export const dynamic = 'force-dynamic'

/**
 * Called by the browser when Razorpay Checkout finishes the first payment of a subscription, so the plan is active
 * before the owner leaves the page. The `subscription.charged` webhook applies the same charge if this never runs.
 */
export async function POST(req: NextRequest) {
  const session = await getActiveSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`subscribe-verify:${session.user.id}`, 20, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const secret = env.razorpayKeySecret()
  const razorpay = getRazorpay()
  if (!secret || !razorpay) {
    logger.error('subscription/verify: Razorpay keys not configured')
    return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const paymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id : ''
  const subscriptionId = typeof body?.razorpay_subscription_id === 'string' ? body.razorpay_subscription_id : ''
  const signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature : ''
  if (!paymentId || !subscriptionId || !signature) {
    return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 })
  }

  // Razorpay signs "<payment id>|<subscription id>" for subscription checkouts.
  const expected = Buffer.from(crypto.createHmac('sha256', secret).update(`${paymentId}|${subscriptionId}`).digest('hex'))
  const provided = Buffer.from(signature)
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) {
    logger.warn('subscription/verify: signature mismatch', { userId: session.user.id })
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // The signature proves the pair is genuine; what it pays for comes from Razorpay's own records.
  let subscription: RazorpaySubscriptionEntity
  let payment: RazorpayPaymentEntity
  try {
    subscription = (await razorpay.subscriptions.fetch(subscriptionId)) as unknown as RazorpaySubscriptionEntity
    payment = (await razorpay.payments.fetch(paymentId)) as unknown as RazorpayPaymentEntity
  } catch (err) {
    logger.error('subscription/verify: Razorpay fetch failed', err, { subscriptionId, paymentId })
    return NextResponse.json({ error: 'Could not verify payment with Razorpay.' }, { status: 502 })
  }

  // A free trial: auto-pay is set up and nothing is charged until the trial ends.
  const notes = (Array.isArray(subscription.notes) ? {} : subscription.notes ?? {}) as Record<string, string>
  if (notes.trial === '1' && (subscription.paid_count ?? 0) === 0) {
    if (notes.userId !== session.user.id) return NextResponse.json({ error: 'This subscription does not belong to you.' }, { status: 403 })
    const trial = await startSubscriptionTrial(subscription)
    if (!trial.ok) return NextResponse.json({ error: trial.error }, { status: trial.status })
    return NextResponse.json({ success: true, trial: true, trialEndsAt: notes.trialEndsAt })
  }

  // Mandate set up but the first charge is still settling: the webhook activates the plan when it lands.
  if (payment.status !== 'captured') return NextResponse.json({ success: true, pending: true }, { status: 202 })

  const result = await applySubscriptionCharge({ subscription, payment, expectedUserId: session.user.id })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ success: true, planName: result.planName })
}
