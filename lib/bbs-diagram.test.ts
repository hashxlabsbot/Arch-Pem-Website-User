import { describe, expect, it } from 'vitest'
import { barCount, type BeamInputs, type ColumnInputs, type FootingInputs, type SlabInputs } from './bbs'
import {
  fitScale, rectLinkGlyph, indicativeLinkGlyph, rowGlyph, STRAIGHT_GLYPH,
  beamSectionDiagram, columnSectionDiagram, distributeAlongFaces,
  slabPlanDiagram, footingPlanDiagram, meshPlanDiagram,
  LINK_BOX, MIN_BAR_R, SEC_MAX_W, SEC_MAX_H,
} from './bbs-diagram'

const BEAM: BeamInputs = {
  clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
  botDiaMm: 16, botCount: 4, topDiaMm: 12, topCount: 2,
  stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
}
const COLUMN: ColumnInputs = {
  clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 40,
  mainDiaMm: 16, mainCount: 6, tieDiaMm: 8, tieSpacingMm: 150,
  lapToNextLift: true, lapFactor: 50, nos: 1,
}
const SLAB: SlabInputs = {
  slabType: 'oneway', shortSpanMm: 3000, longSpanMm: 4000, coverMm: 20,
  mainDiaMm: 10, mainSpacingMm: 150, distDiaMm: 8, distSpacingMm: 200, ldFactor: 50, nos: 1,
}
const FOOTING: FootingInputs = {
  lengthMm: 1500, widthMm: 1500, coverMm: 50,
  dir1DiaMm: 12, dir1SpacingMm: 150, dir2DiaMm: 12, dir2SpacingMm: 150, nos: 1,
}

const numbersIn = (s: string) => s.match(/-?[\d.]+|NaN|Infinity|undefined/g) ?? []
const isClean = (s: string) => !/NaN|Infinity|undefined/.test(s)

describe('fitScale', () => {
  it('never exceeds either bound and preserves aspect', () => {
    const s = fitScale(230, 450, SEC_MAX_W, SEC_MAX_H)
    expect(230 * s).toBeLessThanOrEqual(SEC_MAX_W + 1e-9)
    expect(450 * s).toBeLessThanOrEqual(SEC_MAX_H + 1e-9)
    expect(450 * s).toBeCloseTo(SEC_MAX_H, 6) // height is the binding constraint here
  })
  it('returns 0 for degenerate input rather than Infinity', () => {
    expect(fitScale(0, 100, 200, 200)).toBe(0)
    expect(fitScale(-5, 100, 200, 200)).toBe(0)
  })
})

describe('rectLinkGlyph', () => {
  it('draws to the true a:b aspect ratio', () => {
    const g = rectLinkGlyph(180, 400, 8)!
    expect(g.rect.w / g.rect.h).toBeCloseTo(180 / 400, 6)
    expect(g.rect.h).toBeCloseTo(LINK_BOX, 6) // longer side fills the box
  })

  it('draws a square link square', () => {
    const g = rectLinkGlyph(150, 150, 8)!
    expect(g.rect.w).toBeCloseTo(g.rect.h, 6)
  })

  it('labels the real internal dimensions', () => {
    const g = rectLinkGlyph(180, 400, 8)!
    expect(g.aDim?.label).toBe('180')
    expect(g.bDim?.label).toBe('400')
    expect(g.indicative).toBe(false)
  })

  it('returns null for non-positive dimensions', () => {
    expect(rectLinkGlyph(0, 400, 8)).toBeNull()
    expect(rectLinkGlyph(-5, 10, 8)).toBeNull()
    expect(rectLinkGlyph(180, Number.NaN, 8)).toBeNull()
  })

  it('keeps both 135° hook tails inside the link outline', () => {
    for (const [a, b] of [[180, 400], [150, 150], [50, 800], [800, 50]] as const) {
      const g = rectLinkGlyph(a, b, 8)!
      const { x, y, w, h } = g.rect
      for (const hook of g.hookPaths) {
        const n = numbersIn(hook).map(Number)
        const [sx, sy, ex, ey] = n
        // starts on the outline, ends strictly inside it
        expect(sx).toBeGreaterThanOrEqual(x - 1e-6)
        expect(sy).toBeGreaterThanOrEqual(y - 1e-6)
        expect(ex).toBeGreaterThan(x)
        expect(ey).toBeGreaterThan(y)
        expect(ex).toBeLessThan(x + w)
        expect(ey).toBeLessThan(y + h)
      }
    }
  })
})

describe('rowGlyph degradation', () => {
  it('uses real geometry when present', () => {
    const g = rowGlyph({ shape: 'Rectangular closed stirrup', geom: { kind: 'rect-link', aMm: 180, bMm: 400, diaMm: 8 } })
    expect(g.kind).toBe('rect-link')
    expect(g.indicative).toBe(false)
  })

  it('falls back to an un-dimensioned link when a legacy row has no geometry', () => {
    const g = rowGlyph({ shape: 'Rectangular closed stirrup', geom: undefined })
    expect(g.kind).toBe('rect-link')
    expect(g.indicative).toBe(true)
    if (g.kind !== 'rect-link') throw new Error('unreachable')
    expect(g.aDim).toBeNull()
    expect(g.bDim).toBeNull()
  })

  it('needs no fallback for straight bars, which assert no dimension', () => {
    expect(rowGlyph({ shape: 'Straight', geom: undefined })).toBe(STRAIGHT_GLYPH)
    expect(rowGlyph({ shape: 'Straight (mesh)', geom: undefined })).toBe(STRAIGHT_GLYPH)
  })

  it('never claims dimensions on the indicative fallback', () => {
    const g = indicativeLinkGlyph()
    expect(g.title).toMatch(/not to scale/i)
  })
})

describe('beamSectionDiagram', () => {
  const d = beamSectionDiagram(BEAM)!

  it('draws the concrete outline to the real width:depth ratio', () => {
    expect(d.outer.w / d.outer.h).toBeCloseTo(230 / 450, 6)
  })

  it('insets the link by exactly the clear cover', () => {
    expect((d.outer.w - d.link.w) / 2 / d.scale).toBeCloseTo(25, 6)
    expect((d.outer.h - d.link.h) / 2 / d.scale).toBeCloseTo(25, 6)
  })

  it('places 4 bottom and 2 top bars, outermost tangent to the link legs', () => {
    expect(d.bars).toHaveLength(6)
    const bottom = d.bars.slice(0, 4)
    const top = d.bars.slice(4)
    expect(bottom[0].cx - bottom[0].r).toBeCloseTo(d.link.x, 1)
    expect(bottom[3].cx + bottom[3].r).toBeCloseTo(d.link.x + d.link.w, 1)
    expect(top).toHaveLength(2)
    expect(d.barsOverlap).toBe(false)
    expect(d.barsToScale).toBe(true)
  })

  it('flags overlap instead of inventing a second layer', () => {
    const crowded = beamSectionDiagram({ ...BEAM, botCount: 8, botDiaMm: 25 })!
    expect(crowded.barsOverlap).toBe(true)
    expect(crowded.bars.filter((b) => b.cy > crowded.link.y + crowded.link.h / 2)).toHaveLength(8)
  })

  it('returns null when cover swallows the section', () => {
    expect(beamSectionDiagram({ ...BEAM, coverMm: 150 })).toBeNull()
    expect(beamSectionDiagram({ ...BEAM, widthMm: 0 })).toBeNull()
  })
})

describe('columnSectionDiagram / distributeAlongFaces', () => {
  it('renders the default 6-bar column as the idiomatic 3 top / 3 bottom', () => {
    const d = columnSectionDiagram(COLUMN)!
    expect(d.bars).toHaveLength(6)
    const ys = Array.from(new Set(d.bars.map((b) => Math.round(b.cy)))).sort((a, b) => a - b)
    expect(ys).toHaveLength(2) // all six sit on the top or bottom face
    expect(d.bars.filter((b) => Math.round(b.cy) === ys[0])).toHaveLength(3)
    expect(d.bars.filter((b) => Math.round(b.cy) === ys[1])).toHaveLength(3)
  })

  it('puts one bar on every face for an 8-bar column', () => {
    const link = { x: 0, y: 0, w: 100, h: 100 }
    const bars = distributeAlongFaces(link, 8, 5)
    expect(bars).toHaveLength(8)
    const mids = bars.slice(4)
    expect(mids.map((b) => `${Math.round(b.cx)},${Math.round(b.cy)}`).sort()).toEqual(
      ['5,50', '50,5', '50,95', '95,50'],
    )
  })

  it('handles the trivial counts', () => {
    const link = { x: 0, y: 0, w: 100, h: 100 }
    expect(distributeAlongFaces(link, 0, 5)).toEqual([])
    expect(distributeAlongFaces(link, 1, 5)).toEqual([{ cx: 50, cy: 50, r: 5 }])
    expect(distributeAlongFaces(link, 4, 5)).toHaveLength(4)
  })

  it('keeps the four corner bars tangent to two link legs each', () => {
    const d = columnSectionDiagram(COLUMN)!
    const corners = d.bars.slice(0, 4)
    for (const c of corners) {
      const onX = Math.abs(c.cx - c.r - d.link.x) < 0.2 || Math.abs(c.cx + c.r - (d.link.x + d.link.w)) < 0.2
      const onY = Math.abs(c.cy - c.r - d.link.y) < 0.2 || Math.abs(c.cy + c.r - (d.link.y + d.link.h)) < 0.2
      expect(onX && onY).toBe(true)
    }
  })
})

describe('slabPlanDiagram', () => {
  const d = slabPlanDiagram(SLAB)!

  it('uses the same bar counts the schedule uses', () => {
    expect(d.dir1.count).toBe(barCount(4000, 150))
    expect(d.dir1.count).toBe(27)
    expect(d.dir2.count).toBe(barCount(3000, 200))
    expect(d.dir2.count).toBe(16)
  })

  it('spaces main bars at the real pitch from the panel edge', () => {
    const pitch = 150 * d.scale
    const ys = d.dir1.lines.map((l) => Number(numbersIn(l)[1]))
    // Emitted path numbers are rounded to 2dp, so compare at that resolution.
    expect(ys[0]).toBeCloseTo(d.panel.y, 1)
    expect(ys[1] - ys[0]).toBeCloseTo(pitch, 1)
    expect(ys[ys.length - 1]).toBeLessThanOrEqual(d.panel.y + d.panel.h + 0.05)
  })

  it('runs main bars flush to the panel edges but insets distribution bars by the cover', () => {
    const main = numbersIn(d.dir1.lines[0]).map(Number)
    expect(main[0]).toBeCloseTo(d.panel.x, 6)
    expect(main[2]).toBeCloseTo(d.panel.x + d.panel.w, 6)

    const dist = numbersIn(d.dir2.lines[0]).map(Number)
    expect(dist[1]).toBeCloseTo(d.panel.y + 20 * d.scale, 6)
    expect(dist[3]).toBeCloseTo(d.panel.y + d.panel.h - 20 * d.scale, 6)
  })

  it('shows true first/last bars rather than resampling past the density cap', () => {
    const dense = slabPlanDiagram({ ...SLAB, longSpanMm: 6000, mainSpacingMm: 50 })!
    expect(dense.dir1.count).toBe(121)
    expect(dense.dir1.drawnAll).toBe(false)
    expect(dense.dir1.lines).toHaveLength(6)
    const ys = dense.dir1.lines.map((l) => Number(numbersIn(l)[1]))
    const pitch = 50 * dense.scale
    expect(ys[0]).toBeCloseTo(dense.panel.y, 6)
    expect(ys[1]).toBeCloseTo(dense.panel.y + pitch, 6)
    expect(ys[5]).toBeCloseTo(dense.panel.y + 120 * pitch, 6)
  })
})

describe('footingPlanDiagram', () => {
  it('draws an 11 × 11 mesh inset by the cover in both directions', () => {
    const d = footingPlanDiagram(FOOTING)!
    expect(d.dir1.count).toBe(11)
    expect(d.dir2.count).toBe(11)
    const a = numbersIn(d.dir1.lines[0]).map(Number)
    expect(a[0]).toBeCloseTo(d.panel.x + 50 * d.scale, 6)
    const b = numbersIn(d.dir2.lines[0]).map(Number)
    expect(b[1]).toBeCloseTo(d.panel.y + 50 * d.scale, 6)
  })
})

describe('degenerate input never emits NaN or Infinity', () => {
  const nasty = [0, -1, 1, 100000, Number.NaN, Number.POSITIVE_INFINITY]

  it('sweeps every builder', () => {
    for (const v of nasty) {
      const builders = [
        () => beamSectionDiagram({ ...BEAM, widthMm: v }),
        () => beamSectionDiagram({ ...BEAM, coverMm: v }),
        () => beamSectionDiagram({ ...BEAM, botDiaMm: v, botCount: v }),
        () => columnSectionDiagram({ ...COLUMN, depthMm: v }),
        () => columnSectionDiagram({ ...COLUMN, mainCount: v }),
        () => slabPlanDiagram({ ...SLAB, shortSpanMm: v }),
        () => slabPlanDiagram({ ...SLAB, mainSpacingMm: v }),
        () => footingPlanDiagram({ ...FOOTING, coverMm: v }),
        () => footingPlanDiagram({ ...FOOTING, dir1SpacingMm: v }),
      ]
      for (const build of builders) {
        const d = build()
        if (!d) continue
        const strings =
          d.variant === 'section'
            ? [...d.dims.map((x) => x.path), ...d.bars.map((b) => `${b.cx} ${b.cy} ${b.r}`)]
            : [...d.dims.map((x) => x.path), ...d.dir1.lines, ...d.dir2.lines]
        for (const s of strings) expect(isClean(s), `dirty path from input ${String(v)}: ${s}`).toBe(true)
        expect(Number.isFinite(d.viewW) && Number.isFinite(d.viewH)).toBe(true)
      }
    }
  })

  it('rejects a zero-area panel outright', () => {
    expect(meshPlanDiagram({
      panelWmm: 0, panelHmm: 100,
      dir1: { count: 3, spacingMm: 10, extentInsetMm: 0 },
      dir2: { count: 3, spacingMm: 10, extentInsetMm: 0 },
      title: 't',
    })).toBeNull()
  })

  it('clamps a bar radius up so tiny bars stay visible, and says so', () => {
    const d = beamSectionDiagram({ ...BEAM, botDiaMm: 0.01, topDiaMm: 0.01 })!
    expect(d.barsToScale).toBe(false)
    for (const b of d.bars) expect(b.r).toBeGreaterThanOrEqual(MIN_BAR_R)
  })
})
