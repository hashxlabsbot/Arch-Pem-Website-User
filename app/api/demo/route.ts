import { NextRequest, NextResponse } from 'next/server'
import { sendDemoRequestEmail, sendDemoConfirmationEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { createDemoMeeting, parseSlotToRange } from '@/lib/google-calendar'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Throttle by IP so the public form can't be abused for spam.
  const { allowed } = await rateLimit(`demo-request-ip:${ip}`, 8, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { name, email, whatsapp, company, role, teamSize, date, time } = await req.json()
  if (!name?.trim() || !whatsapp?.trim() || !email?.trim() || !EMAIL_RE.test(String(email).trim())) {
    return NextResponse.json({ error: 'Name, a valid email and WhatsApp number are required.' }, { status: 400 })
  }

  const trimmed = {
    name:     String(name).trim(),
    email:    String(email).trim(),
    whatsapp: String(whatsapp).trim(),
    company:  company ? String(company).trim() : undefined,
    role:     role ? String(role).trim() : undefined,
    teamSize: teamSize ? String(teamSize).trim() : undefined,
    date:     date ? String(date).trim() : undefined,
    time:     time ? String(time).trim() : undefined,
  }

  // Persist the lead first — everything after this is best-effort and must
  // never cause a booking to be lost.
  let bookingId: string
  try {
    const booking = await db.demoBooking.create({
      data: {
        name: trimmed.name, email: trimmed.email, whatsapp: trimmed.whatsapp,
        company: trimmed.company, role: trimmed.role, teamSize: trimmed.teamSize,
        preferredDate: trimmed.date, preferredTime: trimmed.time,
      },
    })
    bookingId = booking.id
  } catch (err) {
    logger.error('demo booking save failed', err)
    return NextResponse.json({ error: 'Could not submit your request. Please try again or call us.' }, { status: 500 })
  }

  // Best-effort: generate a Google Meet link for the requested slot.
  let meetLink: string | undefined
  try {
    const range = trimmed.date && trimmed.time ? parseSlotToRange(trimmed.date, trimmed.time) : null
    if (range) {
      const meeting = await createDemoMeeting({
        summary: `ARC PEM demo — ${trimmed.name}${trimmed.company ? ` (${trimmed.company})` : ''}`,
        description: `Demo call booked via arcpem.com.\nWhatsApp: ${trimmed.whatsapp}\nEmail: ${trimmed.email}`,
        clientEmail: trimmed.email,
        start: range.start,
        end: range.end,
      })
      if (meeting) {
        meetLink = meeting.meetLink
        await db.demoBooking.update({
          where: { id: bookingId },
          data: { meetLink: meeting.meetLink, calendarEventId: meeting.eventId, status: 'CONFIRMED' },
        })
      } else {
        await db.demoBooking.update({ where: { id: bookingId }, data: { status: 'FAILED' } })
      }
    }
  } catch (err) {
    logger.error('demo meet link generation failed', err)
  }

  // Best-effort: internal notification + client confirmation. Neither should
  // fail the request — the lead is already safely stored above.
  try {
    await sendDemoRequestEmail({
      to: env.demoLeadsEmails(),
      name: trimmed.name, whatsapp: trimmed.whatsapp, company: trimmed.company,
      role: trimmed.role, teamSize: trimmed.teamSize, date: trimmed.date, time: trimmed.time,
    })
  } catch (err) {
    logger.error('demo lead notification email failed', err)
  }

  try {
    await sendDemoConfirmationEmail({
      to: trimmed.email, name: trimmed.name, date: trimmed.date, time: trimmed.time, meetLink,
    })
  } catch (err) {
    logger.error('demo confirmation email failed', err)
  }

  return NextResponse.json({ success: true })
}
