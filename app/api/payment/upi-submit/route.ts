import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { sendPaymentReceivedEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed, retryAfter } = await rateLimit(`upi-submit:${session.user.id}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  const { planId, utr } = await req.json()
  if (!planId || !utr?.trim()) {
    return NextResponse.json({ error: 'planId and UTR are required' }, { status: 400 })
  }

  const plan = await db.plan.findUnique({ where: { id: planId } })
  if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const existing = await db.pendingPayment.findFirst({ where: { utr: utr.trim() } })
  if (existing) {
    return NextResponse.json({ error: 'This transaction ID has already been submitted.' }, { status: 409 })
  }

  await db.pendingPayment.create({
    data: {
      userId:   session.user.id,
      planId:   plan.id,
      planName: plan.name,
      amount:   plan.price,
      utr:      utr.trim(),
      status:   'pending',
    },
  })

  // Send confirmation email (non-blocking — don't fail the request if email fails)
  sendPaymentReceivedEmail({
    to:       session.user.email!,
    name:     session.user.name ?? 'there',
    planName: plan.name,
    amount:   plan.price,
    utr:      utr.trim(),
  }).catch(err => console.error('[email] payment received:', err))

  return NextResponse.json({ success: true })
}
