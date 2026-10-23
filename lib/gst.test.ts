import { describe, expect, it } from 'vitest'
import { gstinChecksumValid, validateBillingDetails } from './gst'
import { chargePaise, gstOn, subscriptionPrice } from './pricing'

const valid = {
  legalName: '  Studio Meridian   Architects LLP ',
  gstin: '06ldmps5515g1z2',
  addressLine1: 'Plot 12, Sector 44',
  city: 'Gurugram',
  stateCode: '06',
  pincode: '122003',
}

describe('GSTIN check digit', () => {
  it('accepts a real GSTIN and rejects one with a single character changed', () => {
    expect(gstinChecksumValid('06LDMPS5515G1Z2')).toBe(true)
    expect(gstinChecksumValid('06LDMPS5515G1Z3')).toBe(false)
    expect(gstinChecksumValid('06LDMPS5516G1Z2')).toBe(false)
  })
})

describe('validateBillingDetails', () => {
  it('normalises the details and takes the state name from its code', () => {
    const r = validateBillingDetails({ ...valid, state: 'Somewhere else' })
    expect(r).toEqual({
      ok: true,
      data: {
        legalName: 'Studio Meridian Architects LLP',
        gstin: '06LDMPS5515G1Z2',
        addressLine1: 'Plot 12, Sector 44',
        addressLine2: null,
        city: 'Gurugram',
        state: 'Haryana',
        stateCode: '06',
        pincode: '122003',
        country: 'India',
        phone: null,
        email: null,
      },
    })
  })

  it('allows a firm without GST registration', () => {
    const r = validateBillingDetails({ ...valid, gstin: '' })
    expect(r.ok && r.data.gstin).toBe(null)
  })

  it('refuses a GSTIN from another state, a mistyped GSTIN and missing fields', () => {
    expect(validateBillingDetails({ ...valid, stateCode: '07' })).toMatchObject({ ok: false, field: 'gstin' })
    expect(validateBillingDetails({ ...valid, gstin: '06LDMPS5515G1Z3' })).toMatchObject({ ok: false, field: 'gstin' })
    expect(validateBillingDetails({ ...valid, stateCode: '25' })).toMatchObject({ ok: false, field: 'stateCode' })
    expect(validateBillingDetails({ ...valid, pincode: '12200' })).toMatchObject({ ok: false, field: 'pincode' })
    expect(validateBillingDetails({ ...valid, legalName: ' ' })).toMatchObject({ ok: false, field: 'legalName' })
    expect(validateBillingDetails(null)).toMatchObject({ ok: false })
  })
})

describe('GST at checkout', () => {
  it('charges the price plus 18% GST, to the paisa', () => {
    expect(chargePaise(1999)).toBe(235_882)
    expect(chargePaise(4999)).toBe(589_882)
    expect(chargePaise(subscriptionPrice(4999, 'YEAR'))).toBe(5_898_820)
    expect(chargePaise(subscriptionPrice(1999, 'MONTH', { seats: 2, siteSeats: 1 }))).toBe(400_728)
    expect(gstOn(4999)).toBe(899.82)
  })
})
