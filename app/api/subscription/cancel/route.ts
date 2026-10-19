import { NextResponse } from 'next/server'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { stopRenewals } from '@/lib/payment'

export const dynamic = 'force-dynamic'

/** Turns auto-renew off. The firm keeps full access until the end of the period it has paid for. */
export async function POST() {
  const session = await getActiveSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed } = await rateLimit(`subscribe-cancel:${session.user.id}`, 10, 60 * 60 * 1000)
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const sub = await db.webSubscription.findUnique({ where: { userId: session.user.id } })
  if (!sub?.autoRenew || !sub.razorpaySubscriptionId) {
    return NextResponse.json({ error: 'Auto-renew is not on for this account.' }, { status: 409 })
  }
  if (!(await stopRenewals(sub.razorpaySubscriptionId))) {
    return NextResponse.json({ error: 'Could not turn off auto-renew. Please try again or contact support.' }, { status: 502 })
  }
  return NextResponse.json({ success: true, accessUntil: sub.currentPeriodEnd })
}
