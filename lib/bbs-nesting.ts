/**
 * Bar-cutting optimisation — nesting cutting lengths into stock bars.
 *
 * TMT is delivered in fixed lengths (12 m is standard in India, 9 m and 6 m are
 * also sold). Every cut leaves an offcut, and on a real project that waste is
 * measured in tonnes. This is a one-dimensional bin-packing problem, and it is
 * pure arithmetic — no engineering judgement is involved, which is exactly why
 * the tool can do it exactly.
 *
 * Pure — no React, no DOM.
 */
import { unitWeightKgPerM, type BarRow } from './bbs'

export const DEFAULT_STOCK_MM = 12000

const fin = (n: number) => Number.isFinite(n)

export type NestPattern = {
  /** Cutting lengths taken from one stock bar, longest first. */
  cuts: number[]
  /** How many stock bars are cut to this pattern. */
  bars: number
  offcutMm: number
}

export type NestResult = {
  diaMm: number
  stockMm: number
  /** Stock bars this plan needs. */
  barsNeeded: number
  /** ceil(total cut length / stock) — no plan can ever beat this. */
  lowerBound: number
  totalCutMm: number
  offcutMm: number
  offcutPct: number
  offcutKg: number
  patterns: NestPattern[]
  /** Cuts longer than a stock bar; they need splicing, so they can't be nested. */
  oversizeMm: number[]
}

/** Expands a schedule into individual cut lengths, grouped by diameter. */
export function cutsByDiameter(rows: BarRow[]): Map<number, number[]> {
  const out = new Map<number, number[]>()
  for (const r of rows ?? []) {
    if (!r || !fin(r.diaMm) || !fin(r.cuttingLengthMm) || !fin(r.nos)) continue
    if (r.diaMm <= 0 || r.cuttingLengthMm <= 0) continue
    const n = Math.max(0, Math.round(r.nos))
    if (n === 0) continue
    const list = out.get(r.diaMm) ?? []
    for (let k = 0; k < n; k++) list.push(r.cuttingLengthMm)
    out.set(r.diaMm, list)
  }
  return out
}

/** Serialises a pattern so identical ones can be counted together. */
const patternKey = (cuts: number[]) => cuts.map((c) => Math.round(c * 100)).join('+')

/**
 * First-Fit-Decreasing with an exact-fit pre-pass.
 *
 * FFD is the standard heuristic here and is provably within 11/9 of optimal for
 * bin packing. The pre-pass pulls out combinations that fill a stock bar exactly
 * (the common `2 × 6000` from a 12 m bar), which FFD alone can miss and which is
 * where most of the easy saving is. The reported lowerBound lets the UI state
 * honestly how close the plan is rather than claiming optimality.
 */
export function nestCuts(cutsMm: number[], stockMm: number, diaMm: number): NestResult {
  const stock = fin(stockMm) && stockMm > 0 ? stockMm : DEFAULT_STOCK_MM
  const all = (cutsMm ?? []).filter((c) => fin(c) && c > 0)
  const oversizeMm = all.filter((c) => c > stock)
  const usable = all.filter((c) => c <= stock).sort((a, b) => b - a)

  const bins: number[][] = []

  // Exact-fit pre-pass: repeatedly take the longest remaining cut and greedily
  // add further cuts that land exactly on the stock length.
  const remaining = [...usable]
  const EPS = 0.5
  let guard = 0
  while (remaining.length > 0 && guard++ < 100000) {
    const first = remaining[0]
    const pack = [first]
    let used = first
    let progressed = false
    for (let k = 1; k < remaining.length; k++) {
      const c = remaining[k]
      if (used + c <= stock + EPS) {
        pack.push(c)
        used += c
        if (Math.abs(stock - used) <= EPS) { progressed = true; break }
      }
    }
    if (!progressed || Math.abs(stock - used) > EPS) break
    for (const c of pack) remaining.splice(remaining.indexOf(c), 1)
    bins.push(pack)
  }

  // First-Fit-Decreasing over whatever is left.
  const fill: number[] = bins.map((b) => b.reduce((s, c) => s + c, 0))
  for (const c of remaining) {
    let placed = false
    for (let b = 0; b < bins.length; b++) {
      if (fill[b] + c <= stock + EPS) {
        bins[b].push(c)
        fill[b] += c
        placed = true
        break
      }
    }
    if (!placed) {
      bins.push([c])
      fill.push(c)
    }
  }

  const grouped = new Map<string, NestPattern>()
  for (const b of bins) {
    const cuts = [...b].sort((x, y) => y - x)
    const key = patternKey(cuts)
    const existing = grouped.get(key)
    if (existing) existing.bars++
    else grouped.set(key, { cuts, bars: 1, offcutMm: stock - cuts.reduce((s, c) => s + c, 0) })
  }
  const patterns = Array.from(grouped.values()).sort((a, b) => b.bars - a.bars || b.cuts.length - a.cuts.length)

  const totalCutMm = usable.reduce((s, c) => s + c, 0)
  const barsNeeded = bins.length
  const offcutMm = Math.max(0, barsNeeded * stock - totalCutMm)

  return {
    diaMm,
    stockMm: stock,
    barsNeeded,
    lowerBound: totalCutMm > 0 ? Math.ceil(totalCutMm / stock - 1e-9) : 0,
    totalCutMm,
    offcutMm,
    offcutPct: barsNeeded > 0 ? (offcutMm / (barsNeeded * stock)) * 100 : 0,
    offcutKg: (offcutMm / 1000) * unitWeightKgPerM(diaMm),
    patterns,
    oversizeMm,
  }
}

/** Cutting plan per diameter across a whole project, ascending by diameter. */
export function nestSchedule(rows: BarRow[], stockMm = DEFAULT_STOCK_MM): NestResult[] {
  return Array.from(cutsByDiameter(rows).entries())
    .sort((a, b) => a[0] - b[0])
    .map(([diaMm, cuts]) => nestCuts(cuts, stockMm, diaMm))
}
