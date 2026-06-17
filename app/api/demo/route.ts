import { NextRequest, NextResponse } from 'next/server'
import { sendDemoRequestEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Where demo leads are delivered. Defaults to the support inbox.
const LEADS_INBOX = process.env.DEMO_LEADS_EMAIL ?? 'hashxlabs.info@gmail.com'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  // Throttle by IP so the public form can't be abused for spam.
  const { allowed } = await rateLimit(`demo-request-ip:${ip}`, 8, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { name, whatsapp, company, role, teamSize } = await req.json()
  if (!name?.trim() || !whatsapp?.trim()) {
    return NextResponse.json({ error: 'Name and WhatsApp number are required.' }, { status: 400 })
  }

  try {
    await sendDemoRequestEmail({
      to:       LEADS_INBOX,
      name:     String(name).trim(),
      whatsapp: String(whatsapp).trim(),
      company:  company ? String(company).trim() : undefined,
      role:     role ? String(role).trim() : undefined,
      teamSize: teamSize ? String(teamSize).trim() : undefined,
    })
  } catch (err) {
    logger.error('demo request email failed', err)
    return NextResponse.json({ error: 'Could not submit your request. Please try again or call us.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
