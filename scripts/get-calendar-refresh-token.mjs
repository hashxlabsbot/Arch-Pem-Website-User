#!/usr/bin/env node
/**
 * One-time setup: mints a Google Calendar refresh token for whichever Google
 * account approves the consent screen, so the app can create demo-booking
 * Calendar events + Meet links on its behalf without a user present.
 *
 * Run locally (not in CI, not in an agent sandbox — needs a real browser):
 *   node scripts/get-calendar-refresh-token.mjs
 *
 * Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET already set in .env, and
 * http://localhost:53682/oauth2callback added as an Authorized redirect URI
 * on that OAuth client in Google Cloud Console (APIs & Services → Credentials),
 * with the Calendar API enabled on the same project.
 *
 * Prints GOOGLE_CALENDAR_REFRESH_TOKEN to paste into .env — copy it once, it
 * is only ever shown here.
 */
import { readFileSync } from 'fs'
import http from 'http'
import { google } from 'googleapis'

const PORT = 53682
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`

function loadEnv() {
  const content = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  const env = {}
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="?([^"\n]*)"?$/)
    if (m) env[m[1]] = m[2]
  }
  return env
}

const env = loadEnv()
const clientId = env.GOOGLE_CLIENT_ID
const clientSecret = env.GOOGLE_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET must be set in .env before running this.')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  // Forces Google to reissue a refresh token even if this app was authorized before.
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
})

console.log('\nOpen this URL and sign in with the Google account that should own demo-call events:\n')
console.log(authUrl)
console.log(`\nWaiting for you to approve on http://localhost:${PORT} ...\n`)

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) {
    res.writeHead(404); res.end(); return
  }
  const code = new URL(req.url, REDIRECT_URI).searchParams.get('code')
  if (!code) {
    res.writeHead(400); res.end('Missing ?code'); return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('<h2>Done — you can close this tab.</h2>')

    if (tokens.refresh_token) {
      console.log('\nGOOGLE_CALENDAR_REFRESH_TOKEN=' + JSON.stringify(tokens.refresh_token))
      console.log('\nPaste that into .env, then restart the dev server.\n')
    } else {
      console.log('\nNo refresh_token returned — this account may have already granted consent before.')
      console.log('Revoke access at https://myaccount.google.com/permissions and run this script again.\n')
    }
  } catch (err) {
    console.error('Token exchange failed:', err.message)
    res.writeHead(500); res.end('Token exchange failed — see terminal.')
  } finally {
    server.close()
    process.exit(0)
  }
})

server.listen(PORT)
