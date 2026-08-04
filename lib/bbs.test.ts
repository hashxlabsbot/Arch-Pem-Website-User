import { describe, expect, it } from 'vitest'
import {
  unitWeightKgPerM, stirrupCuttingLengthMm, barCount,
  computeBeam, computeColumn, computeSlab, computeFooting, summarizeByDiameter,
  validateBeamInputs, validateColumnInputs, validateSlabInputs, validateFootingInputs,
  normalizeBarSpecs, totalBarCount, planStirrupZones, deriveMarkPrefix,
  issuesForBeam, issuesForColumn,
  type BbsResult, type BarRow, type BeamInputs,
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
    botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
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

  it('carries the geometry each row needs to be drawn', () => {
    expect(result.rows[0].geom).toEqual({ kind: 'straight', lengthMm: 5600 })
    expect(result.rows[1].geom).toEqual({ kind: 'straight', lengthMm: 5200 })
    expect(result.rows[2].geom).toEqual({ kind: 'rect-link', aMm: 180, bMm: 400, diaMm: 8 })
  })

  it('derives the stirrup drawing and its cutting length from identical inputs', () => {
    const g = result.rows[2].geom
    if (g?.kind !== 'rect-link') throw new Error('expected rect-link geometry')
    expect(stirrupCuttingLengthMm(g.aMm, g.bMm, g.diaMm)).toBe(result.rows[2].cuttingLengthMm)
  })

  it('drops the anchorage development length when bars do not anchor into a support', () => {
    const noAnchor = computeBeam({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
      botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: false, ldFactor: 50, nos: 1,
    })
    expect(noAnchor.rows[0].cuttingLengthMm).toBe(4000)
  })
})

describe('computeFooting — worked example from the tool page (1500×1500, 12mm@150 both directions)', () => {
  const result = computeFooting({
    lengthMm: 1500, widthMm: 1500, coverMm: 50,
    dir1DiaMm: 12, dir1SpacingMm: 150, dir2DiaMm: 12, dir2SpacingMm: 150, nos: 1,
  })

  it('produces the exact hand-verified grand total (27.38 kg)', () => {
    expect(result.rows[0].totalWtKg).toBeCloseTo(13.69, 2)
    expect(result.rows[1].totalWtKg).toBeCloseTo(13.69, 2)
    expect(result.totalKg).toBeCloseTo(27.38, 2)
  })

  it('marks every mesh bar as straight geometry matching its cutting length', () => {
    for (const row of result.rows) {
      expect(row.geom).toEqual({ kind: 'straight', lengthMm: row.cuttingLengthMm })
    }
  })
})

describe('computeColumn / computeSlab geometry', () => {
  it('gives the column tie its true internal dimensions', () => {
    const result = computeColumn({
      clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 40,
      mainBars: [{ diaMm: 16, count: 6 }], tieDiaMm: 8, tieSpacingMm: 150,
      lapToNextLift: true, lapFactor: 50, nos: 1,
    })
    expect(result.rows[0].geom).toEqual({ kind: 'straight', lengthMm: 3800 })
    expect(result.rows[1].geom).toEqual({ kind: 'rect-link', aMm: 150, bMm: 150, diaMm: 8 })
  })

  it('marks both slab bar groups as straight geometry matching their cutting lengths', () => {
    const result = computeSlab({
      slabType: 'oneway', shortSpanMm: 3000, longSpanMm: 4000, coverMm: 20,
      mainDiaMm: 10, mainSpacingMm: 150, distDiaMm: 8, distSpacingMm: 200, ldFactor: 50, nos: 1,
    })
    for (const row of result.rows) {
      expect(row.geom).toEqual({ kind: 'straight', lengthMm: row.cuttingLengthMm })
    }
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
      botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
    })
    expect(sane).toEqual([])

    const badCover = validateBeamInputs({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 150,
      botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
    })
    expect(badCover.length).toBeGreaterThan(0)
    expect(badCover.some((w) => w.includes('width'))).toBe(true)
  })

  it('validateColumnInputs passes sane geometry and flags cover too large for the section', () => {
    const sane = validateColumnInputs({
      clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 40,
      mainBars: [{ diaMm: 16, count: 6 }], tieDiaMm: 8, tieSpacingMm: 150,
      lapToNextLift: true, lapFactor: 50, nos: 1,
    })
    expect(sane).toEqual([])

    const badCover = validateColumnInputs({
      clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 150,
      mainBars: [{ diaMm: 16, count: 6 }], tieDiaMm: 8, tieSpacingMm: 150,
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

/* ── Phase 1: drawing-fidelity features ── */

const SPAN = 4686.3   // grid A–B on the reference drawing, 15'-4½"
const REF_BEAM: BeamInputs = {
  clearSpanMm: SPAN, widthMm: 228.6, depthMm: 381, coverMm: 25,
  botBars: [{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }], topBars: [],
  stirDiaMm: 8, stirSpacingMm: 152.4, anchorIntoSupport: true, ldFactor: 50, nos: 1,
}

describe('normalizeBarSpecs', () => {
  it('merges duplicate diameters so they tabulate as one row', () => {
    expect(normalizeBarSpecs([{ diaMm: 20, count: 2 }, { diaMm: 20, count: 1 }]))
      .toEqual([{ diaMm: 20, count: 3 }])
  })
  it('sorts largest first, the way drawings write them', () => {
    expect(normalizeBarSpecs([{ diaMm: 16, count: 1 }, { diaMm: 20, count: 2 }]))
      .toEqual([{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }])
  })
  it('drops unusable entries without throwing', () => {
    expect(normalizeBarSpecs([{ diaMm: 0, count: 3 }, { diaMm: 16, count: 0 }, { diaMm: NaN, count: 2 }])).toEqual([])
    expect(normalizeBarSpecs(undefined)).toEqual([])
    expect(totalBarCount([{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }])).toBe(3)
  })
})

describe('mixed diameters — the error this feature exists to remove', () => {
  const mixed = computeBeam(REF_BEAM)
  const mixedGroup = mixed.rows[0].totalWtKg + mixed.rows[1].totalWtKg

  it('tabulates one row per distinct diameter, largest first', () => {
    expect(mixed.rows[0].diaMm).toBe(20)
    expect(mixed.rows[1].diaMm).toBe(16)
    expect(mixed.rows[0].totalWtKg).toBeCloseTo(33.02, 1)
    expect(mixed.rows[1].totalWtKg).toBeCloseTo(9.93, 1)
    expect(mixedGroup).toBeCloseTo(42.95, 1)
  })

  it('is 15% lighter than forcing the group to all-20Ø', () => {
    const all20 = computeBeam({ ...REF_BEAM, botBars: [{ diaMm: 20, count: 3 }] })
    expect(all20.rows[0].totalWtKg).toBeCloseTo(49.53, 1)
    expect((all20.rows[0].totalWtKg - mixedGroup) / mixedGroup).toBeCloseTo(0.153, 2)
  })

  it('is 31% heavier than forcing the group to all-16Ø', () => {
    const all16 = computeBeam({ ...REF_BEAM, botBars: [{ diaMm: 16, count: 3 }] })
    expect(all16.rows[0].totalWtKg).toBeCloseTo(29.80, 1)
    expect((all16.rows[0].totalWtKg - mixedGroup) / mixedGroup).toBeCloseTo(-0.306, 2)
  })

  it('applies anchorage per diameter, not once for the group', () => {
    expect(mixed.rows[0].cuttingLengthMm).toBeCloseTo(SPAN + 2 * 50 * 20, 6)
    expect(mixed.rows[1].cuttingLengthMm).toBeCloseTo(SPAN + 2 * 50 * 16, 6)
  })

  it('emits no row for an empty bar group', () => {
    expect(computeBeam({ ...REF_BEAM, topBars: [] }).rows.filter((r) => r.desc === 'Top main bars')).toHaveLength(0)
  })
})

describe('planStirrupZones', () => {
  it('reduces exactly to barCount when there are no end zones', () => {
    for (const [span, spacing] of [[4000, 150], [3000, 200], [4686.3, 152.4], [1500, 150]] as const) {
      expect(planStirrupZones(span, [], spacing).totalCount, `${span}/${spacing}`).toBe(barCount(span, spacing))
    }
    expect(planStirrupZones(4000, [], 150).totalCount).toBe(27)
  })

  it('counts the real drawing case as 37, against 31 for a single spacing', () => {
    const plan = planStirrupZones(SPAN, [{ lengthMm: 914.4, spacingMm: 101.6 }], 152.4)
    expect(plan.totalCount).toBe(37)
    expect(plan.middleLengthMm).toBeCloseTo(2857.5, 1)
    expect(plan.overrun).toBe(false)
    const flat = barCount(SPAN, 152.4)
    expect(flat).toBe(31)
    expect((plan.totalCount - flat) / plan.totalCount).toBeCloseTo(0.162, 2)
  })

  it("counts a 3'-0\" zone at 4\" c/c as 9 intervals, not 8 (the float-floor trap)", () => {
    const plan = planStirrupZones(10000, [{ lengthMm: 914.4, spacingMm: 101.6 }], 500)
    expect(plan.zones.find((z) => z.kind === 'end')?.count).toBe(9)
  })

  it('mirrors the zone sequence about mid-span and spans the full length', () => {
    const plan = planStirrupZones(SPAN, [{ lengthMm: 914.4, spacingMm: 101.6 }], 152.4)
    expect(plan.zones.map((z) => z.kind)).toEqual(['end', 'middle', 'end'])
    expect(plan.zones.reduce((s, z) => s + z.lengthMm, 0)).toBeCloseTo(SPAN, 6)
  })

  it('clamps and flags zones that overrun the span rather than going negative', () => {
    const plan = planStirrupZones(1800, [{ lengthMm: 1067, spacingMm: 102 }], 150)
    expect(plan.overrun).toBe(true)
    expect(plan.middleLengthMm).toBe(0)
    expect(plan.totalCount).toBeGreaterThanOrEqual(1)
    expect(Number.isFinite(plan.totalCount)).toBe(true)
    expect(plan.zones.reduce((s, z) => s + z.lengthMm, 0)).toBeLessThanOrEqual(1800 + 1e-6)
  })

  it('survives degenerate input without NaN', () => {
    for (const span of [0, -1, NaN, Infinity]) {
      const p = planStirrupZones(span, [{ lengthMm: 100, spacingMm: 10 }], 150)
      expect(Number.isFinite(p.totalCount)).toBe(true)
    }
    const zeroSpacing = planStirrupZones(4000, [{ lengthMm: 900, spacingMm: 0 }], 150)
    expect(Number.isFinite(zeroSpacing.totalCount)).toBe(true)
    expect(zeroSpacing.zones.every((z) => Number.isFinite(z.count))).toBe(true)
  })
})

describe('zoned beam schedule', () => {
  const zoned = computeBeam({ ...REF_BEAM, stirEndZones: [{ lengthMm: 914.4, spacingMm: 101.6 }] })
  it('multiplies the zoned count by the number of identical members', () => {
    const stir = zoned.rows.find((r) => r.shape === 'Rectangular closed stirrup')!
    expect(stir.nos).toBe(37)
    const twice = computeBeam({ ...REF_BEAM, stirEndZones: [{ lengthMm: 914.4, spacingMm: 101.6 }], nos: 2 })
    expect(twice.rows.find((r) => r.shape === 'Rectangular closed stirrup')!.nos).toBe(74)
  })
  it('describes the zoning on the row, and stays plain when uniform', () => {
    expect(zoned.rows.find((r) => r.shape === 'Rectangular closed stirrup')!.desc).toContain('at each end')
    expect(computeBeam(REF_BEAM).rows.find((r) => r.shape === 'Rectangular closed stirrup')!.desc).toBe('Stirrups')
  })
})

describe('bar-mark prefixes', () => {
  it('reproduces the original marks when no prefix is given', () => {
    const r = computeBeam({
      clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
      botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
      stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
    })
    expect(r.rows.map((x) => x.mark)).toEqual(['B1', 'B2', 'B3'])
  })

  it("prefixes rows with the drawing's own member mark", () => {
    const r = computeBeam({ ...REF_BEAM, markPrefix: 'B7' })
    expect(r.rows.map((x) => x.mark)).toEqual(['B7-1', 'B7-2', 'B7-3'])
  })

  it('sanitises a label into a usable prefix', () => {
    expect(deriveMarkPrefix('Beam 1', 'B')).toBe('BEAM1')
    expect(deriveMarkPrefix('B7', 'B')).toBe('B7')
    expect(deriveMarkPrefix('B-7 (terrace)', 'B')).toBe('B7TERRAC')
    expect(deriveMarkPrefix('   ', 'B')).toBe('B')
    expect(deriveMarkPrefix('', 'B')).toBe('B')
  })
})

describe('issues — errors block, checks only warn', () => {
  it('raises an error when stated stirrup zones exceed the span', () => {
    const issues = issuesForBeam({ ...REF_BEAM, clearSpanMm: 1800, stirEndZones: [{ lengthMm: 1067, spacingMm: 102 }] })
    expect(issues.some((x) => x.level === 'error' && x.message.includes('exceed the span'))).toBe(true)
  })

  it('raises an error for a half-filled bar row', () => {
    const issues = issuesForBeam({ ...REF_BEAM, botBars: [{ diaMm: 20, count: 0 }] })
    expect(issues.some((x) => x.level === 'error' && x.message.includes('half filled'))).toBe(true)
  })

  it('raises an error for a zone with a length but no spacing', () => {
    const issues = issuesForBeam({ ...REF_BEAM, stirEndZones: [{ lengthMm: 900, spacingMm: 0 }] })
    expect(issues.some((x) => x.level === 'error' && x.message.includes('no spacing'))).toBe(true)
  })

  it('only warns about a non-standard diameter, never blocks', () => {
    const issues = issuesForBeam({ ...REF_BEAM, botBars: [{ diaMm: 18, count: 2 }] })
    expect(issues.some((x) => x.level === 'check' && x.message.includes('18 mm'))).toBe(true)
    expect(validateBeamInputs({ ...REF_BEAM, botBars: [{ diaMm: 18, count: 2 }] })).toEqual([])
  })

  it('flags a feet value typed where millimetres were meant', () => {
    const issues = issuesForBeam({ ...REF_BEAM, clearSpanMm: 45720 })
    expect(issues.some((x) => x.level === 'check' && x.message.includes('feet value'))).toBe(true)
  })

  it('flags a swapped stirrup/main diameter on a column', () => {
    const issues = issuesForColumn({
      clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 40,
      mainBars: [{ diaMm: 8, count: 6 }], tieDiaMm: 16, tieSpacingMm: 150,
      lapToNextLift: true, lapFactor: 50, nos: 1,
    })
    expect(issues.some((x) => x.level === 'check' && x.message.includes('swapped'))).toBe(true)
  })
})

/* ── Phase 2: schedule completeness ── */

describe('extra top bars over supports', () => {
  const withExtra = computeBeam({
    ...REF_BEAM,
    extraTopBars: [{ diaMm: 16, count: 2 }],
    extraTopLengthMm: 1143,   // 3'-9" as the drawing states it
  })

  it('adds one row using the stated length, at both supports by default', () => {
    const r = withExtra.rows.find((x) => x.desc === 'Extra top bars over supports')!
    expect(r.cuttingLengthMm).toBe(1143)
    expect(r.nos).toBe(4)      // 2 bars × 2 supports
    expect(r.diaMm).toBe(16)
  })

  it('halves the count when they sit at one end only', () => {
    const oneEnd = computeBeam({ ...REF_BEAM, extraTopBars: [{ diaMm: 16, count: 2 }], extraTopLengthMm: 1143, extraTopBothEnds: false })
    expect(oneEnd.rows.find((x) => x.desc === 'Extra top bars over supports')!.nos).toBe(2)
  })

  it('emits nothing when no length is stated, and flags it', () => {
    const noLen = computeBeam({ ...REF_BEAM, extraTopBars: [{ diaMm: 16, count: 2 }] })
    expect(noLen.rows.some((x) => x.desc === 'Extra top bars over supports')).toBe(false)
    expect(validateBeamInputs({ ...REF_BEAM, extraTopBars: [{ diaMm: 16, count: 2 }] })
      .some((m) => m.includes('length the drawing states'))).toBe(true)
  })
})

describe('side face bars', () => {
  it('doubles for "on each face" and carries anchorage like other longitudinal bars', () => {
    const r = computeBeam({ ...REF_BEAM, faceBars: [{ diaMm: 16, count: 1 }] })
      .rows.find((x) => x.desc === 'Side face bars')!
    expect(r.nos).toBe(2)
    expect(r.cuttingLengthMm).toBeCloseTo(REF_BEAM.clearSpanMm + 2 * 50 * 16, 6)
  })

  it('counts once per bar when they are not on each face', () => {
    expect(computeBeam({ ...REF_BEAM, faceBars: [{ diaMm: 16, count: 1 }], faceEachFace: false })
      .rows.find((x) => x.desc === 'Side face bars')!.nos).toBe(1)
  })
})

describe('column lifts and inner ties', () => {
  const BASE = {
    clearHeightMm: 3000, widthMm: 300, depthMm: 450, coverMm: 40,
    mainBars: [{ diaMm: 16, count: 8 }], tieDiaMm: 10, tieSpacingMm: 150,
    lapToNextLift: true, lapFactor: 50, nos: 1,
  }

  it('tabulates each storey separately, labelled, with its own lap', () => {
    const r = computeColumn({
      ...BASE,
      lifts: [
        { label: 'Terrace-3rd', heightMm: 3000, mainBars: [{ diaMm: 16, count: 10 }] },
        { label: '2nd-Fdn', heightMm: 3200, mainBars: [{ diaMm: 20, count: 4 }, { diaMm: 16, count: 6 }] },
      ],
    })
    const mains = r.rows.filter((x) => x.desc.startsWith('Main vertical bars'))
    expect(mains.map((x) => x.desc)).toEqual([
      'Main vertical bars (Terrace-3rd)',
      'Main vertical bars (2nd-Fdn)',
      'Main vertical bars (2nd-Fdn)',
    ])
    expect(mains[0].nos).toBe(10)
    expect(mains[0].cuttingLengthMm).toBe(3000 + 50 * 16)
    expect(mains[1].diaMm).toBe(20)
    expect(mains[1].cuttingLengthMm).toBe(3200 + 50 * 20)
  })

  it('shares one tie arrangement across every lift, summing the counts', () => {
    const lifts = [
      { label: 'A', heightMm: 3000, mainBars: [{ diaMm: 16, count: 8 }] },
      { label: 'B', heightMm: 3000, mainBars: [{ diaMm: 16, count: 8 }] },
    ]
    const r = computeColumn({ ...BASE, lifts })
    const ties = r.rows.find((x) => x.desc.startsWith('Ties'))!
    expect(ties.nos).toBe(2 * barCount(3000, 150))
  })

  it('falls back to the single lift when none are listed', () => {
    const single = computeColumn(BASE)
    expect(single.rows.filter((x) => x.desc.startsWith('Main vertical')).map((x) => x.desc)).toEqual(['Main vertical bars'])
    expect(single.rows.find((x) => x.desc.startsWith('Ties'))!.nos).toBe(barCount(3000, 150))
  })

  it('adds an inner tie at its own stated internal size, matching the tie count', () => {
    const r = computeColumn({ ...BASE, innerTieDiaMm: 8, innerTieAMm: 100, innerTieBMm: 370 })
    const inner = r.rows.find((x) => x.desc === 'Inner ties')!
    expect(inner.diaMm).toBe(8)
    expect(inner.cuttingLengthMm).toBe(stirrupCuttingLengthMm(100, 370, 8))
    expect(inner.nos).toBe(r.rows.find((x) => x.desc.startsWith('Ties'))!.nos)
    expect(inner.geom).toEqual({ kind: 'rect-link', aMm: 100, bMm: 370, diaMm: 8 })
  })

  it('flags a half-specified inner tie rather than guessing its size', () => {
    expect(validateColumnInputs({ ...BASE, innerTieDiaMm: 8 })
      .some((m) => m.includes('Inner ties need'))).toBe(true)
    expect(validateColumnInputs({ ...BASE, innerTieDiaMm: 8, innerTieAMm: 100, innerTieBMm: 370 })).toEqual([])
  })
})

describe('slab top steel over supports', () => {
  const SLAB_BASE = {
    slabType: 'oneway' as const, shortSpanMm: 3000, longSpanMm: 4000, coverMm: 25,
    mainDiaMm: 10, mainSpacingMm: 150, distDiaMm: 8, distSpacingMm: 200, ldFactor: 50, nos: 1,
  }

  it('adds a row at the stated length, counted across the long span at both edges', () => {
    const r = computeSlab({ ...SLAB_BASE, topDiaMm: 10, topSpacingMm: 150, topLengthMm: 686 })
    const top = r.rows.find((x) => x.desc === 'Top bars over supports')!
    expect(top.cuttingLengthMm).toBe(686)
    expect(top.nos).toBe(barCount(4000, 150) * 2)
  })

  it('is omitted entirely when not specified', () => {
    expect(computeSlab(SLAB_BASE).rows.map((x) => x.desc)).toEqual(['Main bars', 'Distribution bars'])
  })

  it('flags a partly specified top group', () => {
    expect(validateSlabInputs({ ...SLAB_BASE, topDiaMm: 10 }).some((m) => m.includes('Top bars need'))).toBe(true)
  })
})
