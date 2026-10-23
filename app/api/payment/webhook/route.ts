import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { activatePaidPlan, applySubscriptionCharge, startSubscriptionTrial } from '@/lib/payment'
import { applyRenewalChange, deliverOutbox } from '@/lib/web-app'
import crypto from 'crypto'

// Razorpay calls this server-to-server. It is the AUTHORITATIVE activation path:
// it still fires when the buyer closes the tab before the browser verify call.
// No user session here — trust comes from the webhook HMAC signature.
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const secret = env.razorpayWebhookSecret()
  if (!secret) {
    logger.error('payment/webhook: RAZORPAY_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  // Read the RAW body — the signature is computed over the exact bytes sent.
  const rawBody = await req.text()
  const provided = req.headers.get('x-razorpay-signature') ?? ''

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const providedBuf = Buffer.from(provided, 'utf8')
  const signatureValid =
    expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf)

  if (!signatureValid) {
    logger.warn('payment/webhook: signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const type = event?.event as string | undefined
  const subscription = event?.payload?.subscription?.entity

  // ARC PEM subscriptions: every charge (first and renewals) arrives as subscription.charged.
  if (type === 'subscription.charged') {
    const charged = event?.payload?.payment?.entity
    if (!subscription?.id || !charged?.id) return NextResponse.json({ received: true })
    const result = await applySubscriptionCharge({ subscription, payment: charged })
    if (!result.ok && result.status >= 500) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json({ received: true, processed: result.ok && !result.alreadyProcessed })
  }
  // Auto-pay set up for a free trial: the plan starts now and the first charge comes when the trial ends.
  if (type === 'subscription.authenticated') {
    if (!subscription?.id) return NextResponse.json({ received: true })
    const notes = Array.isArray(subscription.notes) ? {} : subscription.notes ?? {}
    if (notes.trial !== '1') return NextResponse.json({ received: true })
    const result = await startSubscriptionTrial(subscription)
    if (!result.ok && result.status >= 500) return NextResponse.json({ error: result.error }, { status: result.status })
    return NextResponse.json({ received: true })
  }
  const RENEWAL_CHANGES: Record<string, 'cancelled' | 'completed' | 'halted' | 'pending'> = {
    'subscription.cancelled': 'cancelled',
    'subscription.completed': 'completed',
    'subscription.halted': 'halted',
    'subscription.pending': 'pending',
  }
  if (type && RENEWAL_CHANGES[type]) {
    if (!subscription?.id) return NextResponse.json({ received: true })
    try {
      const eventId = await db.$transaction((tx) => applyRenewalChange(tx, subscription.id, RENEWAL_CHANGES[type]))
      if (eventId) await deliverOutbox({ ids: [eventId] }).catch((err: unknown) => logger.error('payment/webhook: web-app delivery failed (will retry)', err))
    } catch (err) {
      logger.error('payment/webhook: subscription state update failed', err, { type, subscriptionId: subscription.id })
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    return NextResponse.json({ received: true })
  }

  // One-off orders (legacy desktop licences): act on a captured payment. order.paid carries the same payment entity.
  if (type !== 'payment.captured' && type !== 'order.paid') {
    // Acknowledge everything else so Razorpay stops retrying.
    return NextResponse.json({ received: true })
  }

  const payment = event?.payload?.payment?.entity
  // A subscription charge also raises payment.captured; subscription.charged above is what applies it.
  if (payment?.invoice_id || payment?.subscription_id) return NextResponse.json({ received: true })
  const orderId = payment?.order_id
  const paymentId = payment?.id
  if (!orderId || !paymentId) {
    logger.warn('payment/webhook: missing order/payment id', { type })
    // Acknowledge — a malformed payload won't succeed on retry.
    return NextResponse.json({ received: true })
  }

  // No expectedUserId — server-to-server. activatePaidPlan re-fetches from
  // Razorpay, validates, and activates idempotently (safe with the verify path).
  const result = await activatePaidPlan({ orderId, paymentId })

  if (!result.ok) {
    // Transient failures (502/500) → non-2xx so Razorpay retries. Validation
    // failures (4xx) → 200 so it stops retrying a payload that can't succeed.
    if (result.status >= 500) {
      logger.error('payment/webhook: transient activation failure', undefined, { orderId, paymentId, status: result.status })
      return NextResponse.json({ error: result.error }, { status: result.status })
    }
    logger.warn('payment/webhook: activation rejected', { orderId, paymentId, status: result.status, error: result.error })
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true, processed: !result.alreadyProcessed })
}
