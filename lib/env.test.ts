import { describe, expect, it } from 'vitest'
import { launchConfigProblems } from './env'

const complete = {
  NEXTAUTH_URL: 'https://arcpem.com',
  NEXTAUTH_SECRET: 'q8V1xY0pR7tN3mK9sW2eL5aZ4cB6dF0g',
  RAZORPAY_KEY_ID: 'rzp_live_x',
  RAZORPAY_KEY_SECRET: 'x',
  RAZORPAY_WEBHOOK_SECRET: 'x',
  SMTP_HOST: 'smtp.example.com',
  WEB_APP_URL: 'https://app.arcpem.com',
  WEB_APP_WEBHOOK_SECRET: 'a'.repeat(64),
  OIDC_CLIENT_ID: 'arcpem-web',
  OIDC_CLIENT_SECRET: 'x',
  OIDC_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----',
  CRON_SECRET: 'x'.repeat(48),
}

describe('launchConfigProblems', () => {
  it('passes a complete production configuration', () => {
    expect(launchConfigProblems(complete)).toEqual([])
  })

  it('names every missing setting', () => {
    const { RAZORPAY_WEBHOOK_SECRET, OIDC_PRIVATE_KEY, ...rest } = complete
    void RAZORPAY_WEBHOOK_SECRET
    void OIDC_PRIVATE_KEY
    expect(launchConfigProblems({ ...rest, SMTP_HOST: '  ' })).toEqual([
      'RAZORPAY_WEBHOOK_SECRET is not set',
      'SMTP_HOST is not set',
      'OIDC_PRIVATE_KEY is not set',
    ])
  })

  it('refuses weak secrets and a plain-http site address', () => {
    const problems = launchConfigProblems({
      ...complete,
      NEXTAUTH_SECRET: 'replace-me',
      WEB_APP_WEBHOOK_SECRET: 'short',
      NEXTAUTH_URL: 'http://arcpem.com',
    })
    expect(problems).toHaveLength(3)
  })
})
