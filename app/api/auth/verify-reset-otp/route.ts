import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const { email, otp } = await req.json()
  if (!email || !EMAIL_RE.test(email) || !otp) {
    return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })
  }
  const normalized = email.toLowerCase().trim()

  // Strict throttling — this is the OTP-guessing surface for account recovery.
  const [ipRl, emailRl] = await Promise.all([
    rateLimit(`verify-reset-ip:${ip}`, 10, 60 * 60 * 1000),
    rateLimit(`verify-reset-email:${normalized}`, 5, 15 * 60 * 1000),
  ])
  if (!ipRl.allowed || !emailRl.allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const user = await db.user.findUnique({ where: { email: normalized } })
  // Generic error — never reveal whether the account exists.
  const GENERIC = 'Invalid or expired code. Please request a new one.'
  if (!user) return NextResponse.json({ error: GENERIC }, { status: 400 })

  const record = await db.passwordResetToken.findFirst({
    where: { userId: user.id, token: String(otp), used: false },
    orderBy: { createdAt: 'desc' },
  })
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: GENERIC }, { status: 400 })
  }

  // Swap the short OTP for a high-entropy reset token valid for 15 minutes.
  // reset-password only accepts this long token, never the 6-digit OTP.
  const resetToken = randomBytes(32).toString('hex')
  await db.passwordResetToken.update({
    where: { id: record.id },
    data: { token: resetToken, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  })

  return NextResponse.json({ success: true, resetToken })
}
