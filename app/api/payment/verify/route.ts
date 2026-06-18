import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { activatePaidPlan } from '@/lib/payment'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`pay-verify:${session.user.id}`, 20, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const secret = env.razorpayKeySecret()
  if (!secret) {
    logger.error('payment/verify: RAZORPAY_KEY_SECRET not configured')
    return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const razorpay_order_id = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id : ''
  const razorpay_payment_id = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id : ''
  const razorpay_signature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature : ''
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 })
  }

  // Verify the Razorpay checkout signature with a constant-time compare. Buffers
  // must be equal length for crypto.timingSafeEqual, so guard the length first.
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const expectedBuf = Buffer.from(expected, 'utf8')
  const providedBuf = Buffer.from(razorpay_signature, 'utf8')
  const signatureValid =
    expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf)

  if (!signatureValid) {
    logger.warn('payment/verify: signature mismatch', { userId: session.user.id })
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // The signature only proves the order/payment pair is authentic. activatePaidPlan
  // is the authority: it derives the plan from the order's server-set notes,
  // confirms the payment is captured and the amount matches, checks the order
  // belongs to this user, and activates idempotently. Any client-sent planId is
  // intentionally ignored — this closes the price-substitution hole.
  const result = await activatePaidPlan({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    expectedUserId: session.user.id,
  })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ success: true, planName: result.planName })
}
