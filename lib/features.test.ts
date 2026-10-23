import { describe, expect, it } from 'vitest'
import { featureReport, securityWarnings, unavailableFeatures } from './features'

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

describe('featureReport', () => {
  it('reports every feature ready for a complete configuration', () => {
    expect(unavailableFeatures(complete)).toEqual([])
    expect(securityWarnings(complete)).toEqual([])
  })

  it('switches off only the feature whose setting is missing', () => {
    const { RAZORPAY_WEBHOOK_SECRET, ...rest } = complete
    void RAZORPAY_WEBHOOK_SECRET
    const off = unavailableFeatures(rest)
    expect(off.map((f) => f.id)).toEqual(['paymentWebhook'])
    expect(off[0].missing).toEqual(['RAZORPAY_WEBHOOK_SECRET'])
  })

  it('a setting shared by two features switches off both, and nothing else', () => {
    const { WEB_APP_URL, ...rest } = complete
    void WEB_APP_URL
    expect(unavailableFeatures(rest).map((f) => f.id).sort()).toEqual(['appSignIn', 'appSync'])
  })

  it('treats a blank value as missing', () => {
    expect(unavailableFeatures({ ...complete, SMTP_HOST: '   ' }).map((f) => f.id)).toEqual(['email'])
  })

  it('flags a short sync secret and a plain-http site address without throwing', () => {
    const off = unavailableFeatures({ ...complete, WEB_APP_WEBHOOK_SECRET: 'short', NEXTAUTH_URL: 'http://arcpem.com' })
    expect(off.map((f) => f.id).sort()).toEqual(['appSync', 'siteUrl'])
  })

  it('accepts a rotating pair of sync secrets when one is long enough', () => {
    expect(unavailableFeatures({ ...complete, WEB_APP_WEBHOOK_SECRET: `short,${'b'.repeat(40)}` })).toEqual([])
  })

  it('never lists secret values, only setting names', () => {
    const text = JSON.stringify(featureReport({ ...complete, RAZORPAY_KEY_SECRET: '', WEB_APP_WEBHOOK_SECRET: 'topsecretvalue' }))
    expect(text).not.toContain('topsecretvalue')
  })

  it('warns about placeholder or short session secrets but does not block', () => {
    expect(securityWarnings({ ...complete, NEXTAUTH_SECRET: 'replace-me' })).toHaveLength(1)
    expect(securityWarnings({ ...complete, NEXTAUTH_SECRET: 'shortbutrandom1' })).toHaveLength(1)
  })
})
