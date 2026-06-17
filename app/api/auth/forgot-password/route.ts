import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendPasswordResetOtpEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function genOtp(): string {
  // Cryptographically secure 6-digit code.
  return String(crypto.randomInt(100000, 1000000))
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const { email } = await req.json()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  const normalized = email.toLowerCase().trim()

  const [ipRl, emailRl] = await Promise.all([
    rateLimit(`forgot-pw-ip:${ip}`, 5, 60 * 60 * 1000),
    rateLimit(`forgot-pw-email:${normalized}`, 5, 60 * 60 * 1000),
  ])
  if (!ipRl.allowed || !emailRl.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const user = await db.user.findUnique({ where: { email: normalized } })

  // Always return success regardless of whether the account exists (anti-enumeration).
  if (!user) return NextResponse.json({ success: true })

  // Invalidate any previous unused tokens for this user.
  await db.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  })

  const otp = genOtp()
  await db.passwordResetToken.create({
    data: { userId: user.id, token: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  })

  try {
    await sendPasswordResetOtpEmail({ to: user.email, name: user.name, otp })
  } catch (err) {
    logger.error('forgot-password email failed', err, { userId: user.id })
    // Still return success to avoid leaking account existence via error timing.
  }

  return NextResponse.json({ success: true })
}
