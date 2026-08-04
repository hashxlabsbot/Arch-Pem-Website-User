/**
 * Compact codecs for the list-shaped BBS inputs.
 *
 * Form state is a flat Record<string,string> so that saved projects, the
 * localStorage blob and the shareable URL all keep working unchanged. Bar
 * groups and spacing zones therefore encode into a single string field each.
 *
 * Values are always canonical millimetres regardless of the UI's unit mode —
 * list rows re-render from mm through the mode's formatter. (Scalar length
 * fields do the opposite and keep the user's raw text, so the exact
 * transcription survives; a list grammar can't carry quote characters without
 * becoming unparseable and URL-hostile.)
 *
 * Comma-separated, not '+' — a '+' decodes as a space in a query string.
 *
 * These codecs are pure TRANSPORT: they preserve any row made of two finite,
 * non-negative numbers, including the zeros of a row the user has only started
 * filling in. Deciding what actually counts is the domain's job —
 * normalizeBarSpecs, planStirrupZones and columnLifts each drop unusable
 * entries, and the validators flag half-filled ones. If the codec dropped them
 * instead, a freshly added blank row would vanish before it could be typed into.
 */
import type { BarSpec, ColumnLift, SpacingZone } from './bbs'

const fin = (n: number) => Number.isFinite(n)
/** Trims float noise so "1066.8" doesn't serialise as "1066.7999999999999". */
const tidy = (n: number) => String(Math.round(n * 100) / 100)

/** [{20,2},{16,1}] → "2x20,1x16" */
export function encodeBarSpecs(specs: BarSpec[] | undefined): string {
  return (specs ?? [])
    .filter((s) => s && fin(s.diaMm) && fin(s.count) && s.diaMm >= 0 && s.count >= 0)
    .map((s) => `${tidy(s.count)}x${tidy(s.diaMm)}`)
    .join(',')
}

export function decodeBarSpecs(raw: string | undefined): BarSpec[] {
  if (!raw) return []
  const out: BarSpec[] = []
  for (const tok of raw.split(',')) {
    const [c, d] = tok.split('x')
    if (c === undefined || d === undefined) continue
    const count = Number(c.trim())
    const diaMm = Number(d.trim())
    if (!fin(count) || !fin(diaMm) || count < 0 || diaMm < 0) continue
    out.push({ diaMm, count })
  }
  return out
}

/** [{1066.8, 101.6}] → "1066.8@101.6" */
export function encodeSpacingZones(zones: SpacingZone[] | undefined): string {
  return (zones ?? [])
    .filter((z) => z && fin(z.lengthMm) && fin(z.spacingMm) && z.lengthMm >= 0 && z.spacingMm >= 0)
    .map((z) => `${tidy(z.lengthMm)}@${tidy(z.spacingMm)}`)
    .join(',')
}

export function decodeSpacingZones(raw: string | undefined): SpacingZone[] {
  if (!raw) return []
  const out: SpacingZone[] = []
  for (const tok of raw.split(',')) {
    const [l, s] = tok.split('@')
    if (l === undefined || s === undefined) continue
    const lengthMm = Number(l.trim())
    const spacingMm = Number(s.trim())
    if (!fin(lengthMm) || !fin(spacingMm) || lengthMm < 0 || spacingMm < 0) continue
    out.push({ lengthMm, spacingMm })
  }
  return out
}

/**
 * Column lifts: `label:height:bars` per storey, pipe-separated.
 * e.g. `Terrace-3rd:3000:10x16|2nd-Fdn:3200:4x20,2x16`
 *
 * Labels are sanitised of the two delimiters on the way in, so a stray colon in
 * a level name can never split a lift into the wrong fields.
 */
export function encodeLifts(lifts: ColumnLift[] | undefined): string {
  return (lifts ?? [])
    .filter((l) => l && fin(l.heightMm) && l.heightMm >= 0)
    .map((l) => `${(l.label ?? '').replace(/[|:,]/g, ' ').trim()}:${tidy(l.heightMm)}:${encodeBarSpecs(l.mainBars)}`)
    .join('|')
}

export function decodeLifts(raw: string | undefined): ColumnLift[] {
  if (!raw) return []
  const out: ColumnLift[] = []
  for (const tok of raw.split('|')) {
    const parts = tok.split(':')
    if (parts.length < 3) continue
    const heightMm = Number(parts[1].trim())
    if (!fin(heightMm) || heightMm < 0) continue
    out.push({ label: parts[0].trim(), heightMm, mainBars: decodeBarSpecs(parts.slice(2).join(':')) })
  }
  return out
}
