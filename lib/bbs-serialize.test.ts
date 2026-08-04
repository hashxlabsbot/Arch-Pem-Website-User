import { describe, expect, it } from 'vitest'
import { encodeBarSpecs, decodeBarSpecs, encodeSpacingZones, decodeSpacingZones, encodeLifts, decodeLifts } from './bbs-serialize'

describe('bar spec codec', () => {
  it('round-trips a mixed-diameter group', () => {
    const specs = [{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }]
    expect(encodeBarSpecs(specs)).toBe('2x20,1x16')
    expect(decodeBarSpecs('2x20,1x16')).toEqual(specs)
  })

  it('tolerates whitespace', () => {
    expect(decodeBarSpecs(' 2 x 20 , 1x16 ')).toEqual([{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }])
  })

  it('keeps an in-progress row so a freshly added one can be typed into', () => {
    // Zeros are a row the user has started, not junk — the domain drops them.
    expect(decodeBarSpecs('0x0')).toEqual([{ diaMm: 0, count: 0 }])
    expect(decodeBarSpecs(encodeBarSpecs([{ diaMm: 0, count: 0 }]))).toHaveLength(1)
  })

  it('drops junk tokens rather than producing NaN entries', () => {
    for (const raw of ['ax20', '2x', 'x20', '2', '', ',,', '-2x16', '2x-16', '2xNaN']) {
      const out = decodeBarSpecs(raw)
      for (const s of out) {
        expect(Number.isFinite(s.diaMm) && Number.isFinite(s.count), raw).toBe(true)
        expect(s.diaMm >= 0 && s.count >= 0, raw).toBe(true)
      }
    }
    expect(decodeBarSpecs('2x20,ax20')).toEqual([{ diaMm: 20, count: 2 }])
  })

  it('encodes an empty or undefined group as an empty string', () => {
    expect(encodeBarSpecs([])).toBe('')
    expect(encodeBarSpecs(undefined)).toBe('')
    expect(decodeBarSpecs(undefined)).toEqual([])
  })
})

describe('spacing zone codec', () => {
  it('round-trips a real drawing zone without float noise', () => {
    const zones = [{ lengthMm: 1066.8, spacingMm: 101.6 }]
    expect(encodeSpacingZones(zones)).toBe('1066.8@101.6')
    expect(decodeSpacingZones('1066.8@101.6')).toEqual(zones)
  })

  it('round-trips multiple zones', () => {
    const zones = [{ lengthMm: 914.4, spacingMm: 101.6 }, { lengthMm: 600, spacingMm: 127 }]
    expect(decodeSpacingZones(encodeSpacingZones(zones))).toEqual(zones)
  })

  it('drops junk tokens but keeps an in-progress row', () => {
    expect(decodeSpacingZones('0@0')).toEqual([{ lengthMm: 0, spacingMm: 0 }])
    expect(decodeSpacingZones('abc@def')).toEqual([])
    expect(decodeSpacingZones('900@100,bad')).toEqual([{ lengthMm: 900, spacingMm: 100 }])
    expect(decodeSpacingZones('')).toEqual([])
    expect(decodeSpacingZones(undefined)).toEqual([])
  })
})

describe('codecs never emit or accept non-finite values', () => {
  it('sweeps nasty input', () => {
    const nasty = ['NaN', 'Infinity', '-Infinity', 'e', '1e999x20', '@', 'x', '2x20@30', '1@2x3']
    for (const raw of nasty) {
      for (const s of decodeBarSpecs(raw)) expect(Number.isFinite(s.diaMm * s.count)).toBe(true)
      for (const z of decodeSpacingZones(raw)) expect(Number.isFinite(z.lengthMm * z.spacingMm)).toBe(true)
    }
    expect(encodeBarSpecs([{ diaMm: Number.NaN, count: 2 }])).toBe('')
    expect(encodeSpacingZones([{ lengthMm: Number.POSITIVE_INFINITY, spacingMm: 100 }])).toBe('')
  })
})

describe('column lift codec', () => {
  it('round-trips a real per-level column schedule', () => {
    const lifts = [
      { label: 'Terrace-3rd', heightMm: 3000, mainBars: [{ diaMm: 16, count: 10 }] },
      { label: '2nd-Fdn', heightMm: 3200, mainBars: [{ diaMm: 20, count: 4 }, { diaMm: 16, count: 6 }] },
    ]
    const enc = encodeLifts(lifts)
    expect(enc).toBe('Terrace-3rd:3000:10x16|2nd-Fdn:3200:4x20,6x16')
    expect(decodeLifts(enc)).toEqual(lifts)
  })

  it('strips delimiters from a label so a lift can never be split wrongly', () => {
    const enc = encodeLifts([{ label: 'A:B|C,D', heightMm: 3000, mainBars: [{ diaMm: 16, count: 4 }] }])
    expect(decodeLifts(enc)).toHaveLength(1)
    expect(decodeLifts(enc)[0].label).toBe('A B C D')
    expect(decodeLifts(enc)[0].heightMm).toBe(3000)
  })

  it('drops malformed lifts', () => {
    expect(decodeLifts('nope')).toEqual([])
    expect(decodeLifts('A:abc:4x16')).toEqual([])
    expect(decodeLifts('')).toEqual([])
    expect(decodeLifts(undefined)).toEqual([])
  })

  it('keeps a lift that has a height but no bars, so the row can be flagged not lost', () => {
    expect(decodeLifts('A:3000:')).toEqual([{ label: 'A', heightMm: 3000, mainBars: [] }])
  })

  it('keeps a blank lift so a freshly added storey can be typed into', () => {
    expect(decodeLifts(encodeLifts([{ label: '', heightMm: 0, mainBars: [] }]))).toHaveLength(1)
  })
})
