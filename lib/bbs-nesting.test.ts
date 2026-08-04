import { describe, expect, it } from 'vitest'
import { cutsByDiameter, nestCuts, nestSchedule, DEFAULT_STOCK_MM } from './bbs-nesting'
import { computeBeam, type BarRow } from './bbs'

const row = (diaMm: number, cuttingLengthMm: number, nos: number): BarRow => ({
  mark: 'X', desc: 'test', diaMm, shape: 'Straight', cuttingLengthMm, nos,
  totalLengthM: (cuttingLengthMm * nos) / 1000,
  unitWtKgM: (diaMm * diaMm) / 162,
  totalWtKg: ((cuttingLengthMm * nos) / 1000) * ((diaMm * diaMm) / 162),
})

describe('cutsByDiameter', () => {
  it('expands each row into one entry per bar, grouped by diameter', () => {
    const m = cutsByDiameter([row(16, 5600, 4), row(16, 1200, 2), row(8, 1256, 27)])
    expect(m.get(16)).toHaveLength(6)
    expect(m.get(8)).toHaveLength(27)
    expect(m.get(16)!.filter((c) => c === 5600)).toHaveLength(4)
  })

  it('ignores rows that cannot be cut', () => {
    const m = cutsByDiameter([row(0, 5600, 4), row(16, 0, 4), row(16, 5600, 0), row(NaN, 100, 1)])
    expect(m.size).toBe(0)
  })
})

describe('nestCuts', () => {
  it('packs two 6 m cuts into one 12 m bar with no waste', () => {
    const r = nestCuts([6000, 6000], 12000, 16)
    expect(r.barsNeeded).toBe(1)
    expect(r.offcutMm).toBe(0)
    expect(r.offcutPct).toBe(0)
    expect(r.patterns).toEqual([{ cuts: [6000, 6000], bars: 1, offcutMm: 0 }])
  })

  it('never uses fewer bars than the theoretical lower bound', () => {
    const sets = [
      [6000, 6000, 6000],
      [5600, 5600, 5600, 5600, 5200, 5200],
      [1256, 1256, 1256, 1256, 1256, 1256, 1256, 1256, 1256, 1256],
      [11999, 1, 1, 1],
      [4000, 4000, 4000, 4000, 4000, 4000, 4000],
    ]
    for (const cuts of sets) {
      const r = nestCuts(cuts, 12000, 16)
      expect(r.barsNeeded, JSON.stringify(cuts)).toBeGreaterThanOrEqual(r.lowerBound)
      // FFD is guaranteed within 11/9 of optimal, so a wide sanity band is enough
      // to catch a genuinely broken packer.
      expect(r.barsNeeded).toBeLessThanOrEqual(Math.ceil(r.lowerBound * 1.25) + 1)
    }
  })

  it('accounts for every millimetre — cuts plus offcut equals the stock bought', () => {
    const cuts = [5600, 5600, 5600, 5600, 5200, 5200, 1256, 1256, 1256]
    const r = nestCuts(cuts, 12000, 16)
    expect(r.totalCutMm).toBe(cuts.reduce((s, c) => s + c, 0))
    expect(r.totalCutMm + r.offcutMm).toBeCloseTo(r.barsNeeded * r.stockMm, 6)
  })

  it('never over-fills a stock bar', () => {
    const r = nestCuts([5600, 5600, 5600, 5600, 5200, 5200, 1256, 1256], 12000, 16)
    for (const p of r.patterns) {
      expect(p.cuts.reduce((s, c) => s + c, 0)).toBeLessThanOrEqual(r.stockMm + 0.5)
      expect(p.offcutMm).toBeGreaterThanOrEqual(-0.5)
    }
  })

  it('keeps the total bar count equal to the cuts it was given', () => {
    const cuts = [5600, 5600, 5600, 5600, 5200, 5200, 1256, 1256, 1256, 800]
    const r = nestCuts(cuts, 12000, 16)
    const placed = r.patterns.reduce((s, p) => s + p.cuts.length * p.bars, 0)
    expect(placed).toBe(cuts.length)
    expect(r.patterns.reduce((s, p) => s + p.bars, 0)).toBe(r.barsNeeded)
  })

  it('sets aside cuts longer than a stock bar rather than silently dropping them', () => {
    const r = nestCuts([14000, 6000, 6000], 12000, 16)
    expect(r.oversizeMm).toEqual([14000])
    expect(r.barsNeeded).toBe(1)
  })

  it('reports offcut weight using the bar’s own unit weight', () => {
    const r = nestCuts([6000], 12000, 16)
    expect(r.offcutMm).toBe(6000)
    expect(r.offcutKg).toBeCloseTo(6 * (256 / 162), 6)
  })

  it('handles an empty or degenerate input without NaN', () => {
    for (const cuts of [[], [0], [-5], [NaN], [Infinity]]) {
      const r = nestCuts(cuts as number[], 12000, 16)
      expect(Number.isFinite(r.barsNeeded)).toBe(true)
      expect(Number.isFinite(r.offcutPct)).toBe(true)
      expect(r.barsNeeded).toBe(0)
    }
    const bad = nestCuts([6000, 6000], 0, 16)
    expect(bad.stockMm).toBe(DEFAULT_STOCK_MM)
  })
})

describe('nestSchedule', () => {
  it('produces a plan per diameter, ascending, from a real beam schedule', () => {
    const beam = computeBeam({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
      botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
    })
    const plans = nestSchedule(beam.rows, 12000)
    expect(plans.map((p) => p.diaMm)).toEqual([8, 12, 16])

    const stir = plans.find((p) => p.diaMm === 8)!
    // 27 stirrups of 1256 mm: 9 fit in a 12 m bar, so 3 bars.
    expect(stir.barsNeeded).toBe(3)
    expect(stir.offcutMm).toBeCloseTo(3 * 12000 - 27 * 1256, 6)

    const bot = plans.find((p) => p.diaMm === 16)!
    // 4 × 5600 mm: two per bar, no exact fit, so 2 bars.
    expect(bot.barsNeeded).toBe(2)
    for (const p of plans) expect(p.barsNeeded).toBeGreaterThanOrEqual(p.lowerBound)
  })

  it('returns nothing for an empty schedule', () => {
    expect(nestSchedule([], 12000)).toEqual([])
  })
})
