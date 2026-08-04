/**
 * Feet-inches ⇄ millimetre parsing for structural drawing input.
 *
 * Indian structural drawings mix units by convention: sections and spans in
 * feet-inches (9"x15", 15'-4½", @4" c/c) but bar diameter and clear cover
 * always in millimetres. This module handles the length side so an engineer can
 * type exactly what the drawing says.
 *
 * Pure — no React, no DOM.
 */

export type UnitMode = 'mm' | 'ftin'
/** What a bare, unmarked number means — decided by the field's role, not globally. */
export type BareUnit = 'mm' | 'ft' | 'in'

export const MM_PER_INCH = 25.4
export const MM_PER_FOOT = 304.8
export const MAX_LENGTH_MM = 100_000
const MAX_DENOMINATOR = 64

export type ParseOk = {
  ok: true
  /** Full precision. 3'-6" is 1066.8, never 1067 — see the rounding note below. */
  mm: number
  /** Rounded, for display only. */
  displayMm: number
  notes: string[]
}
export type ParseErr = { ok: false; reason: 'empty' | 'syntax' | 'range'; message: string }
export type ParseResult = ParseOk | ParseErr

const VULGAR: Record<string, string> = {
  '¼': ' 1/4', '½': ' 1/2', '¾': ' 3/4',
  '⅛': ' 1/8', '⅜': ' 3/8', '⅝': ' 5/8', '⅞': ' 7/8',
  '⅓': ' 1/3', '⅔': ' 2/3', '⅙': ' 1/6', '⅚': ' 5/6',
  '⅕': ' 1/5', '⅖': ' 2/5', '⅗': ' 3/5', '⅘': ' 4/5',
}

/** Canonicalises quotes, fractions and word units so one grammar can parse it. */
function normalise(raw: string): string {
  let s = raw.normalize('NFC')
  // Typographic marks → ASCII
  s = s.replace(/[‘’ʼ′]/g, "'").replace(/[“”″]/g, '"')
  for (const [g, r] of Object.entries(VULGAR)) s = s.split(g).join(r)
  s = s.toLowerCase()
  // Word units → symbols. Longest first so "mm" isn't eaten by "m".
  s = s.replace(/\bmillimet(?:re|er)s?\b/g, 'mm')
  s = s.replace(/\bcentimet(?:re|er)s?\b/g, 'cm')
  s = s.replace(/\bmet(?:re|er)s?\b/g, 'm')
  s = s.replace(/\b(?:feet|foot|ft)\b/g, "'")
  s = s.replace(/\b(?:inches|inch|ins|in)\b/g, '"')
  // Drawings commonly write inches as two apostrophes: 9''x15"
  s = s.replace(/''/g, '"')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

const NUM = String.raw`\d+(?:\.\d+)?`
const FRAC = String.raw`\d+\/\d+`
const MIXED = String.raw`\d+[\s-]${FRAC}`
/** Order matters: MIXED before FRAC before NUM, else "4 1/2" parses as "4". */
const ANY = `(?:${MIXED}|${FRAC}|${NUM})`

/** Parses "4", "4.5", "1/2", "4 1/2", "4-1/2" → number, or null. */
function numberToken(tok: string): number | null {
  const t = tok.trim()
  if (!t) return null
  const mixed = t.match(new RegExp(`^(\\d+)[\\s-](\\d+)\\/(\\d+)$`))
  if (mixed) {
    const [, whole, n, d] = mixed
    const den = Number(d)
    if (den <= 0 || den > MAX_DENOMINATOR) return null
    return Number(whole) + Number(n) / den
  }
  const frac = t.match(/^(\d+)\/(\d+)$/)
  if (frac) {
    const den = Number(frac[2])
    if (den <= 0 || den > MAX_DENOMINATOR) return null
    return Number(frac[1]) / den
  }
  if (new RegExp(`^${NUM}$`).test(t)) return Number(t)
  return null
}

const err = (reason: ParseErr['reason'], message: string): ParseErr => ({ ok: false, reason, message })

function ok(mm: number, notes: string[] = []): ParseResult {
  if (!Number.isFinite(mm)) return err('syntax', 'Not a valid length.')
  if (mm < 0) return err('range', 'Length cannot be negative.')
  if (mm > MAX_LENGTH_MM) return err('range', `Length looks too large (over ${MAX_LENGTH_MM / 1000} m).`)
  return { ok: true, mm, displayMm: Math.round(mm), notes }
}

/**
 * Parses a length. Explicit ' and " marks always win, in either mode — pasting
 * 3'-6" into a millimetre field gives 1066.8, not 3.
 */
export function parseLengthMm(raw: string, opts: { mode: UnitMode; bareUnit: BareUnit }): ParseResult {
  if (typeof raw !== 'string') return err('syntax', 'Not a valid length.')
  const s = normalise(raw)
  if (!s) return err('empty', 'Enter a value.')
  if (/[^0-9./'" \-a-z]/.test(s)) return err('syntax', 'Contains characters that are not part of a length.')
  if (s.startsWith('-')) return err('range', 'Length cannot be negative.')

  const notes: string[] = []
  const bare: BareUnit = opts.mode === 'mm' ? 'mm' : opts.bareUnit

  // metric: 1200mm · 120cm · 1.2m
  const metric = s.match(new RegExp(`^(${ANY})\\s*(mm|cm|m)$`))
  if (metric) {
    const v = numberToken(metric[1])
    if (v === null) return err('syntax', 'Not a valid number.')
    const factor = metric[2] === 'mm' ? 1 : metric[2] === 'cm' ? 10 : 1000
    return ok(v * factor, notes)
  }

  // feet with optional inches: 3'-6"  3' 6"  3'6  3'  15'-4 1/2"
  const ftin = s.match(new RegExp(`^(${ANY})\\s*'\\s*-?\\s*(${ANY})?\\s*"?$`))
  if (ftin) {
    const f = numberToken(ftin[1])
    if (f === null) return err('syntax', 'Not a valid number of feet.')
    let inch = 0
    if (ftin[2] !== undefined) {
      const i = numberToken(ftin[2])
      if (i === null) return err('syntax', 'Not a valid number of inches.')
      inch = i
      if (inch >= 12) notes.push(`${trimNum(inch)}" is more than a foot — did you mean ${Math.floor(f + inch / 12)}'-${trimNum(inch % 12)}"?`)
    }
    return ok(f * MM_PER_FOOT + inch * MM_PER_INCH, notes)
  }

  // inches only: 42"  4½"
  const inchOnly = s.match(new RegExp(`^(${ANY})\\s*"$`))
  if (inchOnly) {
    const v = numberToken(inchOnly[1])
    if (v === null) return err('syntax', 'Not a valid number.')
    return ok(v * MM_PER_INCH, notes)
  }

  // hyphen shorthand for feet-inches: 3-6. Only meaningful where a bare number
  // would have meant feet; in an inches field it is ambiguous, so reject it.
  const hyphen = s.match(new RegExp(`^(${NUM})-(${NUM})$`))
  if (hyphen && bare === 'ft') {
    const f = Number(hyphen[1])
    const i = Number(hyphen[2])
    if (i >= 12) notes.push(`${trimNum(i)}" is more than a foot — check this value.`)
    return ok(f * MM_PER_FOOT + i * MM_PER_INCH, notes)
  }

  // bare number — meaning comes from the field's role
  const bareMatch = s.match(new RegExp(`^${ANY}$`))
  if (bareMatch) {
    const v = numberToken(s)
    if (v === null) return err('syntax', 'Not a valid number.')
    const factor = bare === 'mm' ? 1 : bare === 'ft' ? MM_PER_FOOT : MM_PER_INCH
    return ok(v * factor, notes)
  }

  return err('syntax', 'Could not read that as a length.')
}

const trimNum = (n: number) => String(Math.round(n * 1000) / 1000)

const EIGHTHS: Record<number, string> = { 1: '⅛', 2: '¼', 3: '⅜', 4: '½', 5: '⅝', 6: '¾', 7: '⅞' }

/** mm → feet-inches, rounded to the nearest ⅛" as drawings are dimensioned. */
export function formatFtIn(mm: number): string {
  if (!Number.isFinite(mm) || mm < 0) return ''
  const totalEighths = Math.round((mm / MM_PER_INCH) * 8)
  const feet = Math.floor(totalEighths / 96)
  const rem = totalEighths - feet * 96
  const inches = Math.floor(rem / 8)
  const eighths = rem - inches * 8
  const frac = eighths > 0 ? EIGHTHS[eighths] : ''
  const inchPart = inches > 0 || frac ? `${inches > 0 ? inches : ''}${frac}"` : ''

  if (feet > 0 && inchPart) return `${feet}'-${inchPart}`
  if (feet > 0) return `${feet}'`
  return inchPart || '0"'
}

/** Grouped millimetre label, e.g. 4,686 mm. */
export function formatMmLabel(mm: number): string {
  if (!Number.isFinite(mm)) return ''
  return `${Math.round(mm).toLocaleString('en-IN')} mm`
}

/**
 * The other-unit echo shown under every length field — the main catcher for
 * transcription slips, in whichever direction the slip was made.
 */
export function echoFor(mm: number, mode: UnitMode): string {
  if (!Number.isFinite(mm)) return ''
  return mode === 'ftin' ? `= ${formatMmLabel(mm)}` : `= ${formatFtIn(mm)}`
}

/** Renders a millimetre value back into the mode's own notation, for round-tripping fields. */
export function formatLength(mm: number, mode: UnitMode): string {
  if (!Number.isFinite(mm) || mm <= 0) return ''
  return mode === 'ftin' ? formatFtIn(mm) : String(Math.round(mm * 100) / 100)
}
