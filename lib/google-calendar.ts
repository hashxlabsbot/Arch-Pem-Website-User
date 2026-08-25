import { google } from 'googleapis'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

// The demo-slot label as shown in the booking form, e.g. "10:00 – 11:00 AM".
const SLOT_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i

function to24h(hour: number, meridiem: string): number {
  const h = hour % 12
  return meridiem.toUpperCase() === 'PM' ? h + 12 : h
}

/** Parses "YYYY-MM-DD" + "10:00 – 11:00 AM" (IST) into UTC start/end Dates. */
export function parseSlotToRange(date: string, time: string): { start: Date; end: Date } | null {
  const m = time.match(SLOT_RE)
  if (!m || !date) return null

  const [, sh, sm, sMer, eh, em, eMer] = m
  const IST_OFFSET_MIN = 5.5 * 60

  function toUtc(hour24: number, minute: number): Date {
    const utcMinutes = hour24 * 60 + minute - IST_OFFSET_MIN
    const base = new Date(`${date}T00:00:00.000Z`)
    return new Date(base.getTime() + utcMinutes * 60 * 1000)
  }

  return {
    start: toUtc(to24h(Number(sh), sMer), Number(sm)),
    end:   toUtc(to24h(Number(eh), eMer), Number(em)),
  }
}

function getCalendarClient() {
  const refreshToken = env.googleCalendarRefreshToken()
  const clientId = env.googleClientId()
  const clientSecret = env.googleClientSecret()
  if (!refreshToken || !clientId || !clientSecret) return null

  const auth = new google.auth.OAuth2(clientId, clientSecret)
  auth.setCredentials({ refresh_token: refreshToken })
  return google.calendar({ version: 'v3', auth })
}

/**
 * Creates a Calendar event with an auto-generated Google Meet link for a demo
 * booking. Best-effort: returns null (never throws) if credentials are missing
 * or the API call fails — the booking itself must never be blocked by this.
 */
export async function createDemoMeeting({
  summary, description, clientEmail, start, end,
}: { summary: string; description: string; clientEmail: string; start: Date; end: Date }): Promise<{ meetLink: string; eventId: string } | null> {
  const calendar = getCalendarClient()
  if (!calendar) return null

  try {
    const res = await calendar.events.insert({
      calendarId: env.googleCalendarId(),
      // Attendee is recorded on the event, but we don't let Google auto-email
      // them from the organizer's personal inbox — our own branded
      // confirmation email (sendDemoConfirmationEmail) is the client-facing
      // message, sent from the official info@arcpem.com mailbox.
      sendUpdates: 'none',
      conferenceDataVersion: 1,
      requestBody: {
        summary,
        description,
        start: { dateTime: start.toISOString() },
        end:   { dateTime: end.toISOString() },
        attendees: [{ email: clientEmail }],
        conferenceData: {
          createRequest: {
            requestId: `demo-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    })

    const meetLink = res.data.hangoutLink
    const eventId  = res.data.id
    if (!meetLink || !eventId) return null
    return { meetLink, eventId }
  } catch (err) {
    logger.error('google calendar meet creation failed', err)
    return null
  }
}
