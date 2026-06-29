import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { getRazorpay } from '@/lib/payment'
import { annualPrice } from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed, retryAfter } = await rateLimit(`create-order:${session.user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  // Instantiate lazily so a missing key never crashes module load / the build.
  const razorpay = getRazorpay()
  if (!razorpay) {
    logger.error('create-order: Razorpay keys not configured')
    return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 })
  }

  const body = await req.json().catch(() => null)
  const planId = typeof body?.planId === 'string' ? body.planId : null
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  if (plan.price <= 0) return NextResponse.json({ error: 'Contact sales for this plan' }, { status: 400 })

  // Sold as a one-year license: charge 12× the stored monthly base price.
  // Razorpay requires an integer amount in paise; Float * 100 can drift.
  const amountPaise = Math.round(annualPrice(plan.price) * 100)

  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `rcpt_${session.user.id.slice(-8)}_${Date.now()}`,
      // Server-set binding — verify/webhook trust ONLY these, never the client.
      notes: { userId: session.user.id, planId: plan.id, planName: plan.name, term: 'annual' },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
      keyId: env.razorpayKeyId(),
    })
  } catch (err) {
    logger.error('create-order: Razorpay order creation failed', err, { userId: session.user.id, planId })
    return NextResponse.json({ error: 'Could not start payment. Please try again.' }, { status: 502 })
  }
}
