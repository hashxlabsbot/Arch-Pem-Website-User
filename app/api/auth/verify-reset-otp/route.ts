import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json()
  if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })

  const record = await db.passwordResetToken.findFirst({
    where: { userId: user.id, token: otp, used: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired code. Please request a new one.' }, { status: 400 })
  }

  // Replace OTP with a secure reset token valid for 15 minutes
  const resetToken = randomBytes(32).toString('hex')
  await db.passwordResetToken.update({
    where: { id: record.id },
    data:  { token: resetToken, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  })

  return NextResponse.json({ success: true, resetToken })
}
