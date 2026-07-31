import { describe, expect, it } from 'vitest'
import {
  unitWeightKgPerM, stirrupCuttingLengthMm, barCount,
  computeBeam, computeFooting, summarizeByDiameter,
  validateBeamInputs, validateColumnInputs, validateSlabInputs, validateFootingInputs,
  type BbsResult, type BarRow,
} from './bbs'

describe('unitWeightKgPerM', () => {
  it('matches dia²/162 for common TMT sizes', () => {
    expect(unitWeightKgPerM(16)).toBeCloseTo(1.5802, 3)
    expect(unitWeightKgPerM(12)).toBeCloseTo(0.8889, 3)
    expect(unitWeightKgPerM(8)).toBeCloseTo(0.3951, 3)
  })
})

describe('stirrupCuttingLengthMm', () => {
  it('matches the published SP-34 reference example (500×200mm, 20mm dia → 1640mm)', () => {
    expect(stirrupCuttingLengthMm(500, 200, 20)).toBe(1640)
  })
})

describe('barCount', () => {
  it('counts bars from span/spacing plus one', () => {
    expect(barCount(4000, 150)).toBe(27)
  })
  it('returns 0 for a zero or negative span or spacing rather than dividing by zero', () => {
    expect(barCount(0, 150)).toBe(0)
    expect(barCount(4000, 0)).toBe(0)
    expect(barCount(-100, 150)).toBe(0)
  })
})

describe('computeBeam — worked example from the tool page (4000mm span, 230×450, 4-16 bottom, 2-12 top, 8@150 stirrups)', () => {
  const result = computeBeam({
    clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
    botDiaMm: 16, botCount: 4, topDiaMm: 12, topCount: 2,
    stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
  })

  it('produces the exact hand-verified sub-totals', () => {
    expect(result.rows[0].totalWtKg).toBeCloseTo(35.4, 2)   // bottom bars
    expect(result.rows[1].totalWtKg).toBeCloseTo(9.24, 2)   // top bars
    expect(result.rows[2].totalWtKg).toBeCloseTo(13.4, 2)   // stirrups
  })

  it('produces the exact hand-verified grand total (58.04 kg)', () => {
    expect(result.totalKg).toBeCloseTo(58.04, 2)
  })

  it('drops the anchorage development length when bars do not anchor into a support', () => {
    const noAnchor = computeBeam({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
      botDiaMm: 16, botCount: 4, topDiaMm: 12, topCount: 2,
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: false, ldFactor: 50, nos: 1,
    })
    expect(noAnchor.rows[0].cuttingLengthMm).toBe(4000)
  })
})

describe('computeFooting — worked example from the tool page (1500×1500, 12mm@150 both directions)', () => {
  it('produces the exact hand-verified grand total (27.38 kg)', () => {
    const result = computeFooting({
      lengthMm: 1500, widthMm: 1500, coverMm: 50,
      dir1DiaMm: 12, dir1SpacingMm: 150, dir2DiaMm: 12, dir2SpacingMm: 150, nos: 1,
    })
    expect(result.rows[0].totalWtKg).toBeCloseTo(13.69, 2)
    expect(result.rows[1].totalWtKg).toBeCloseTo(13.69, 2)
    expect(result.totalKg).toBeCloseTo(27.38, 2)
  })
})

function mkRow(diaMm: number, totalWtKg: number): BarRow {
  return { mark: 'X', desc: 'test', diaMm, shape: 'Straight', cuttingLengthMm: 1000, nos: 1, totalLengthM: 1, unitWtKgM: totalWtKg, totalWtKg }
}

describe('summarizeByDiameter', () => {
  it('sums matching diameters across different members, sorted ascending', () => {
    const beam: BbsResult = { rows: [mkRow(12, 5), mkRow(8, 2)], totalKg: 7, totalTonnes: 0.007 }
    const column: BbsResult = { rows: [mkRow(12, 3)], totalKg: 3, totalTonnes: 0.003 }
    const summary = summarizeByDiameter([beam, column])
    expect(summary).toEqual([
      { diaMm: 8, totalWtKg: 2 },
      { diaMm: 12, totalWtKg: 8 },
    ])
  })
})

describe('input validators', () => {
  it('validateBeamInputs passes sane geometry and flags cover too large for the section', () => {
    const sane = validateBeamInputs({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
      botDiaMm: 16, botCount: 4, topDiaMm: 12, topCount: 2,
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
    })
    expect(sane).toEqual([])

    const badCover = validateBeamInputs({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 150,
      botDiaMm: 16, botCount: 4, topDiaMm: 12, topCount: 2,
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
    })
    expect(badCover.length).toBeGreaterThan(0)
    expect(badCover.some((w) => w.includes('width'))).toBe(true)
  })

  it('validateColumnInputs passes sane geometry and flags cover too large for the section', () => {
    const sane = validateColumnInputs({
      clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 40,
      mainDiaMm: 16, mainCount: 6, tieDiaMm: 8, tieSpacingMm: 150,
      lapToNextLift: true, lapFactor: 50, nos: 1,
    })
    expect(sane).toEqual([])

    const badCover = validateColumnInputs({
      clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 150,
      mainDiaMm: 16, mainCount: 6, tieDiaMm: 8, tieSpacingMm: 150,
      lapToNextLift: true, lapFactor: 50, nos: 1,
    })
    expect(badCover.length).toBeGreaterThan(0)
  })

  it('validateSlabInputs passes sane geometry and flags cover too large relative to the long span', () => {
    const sane = validateSlabInputs({
      slabType: 'oneway', shortSpanMm: 3000, longSpanMm: 4000, coverMm: 20,
      mainDiaMm: 10, mainSpacingMm: 150, distDiaMm: 8, distSpacingMm: 200, ldFactor: 50, nos: 1,
    })
    expect(sane).toEqual([])

    const badCover = validateSlabInputs({
      slabType: 'oneway', shortSpanMm: 3000, longSpanMm: 4000, coverMm: 2500,
      mainDiaMm: 10, mainSpacingMm: 150, distDiaMm: 8, distSpacingMm: 200, ldFactor: 50, nos: 1,
    })
    expect(badCover.length).toBeGreaterThan(0)
  })

  it('validateFootingInputs passes sane geometry and flags cover too large for the footing', () => {
    const sane = validateFootingInputs({
      lengthMm: 1500, widthMm: 1500, coverMm: 50,
      dir1DiaMm: 12, dir1SpacingMm: 150, dir2DiaMm: 12, dir2SpacingMm: 150, nos: 1,
    })
    expect(sane).toEqual([])

    const badCover = validateFootingInputs({
      lengthMm: 1500, widthMm: 1500, coverMm: 800,
      dir1DiaMm: 12, dir1SpacingMm: 150, dir2DiaMm: 12, dir2SpacingMm: 150, nos: 1,
    })
    expect(badCover.length).toBeGreaterThan(0)
  })
})
