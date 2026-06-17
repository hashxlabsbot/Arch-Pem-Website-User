import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { validatePassword } from '@/lib/password'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// The reset token is the 64-char hex value issued by verify-reset-otp — NOT
// the 6-digit OTP. Requiring this shape prevents anyone from brute-forcing the
// short OTP directly against this endpoint.
const RESET_TOKEN_RE = /^[a-f0-9]{64}$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = await rateLimit(`reset-pw-ip:${ip}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const { token, password } = await req.json()
  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
  }
  if (!RESET_TOKEN_RE.test(String(token))) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  const pw = validatePassword(password)
  if (!pw.valid) {
    return NextResponse.json({ error: pw.errors[0] }, { status: 400 })
  }

  const record = await db.passwordResetToken.findUnique({ where: { token } })
  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Please request a new one.' },
      { status: 400 }
    )
  }

  const hashed = await bcrypt.hash(password, 12)

  // Atomically set the new password, consume the token, and bump tokenVersion
  // so every existing session for this account is revoked (account recovery
  // implies the old sessions may be compromised).
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { password: hashed, tokenVersion: { increment: 1 } },
    }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ])

  return NextResponse.json({ success: true })
}
