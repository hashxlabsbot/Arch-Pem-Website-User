import { afterEach, describe, expect, it, vi } from 'vitest'

// Loading lib/env in production must never take the site down because an optional feature (payments, app sign-in,
// sync, email, jobs) is unconfigured. It only reports what is switched off.
describe('production startup with optional settings missing', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('loads without throwing and logs each unavailable feature', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost:5432/db')
    vi.stubEnv('NEXTAUTH_SECRET', 'q8V1xY0pR7tN3mK9sW2eL5aZ4cB6dF0g')
    for (const k of ['NEXTAUTH_URL', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET', 'SMTP_HOST', 'WEB_APP_URL', 'WEB_APP_WEBHOOK_SECRET', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'OIDC_PRIVATE_KEY', 'CRON_SECRET']) {
      vi.stubEnv(k, '')
    }
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})

    const mod = await import('./env')

    expect(mod.env.nextAuthSecret()).toBe('q8V1xY0pR7tN3mK9sW2eL5aZ4cB6dF0g')
    const logged = errors.mock.calls.map((c) => String(c[0]))
    expect(logged.some((l) => l.includes('"feature":"payments"'))).toBe(true)
    expect(logged.some((l) => l.includes('"feature":"appSignIn"'))).toBe(true)
    expect(logged.join(' ')).not.toContain('q8V1xY0pR7tN3mK9sW2eL5aZ4cB6dF0g')
  })

  it('still refuses to start without the database or the session secret', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('DATABASE_URL', 'postgresql://u:p@localhost:5432/db')
    vi.stubEnv('NEXTAUTH_SECRET', '')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await expect(import('./env')).rejects.toThrow(/NEXTAUTH_SECRET/)
  })
})
