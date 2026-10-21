import { NextRequest, NextResponse } from 'next/server'
import { getActiveSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { logger } from '@/lib/logger'
import { rateLimit } from '@/lib/rate-limit'
import { validateBillingDetails } from '@/lib/gst'

export const dynamic = 'force-dynamic'

/** Saves the signed-in customer's billing details, printed on the GST invoice for each payment from now on. */
export async function PUT(req: NextRequest) {
  const session = await getActiveSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { allowed, retryAfter } = await rateLimit(`billing-details:${session.user.id}`, 20, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
  }

  const result = validateBillingDetails(await req.json().catch(() => null))
  if (!result.ok) return NextResponse.json({ error: result.error, field: result.field }, { status: 400 })

  const data = { ...result.data, email: result.data.email ?? session.user.email?.toLowerCase() ?? null }
  try {
    await db.billingProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...data },
      update: data,
    })
  } catch (err) {
    logger.error('billing-details: save failed', err, { userId: session.user.id })
    return NextResponse.json({ error: 'Could not save your details. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
