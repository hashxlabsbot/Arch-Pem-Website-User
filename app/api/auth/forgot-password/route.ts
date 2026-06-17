import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendPasswordResetOtpEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const { allowed } = rateLimit(`forgot-pw-ip:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
  }

  const { email } = await req.json()
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true })

  // Invalidate previous tokens
  await db.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data:  { used: true },
  })

  const otp       = genOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await db.passwordResetToken.create({
    data: { userId: user.id, token: otp, expiresAt },
  })

  let emailError: string | null = null
  try {
    await sendPasswordResetOtpEmail({ to: user.email, name: user.name, otp })
    console.log(`[forgot-password] OTP email sent to ${user.email}`)
  } catch (err) {
    emailError = err instanceof Error ? err.message : String(err)
    console.error('[forgot-password] email FAILED:', emailError)
  }

  // Always return success to prevent email enumeration.
  return NextResponse.json({ success: true })
}
