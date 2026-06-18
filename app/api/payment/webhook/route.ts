import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { activatePaidPlan } from '@/lib/payment'
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

  // We only act on a captured payment. order.paid carries the same payment entity.
  const type = event?.event as string | undefined
  if (type !== 'payment.captured' && type !== 'order.paid') {
    // Acknowledge everything else so Razorpay stops retrying.
    return NextResponse.json({ received: true })
  }

  const payment = event?.payload?.payment?.entity
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
