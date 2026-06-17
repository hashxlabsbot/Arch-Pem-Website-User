import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
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

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json()
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
    return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 })
  }

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Verify Razorpay signature with a constant-time compare. Buffers must be the
  // same length or crypto.timingSafeEqual throws — so compare hex strings of
  // known equal length defensively.
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  const expectedBuf = Buffer.from(expected, 'utf8')
  const providedBuf = Buffer.from(String(razorpay_signature), 'utf8')
  const signatureValid =
    expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf)

  if (!signatureValid) {
    logger.warn('payment/verify: signature mismatch', { userId: session.user.id })
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { planId: plan.id },
  })

  return NextResponse.json({ success: true })
}
