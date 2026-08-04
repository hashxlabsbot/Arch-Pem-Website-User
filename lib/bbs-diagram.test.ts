import { describe, expect, it } from 'vitest'
import { barCount, type BeamInputs, type ColumnInputs, type FootingInputs, type SlabInputs } from './bbs'
import {
  fitScale, rectLinkGlyph, indicativeLinkGlyph, rowGlyph, STRAIGHT_GLYPH,
  beamSectionDiagram, columnSectionDiagram, distributeAlongFaces,
  slabPlanDiagram, footingPlanDiagram, meshPlanDiagram,
  layerCircles, distributeAlongFacesR, spreadAcross, beamElevationDiagram,
  LINK_BOX, MIN_BAR_R, SEC_MAX_W, SEC_MAX_H, MAX_ELEV_TICKS,
} from './bbs-diagram'

const BEAM: BeamInputs = {
  clearSpanMm: 4000, widthMm: 230, depthMm: 450, coverMm: 25,
  botBars: [{ diaMm: 16, count: 4 }], topBars: [{ diaMm: 12, count: 2 }],
  stirDiaMm: 8, stirSpacingMm: 150, anchorIntoSupport: true, ldFactor: 50, nos: 1,
}
const COLUMN: ColumnInputs = {
  clearHeightMm: 3000, widthMm: 230, depthMm: 230, coverMm: 40,
  mainBars: [{ diaMm: 16, count: 6 }], tieDiaMm: 8, tieSpacingMm: 150,
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
    const crowded = beamSectionDiagram({ ...BEAM, botBars: [{ diaMm: 25, count: 8 }] })!
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
        () => beamSectionDiagram({ ...BEAM, botBars: [{ diaMm: v, count: v }] }),
        () => columnSectionDiagram({ ...COLUMN, depthMm: v }),
        () => columnSectionDiagram({ ...COLUMN, mainBars: [{ diaMm: 16, count: v }] }),
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
    const d = beamSectionDiagram({ ...BEAM, botBars: [{ diaMm: 0.01, count: 4 }], topBars: [{ diaMm: 0.01, count: 2 }] })!
    expect(d.barsToScale).toBe(false)
    for (const b of d.bars) expect(b.r).toBeGreaterThanOrEqual(MIN_BAR_R)
  })
})

/* ── Phase 1: mixed diameters and the stirrup-zone elevation ── */

describe('layerCircles', () => {
  const link = { x: 10, y: 10, w: 200, h: 120 }

  it('is identical to spreadAcross for a single diameter', () => {
    for (const n of [1, 2, 3, 4, 6, 9]) {
      const dia = 16
      const scale = 0.5
      const r = (dia / 2) * scale
      const got = layerCircles(link, [{ diaMm: dia, count: n }], scale, 'bottom')
      const want = spreadAcross(link, n, r)
      expect(got.bars).toHaveLength(n)
      got.bars.forEach((b, idx) => expect(b.cx, `n=${n} i=${idx}`).toBeCloseTo(want[idx], 9))
    }
  })

  it('puts the largest bars on the corners and keeps them inside the link', () => {
    const got = layerCircles(link, [{ diaMm: 20, count: 2 }, { diaMm: 16, count: 1 }], 0.5, 'bottom')
    expect(got.bars).toHaveLength(3)
    expect(got.bars[0].r).toBeCloseTo(5, 6)      // 20mm at 0.5 scale
    expect(got.bars[2].r).toBeCloseTo(5, 6)
    expect(got.bars[1].r).toBeCloseTo(4, 6)      // the 16mm sits between them
    expect(got.bars[0].cx - got.bars[0].r).toBeCloseTo(link.x, 6)
    expect(got.bars[2].cx + got.bars[2].r).toBeCloseTo(link.x + link.w, 6)
  })

  it('sits bars tangent to the requested face', () => {
    const bottom = layerCircles(link, [{ diaMm: 16, count: 2 }], 0.5, 'bottom')
    const top = layerCircles(link, [{ diaMm: 16, count: 2 }], 0.5, 'top')
    expect(bottom.bars[0].cy + bottom.bars[0].r).toBeCloseTo(link.y + link.h, 6)
    expect(top.bars[0].cy - top.bars[0].r).toBeCloseTo(link.y, 6)
  })

  it('reports overlap rather than inventing a second layer', () => {
    expect(layerCircles(link, [{ diaMm: 40, count: 12 }], 1, 'bottom').overlap).toBe(true)
    expect(layerCircles(link, [{ diaMm: 16, count: 3 }], 0.5, 'bottom').overlap).toBe(false)
  })

  it('caps how many it draws while still reporting the true total', () => {
    const got = layerCircles(link, [{ diaMm: 16, count: 200 }], 0.5, 'bottom')
    expect(got.total).toBe(200)
    expect(got.shown).toBeLessThan(200)
    expect(got.bars).toHaveLength(got.shown)
  })

  it('handles an empty group', () => {
    expect(layerCircles(link, [], 0.5, 'bottom')).toEqual({ bars: [], toScale: true, overlap: false, shown: 0, total: 0 })
  })
})

describe('distributeAlongFacesR', () => {
  const link = { x: 0, y: 0, w: 100, h: 100 }
  it('matches the single-radius form when every radius is equal', () => {
    for (const n of [1, 3, 4, 8]) {
      const want = distributeAlongFaces(link, n, 4)
      const got = distributeAlongFacesR(link, Array(n).fill(4))
      expect(got).toEqual(want)
    }
  })
  it('gives the corners the largest bars', () => {
    const got = distributeAlongFacesR(link, [3, 5, 3, 5, 3, 5])
    expect(got.slice(0, 4).map((b) => b.r)).toEqual([5, 5, 5, 3])
  })
})

describe('beamElevationDiagram', () => {
  const ZONED: BeamInputs = { ...BEAM, clearSpanMm: 4686.3, stirSpacingMm: 152.4, stirEndZones: [{ lengthMm: 914.4, spacingMm: 101.6 }] }

  it('is omitted when the spacing is uniform — it would add nothing', () => {
    expect(beamElevationDiagram(BEAM)).toBeNull()
  })

  it('draws exactly as many ticks as the schedule counts stirrups', () => {
    const d = beamElevationDiagram(ZONED)!
    expect(d.tickCount).toBe(37)
    expect(d.stirrups).toHaveLength(37)
    expect(d.drawnAll).toBe(true)
  })

  it('spans the full beam, left face to right face, monotonically', () => {
    const d = beamElevationDiagram(ZONED)!
    const xs = d.stirrups.map((p) => Number(p.split(' ')[1]))
    expect(xs[0]).toBeCloseTo(d.beam.x, 6)
    expect(xs[xs.length - 1]).toBeCloseTo(d.beam.x + d.beam.w, 6)
    for (let k = 1; k < xs.length; k++) expect(xs[k]).toBeGreaterThanOrEqual(xs[k - 1])
  })

  it('bands cover the whole span and are labelled per zone', () => {
    const d = beamElevationDiagram(ZONED)!
    expect(d.zoneBands.map((b) => b.kind)).toEqual(['end', 'middle', 'end'])
    expect(d.zoneBands[0].label).toBe('9 @ 102')
  })

  it('never dimensions the depth, because the vertical scale is exaggerated', () => {
    const d = beamElevationDiagram(ZONED)!
    expect(d.yToScale).toBe(false)
    expect(d.dims).toHaveLength(1)
    expect(d.dims[0].label).toBe('4686')
  })

  it('falls back to true first/last positions past the tick cap', () => {
    const dense = beamElevationDiagram({ ...ZONED, clearSpanMm: 20000, stirSpacingMm: 75, stirEndZones: [{ lengthMm: 3000, spacingMm: 50 }] })!
    expect(dense.tickCount).toBeGreaterThan(MAX_ELEV_TICKS)
    expect(dense.drawnAll).toBe(false)
    expect(dense.stirrups).toHaveLength(6)
  })

  it('returns null for a degenerate span', () => {
    for (const v of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(beamElevationDiagram({ ...ZONED, clearSpanMm: v })).toBeNull()
    }
  })

  it('emits no NaN in any path', () => {
    for (const v of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1e12]) {
      const d = beamElevationDiagram({ ...ZONED, stirSpacingMm: v })
      if (!d) continue
      const all = [...d.stirrups, ...d.mainLines, ...d.zoneBands.map((b) => b.path), ...d.dims.map((x) => x.path)].join(' ')
      expect(all, `stirSpacingMm=${v}`).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
})
