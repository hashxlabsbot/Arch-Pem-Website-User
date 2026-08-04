import { describe, expect, it } from 'vitest'
import {
  parseLengthMm, formatFtIn, formatMmLabel, echoFor, formatLength,
  MM_PER_INCH, MM_PER_FOOT, MAX_LENGTH_MM,
} from './units'

const ft = (raw: string) => parseLengthMm(raw, { mode: 'ftin', bareUnit: 'ft' })
const inch = (raw: string) => parseLengthMm(raw, { mode: 'ftin', bareUnit: 'in' })
const mmMode = (raw: string) => parseLengthMm(raw, { mode: 'mm', bareUnit: 'mm' })
const mmOf = (r: ReturnType<typeof ft>) => (r.ok ? r.mm : NaN)

describe('parseLengthMm — feet-inch forms', () => {
  it('accepts every separator style for 3 feet 6 inches', () => {
    for (const s of [`3'-6"`, `3' 6"`, `3'6"`, `3'6`, `3'-6`]) {
      expect(mmOf(ft(s)), s).toBeCloseTo(1066.8, 6)
    }
  })

  it('accepts decimal feet, inches-only and the hyphen shorthand', () => {
    expect(mmOf(ft(`3.5'`))).toBeCloseTo(1066.8, 6)
    expect(mmOf(ft(`42"`))).toBeCloseTo(1066.8, 6)
    expect(mmOf(ft('3-6'))).toBeCloseTo(1066.8, 6)
  })

  it('reads the half-inch dimensions these drawings actually use', () => {
    for (const s of [`15'-4½"`, `15'-4 1/2"`, `15'-4-1/2"`]) {
      expect(mmOf(ft(s)), s).toBeCloseTo(4686.3, 6)
    }
    expect(mmOf(ft(`39'-4½"`))).toBeCloseTo(12001.5, 6)
  })

  it('reads the drawing convention of two apostrophes for inches', () => {
    expect(mmOf(inch(`9''`))).toBeCloseTo(9 * MM_PER_INCH, 6)
  })

  it('handles a bare unicode fraction', () => {
    expect(mmOf(inch('⅛"'))).toBeCloseTo(3.175, 6)
  })

  it('normalises typographic quotes, words, case and padding', () => {
    expect(mmOf(ft('3’-6”'))).toBeCloseTo(1066.8, 6)
    expect(mmOf(ft('  3 FT 6 IN '))).toBeCloseTo(1066.8, 6)
    expect(mmOf(ft('3 feet 6 inches'))).toBeCloseTo(1066.8, 6)
  })

  it('accepts metric spellings in either mode', () => {
    expect(mmOf(ft('1200mm'))).toBe(1200)
    expect(mmOf(ft('1.2m'))).toBe(1200)
    expect(mmOf(ft('120cm'))).toBe(1200)
    expect(mmOf(mmMode('1.2 metres'))).toBe(1200)
  })
})

describe('parseLengthMm — bare numbers resolve by field role', () => {
  it('treats a bare number as feet, inches or mm per the field', () => {
    expect(mmOf(ft('15'))).toBeCloseTo(15 * MM_PER_FOOT, 6)
    expect(mmOf(inch('9'))).toBeCloseTo(9 * MM_PER_INCH, 6)
    expect(mmOf(mmMode('230'))).toBe(230)
  })

  it('honours explicit marks even in millimetre mode', () => {
    expect(mmOf(mmMode(`3'-6"`))).toBeCloseTo(1066.8, 6)
    expect(mmOf(mmMode('9"'))).toBeCloseTo(228.6, 6)
  })

  it('rejects the hyphen shorthand in an inches field, where it is ambiguous', () => {
    const r = inch('3-6')
    expect(r.ok).toBe(false)
  })
})

describe('parseLengthMm — notes and errors', () => {
  it('flags an inch part of 12 or more rather than rejecting it', () => {
    const r = ft(`3'-15"`)
    expect(r.ok).toBe(true)
    if (!r.ok) throw new Error('unreachable')
    expect(mmOf(r)).toBeCloseTo(3 * MM_PER_FOOT + 15 * MM_PER_INCH, 6)
    expect(r.notes.length).toBeGreaterThan(0)
  })

  it('reports empty, syntax and range distinctly', () => {
    expect(ft('')).toMatchObject({ ok: false, reason: 'empty' })
    expect(ft('   ')).toMatchObject({ ok: false, reason: 'empty' })
    expect(ft('abc')).toMatchObject({ ok: false, reason: 'syntax' })
    expect(ft('3/0"')).toMatchObject({ ok: false, reason: 'syntax' })
    expect(ft('-6')).toMatchObject({ ok: false, reason: 'range' })
    expect(mmMode(String(MAX_LENGTH_MM + 1))).toMatchObject({ ok: false, reason: 'range' })
  })

  it('rejects a denominator beyond 1/64', () => {
    expect(inch('1/128"')).toMatchObject({ ok: false })
  })
})

describe('formatFtIn', () => {
  it('renders feet, inches and eighths the way a drawing does', () => {
    expect(formatFtIn(4686.3)).toBe(`15'-4½"`)
    expect(formatFtIn(1066.8)).toBe(`3'-6"`)
    expect(formatFtIn(228.6)).toBe(`9"`)
    expect(formatFtIn(304.8)).toBe(`1'`)
    expect(formatFtIn(0)).toBe(`0"`)
    expect(formatFtIn(3.175)).toBe(`⅛"`)
  })

  it('round-trips through the parser at eighth-inch resolution', () => {
    const step = MM_PER_INCH / 8
    for (let i = 0; i <= 12000 / step; i++) {
      const mm = i * step
      if (mm > 12000) break
      const text = formatFtIn(mm)
      const back = parseLengthMm(text, { mode: 'ftin', bareUnit: 'ft' })
      expect(back.ok, `${mm} -> "${text}"`).toBe(true)
      if (back.ok) expect(back.mm, `${mm} -> "${text}"`).toBeCloseTo(mm, 6)
    }
  })
})

describe('display helpers', () => {
  it('formats the millimetre label with Indian grouping', () => {
    expect(formatMmLabel(4686.3)).toBe('4,686 mm')
  })

  it('echoes the other unit in each mode', () => {
    expect(echoFor(4686.3, 'ftin')).toBe('= 4,686 mm')
    expect(echoFor(4686.3, 'mm')).toBe(`= 15'-4½"`)
  })

  it('renders a value back into its own mode for round-tripping fields', () => {
    expect(formatLength(1066.8, 'ftin')).toBe(`3'-6"`)
    expect(formatLength(230, 'mm')).toBe('230')
    expect(formatLength(0, 'mm')).toBe('')
  })
})

describe('degenerate input never yields a non-finite length', () => {
  const nasty = ['', ' ', 'NaN', 'Infinity', '-0', '1/0"', "''", '1e9', '٣', '3""6', "3''6''", '..', '/', "'", '"', '3..5', '1/2/3']
  it('sweeps junk through every field role', () => {
    for (const raw of nasty) {
      for (const bareUnit of ['mm', 'ft', 'in'] as const) {
        for (const mode of ['mm', 'ftin'] as const) {
          const r = parseLengthMm(raw, { mode, bareUnit })
          if (r.ok) {
            expect(Number.isFinite(r.mm), `${raw} (${mode}/${bareUnit})`).toBe(true)
            expect(r.mm).toBeGreaterThanOrEqual(0)
          }
        }
      }
    }
  })

  it('never throws on non-string input', () => {
    // @ts-expect-error deliberately wrong type
    expect(parseLengthMm(null, { mode: 'mm', bareUnit: 'mm' }).ok).toBe(false)
  })

  it('formatters tolerate non-finite input', () => {
    expect(formatFtIn(Number.NaN)).toBe('')
    expect(formatFtIn(-5)).toBe('')
    expect(formatMmLabel(Number.POSITIVE_INFINITY)).toBe('')
    expect(echoFor(Number.NaN, 'ftin')).toBe('')
  })
})
