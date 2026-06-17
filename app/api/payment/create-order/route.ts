import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import Razorpay from 'razorpay'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed, retryAfter } = await rateLimit(`create-order:${session.user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  // Instantiate lazily so a missing key never crashes module load / the build.
  const keyId = env.razorpayKeyId()
  const keySecret = env.razorpayKeySecret()
  if (!keyId || !keySecret) {
    logger.error('create-order: Razorpay keys not configured')
    return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 503 })
  }
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

  const { planId } = await req.json()
  if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 })

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
  if (plan.price === 0) return NextResponse.json({ error: 'Contact sales for this plan' }, { status: 400 })

  const order = await razorpay.orders.create({
    amount: plan.price * 100, // paise
    currency: 'INR',
    receipt: `rcpt_${session.user.id.slice(-8)}_${Date.now()}`,
    notes: { userId: session.user.id, planId: plan.id, planName: plan.name },
  })

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    planName: plan.name,
    keyId,
  })
}
