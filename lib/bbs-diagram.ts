/**
 * Layout maths for the BBS drawings — pure, React-free, DOM-free.
 *
 * Everything here returns plain data (numbers and SVG path `d` strings) so it
 * can be unit-tested in plain Node; the components in
 * components/tools/BBSDiagrams.tsx do no arithmetic of their own.
 *
 * Standing rule for this tool: never draw something we didn't compute. Where a
 * depiction is assumed rather than calculated (bar *arrangement* inside a beam
 * or column section), the returned data says so via flags the caption uses —
 * it is never silently presented as a detailing drawing.
 */
import {
  barCount,
  type BarRow,
  type BeamInputs,
  type ColumnInputs,
  type FootingInputs,
  type SlabInputs,
} from './bbs'

const fin = (n: number) => Number.isFinite(n)
/** Non-finite counts must never reach a length, an index or a caption. */
const safeInt = (n: number) => (fin(n) ? Math.max(0, Math.round(n)) : 0)
/** Bar radius, clamped up so hairline bars stay visible; never non-finite. */
const safeRadius = (diaMm: number, scale: number) => {
  const trueR = (diaMm / 2) * scale
  return fin(trueR) ? Math.max(MIN_BAR_R, trueR) : MIN_BAR_R
}
/** Keeps emitted path strings short and stable enough to assert on in tests. */
const r2 = (n: number) => Math.round(n * 100) / 100
const num = (n: number) => String(r2(n))

export type Rect = { x: number; y: number; w: number; h: number }
export type BarCircle = { cx: number; cy: number; r: number }
export type Dim = {
  path: string
  tx: number
  ty: number
  anchor: 'middle' | 'start' | 'end'
  label: string
}

/** Largest scale fitting realW×realH inside maxW×maxH without distorting it. */
export function fitScale(realW: number, realH: number, maxW: number, maxH: number): number {
  if (!fin(realW) || !fin(realH) || realW <= 0 || realH <= 0) return 0
  return Math.min(maxW / realW, maxH / realH)
}

function dimLine(
  from: { x: number; y: number },
  to: { x: number; y: number },
  tick: number,
  vertical: boolean,
): string {
  if (vertical) {
    return [
      `M ${num(from.x - tick)} ${num(from.y)} L ${num(from.x + tick)} ${num(from.y)}`,
      `M ${num(from.x)} ${num(from.y)} L ${num(to.x)} ${num(to.y)}`,
      `M ${num(to.x - tick)} ${num(to.y)} L ${num(to.x + tick)} ${num(to.y)}`,
    ].join(' ')
  }
  return [
    `M ${num(from.x)} ${num(from.y - tick)} L ${num(from.x)} ${num(from.y + tick)}`,
    `M ${num(from.x)} ${num(from.y)} L ${num(to.x)} ${num(to.y)}`,
    `M ${num(to.x)} ${num(to.y - tick)} L ${num(to.x)} ${num(to.y + tick)}`,
  ].join(' ')
}

/* ════════════════ Per-bar-mark glyphs ════════════════ */

export const LINK_BOX = 44
export const LINK_PAD = 2.5
export const LINK_A_BAND = 12
export const LINK_B_BAND = 29
export const LINK_DIM_GAP = 3.5
export const LINK_TICK = 3
export const LINK_HOOK = 9

/**
 * A straight bar drawn "to scale" would tell the reader nothing — a 1 m and a
 * 12 m bar are the same picture — and the cutting length already has its own
 * column. So this glyph is a fixed schematic that asserts no dimension.
 *
 * Deliberately no L-bend or hook: beam main bars with anchorage are modelled as
 * Straight (CL = span + 2·Ld), so drawing a bend would depict something the
 * formula does not model.
 */
export const STRAIGHT_GLYPH = {
  kind: 'straight' as const,
  viewW: 74,
  viewH: 26,
  paths: ['M 6 13 L 68 13', 'M 6 8 L 6 18', 'M 68 8 L 68 18'],
  indicative: false,
  title: 'Straight bar',
}

export type StraightGlyph = typeof STRAIGHT_GLYPH

export type RectLinkGlyph = {
  kind: 'rect-link'
  viewW: number
  viewH: number
  rect: Rect
  bodyPath: string
  hookPaths: [string, string]
  /** null on the indicative fallback, where a/b are genuinely unknown. */
  aDim: Dim | null
  bDim: Dim | null
  indicative: boolean
  title: string
}

/**
 * A closed rectangular link drawn to its true a:b aspect ratio, with both 135°
 * hook tails. The a/b internal dimensions appear nowhere else in the UI, so
 * this glyph carries genuinely new information rather than repeating a column.
 */
export function rectLinkGlyph(aMm: number, bMm: number, diaMm: number): RectLinkGlyph | null {
  if (!fin(aMm) || !fin(bMm) || aMm <= 0 || bMm <= 0) return null

  const scale = LINK_BOX / Math.max(aMm, bMm)
  const rw = aMm * scale
  const rh = bMm * scale
  const x0 = LINK_PAD
  const y0 = LINK_A_BAND
  const x1 = x0 + rw
  const y1 = y0 + rh

  // Hooks are annotation, never labelled, so scaling them down on a sliver of a
  // link is honest — unlike scaling a dimensioned edge would be.
  const m = Math.min(rw, rh)
  const hook = Math.min(LINK_HOOK, 0.42 * m)
  const gap = Math.min(3, 0.14 * m)
  const t = hook / Math.SQRT2

  // Open rectangle with a gap at the top-left corner; the two free ends kick
  // inward at 135°, which is the real closed-link-with-hooks form.
  const bodyPath =
    `M ${num(x0 + gap)} ${num(y0)} L ${num(x1)} ${num(y0)} L ${num(x1)} ${num(y1)} ` +
    `L ${num(x0)} ${num(y1)} L ${num(x0)} ${num(y0 + gap)}`
  const hookPaths: [string, string] = [
    `M ${num(x0 + gap)} ${num(y0)} L ${num(x0 + gap + t)} ${num(y0 + t)}`,
    `M ${num(x0)} ${num(y0 + gap)} L ${num(x0 + t)} ${num(y0 + gap + t)}`,
  ]

  const ya = y0 - LINK_DIM_GAP
  const aDim: Dim = {
    path: dimLine({ x: x0, y: ya }, { x: x1, y: ya }, LINK_TICK, false),
    tx: x0 + rw / 2,
    ty: ya - 2,
    anchor: 'middle',
    label: String(Math.round(aMm)),
  }

  const xb = x1 + LINK_DIM_GAP
  const bDim: Dim = {
    path: dimLine({ x: xb, y: y0 }, { x: xb, y: y1 }, LINK_TICK, true),
    tx: xb + LINK_TICK + 2,
    ty: (y0 + y1) / 2,
    anchor: 'start',
    label: String(Math.round(bMm)),
  }

  return {
    kind: 'rect-link',
    viewW: r2(x1 + LINK_B_BAND),
    viewH: r2(y1 + LINK_PAD),
    rect: { x: r2(x0), y: r2(y0), w: r2(rw), h: r2(rh) },
    bodyPath,
    hookPaths,
    aDim,
    bDim,
    indicative: false,
    title: `Rectangular closed link, ${Math.round(aMm)} × ${Math.round(bMm)} mm internal, ${diaMm} mm dia`,
  }
}

/**
 * Fallback for link rows with no stored geometry (saved before BarRow carried
 * it). We cannot recover a and b: 2(a+b) + 12d = CL is one equation in two
 * unknowns. So we draw the un-dimensioned form and mark it not-to-scale rather
 * than inventing plausible-looking numbers.
 */
export function indicativeLinkGlyph(): RectLinkGlyph {
  const g = rectLinkGlyph(100, 140, 8)!
  return {
    ...g,
    aDim: null,
    bDim: null,
    indicative: true,
    title: 'Rectangular closed link — internal dimensions unavailable, shown not to scale',
  }
}

export type RowGlyph = StraightGlyph | RectLinkGlyph

const LINK_SHAPES = new Set(['Rectangular closed stirrup', 'Rectangular closed tie'])

/** Picks the glyph for a row, degrading honestly when geometry is missing. */
export function rowGlyph(row: Pick<BarRow, 'shape' | 'geom'>): RowGlyph {
  if (row.geom?.kind === 'rect-link') {
    return rectLinkGlyph(row.geom.aMm, row.geom.bMm, row.geom.diaMm) ?? indicativeLinkGlyph()
  }
  if (!row.geom && LINK_SHAPES.has(row.shape)) return indicativeLinkGlyph()
  return STRAIGHT_GLYPH
}

/* ════════════════ Member section / plan figures ════════════════ */

export const SEC_PAD_L = 40
export const SEC_PAD_R = 12
export const SEC_PAD_T = 10
export const SEC_PAD_B = 26
export const SEC_MAX_W = 248
export const SEC_MAX_H = 210
export const SEC_TICK = 2.5
export const MIN_BAR_R = 1.2
export const MAX_LAYER_BARS = 24
export const MAX_MESH_LINES = 60

export type SectionDiagram = {
  variant: 'section'
  viewW: number
  viewH: number
  outer: Rect
  link: Rect
  bars: BarCircle[]
  dims: [Dim, Dim]
  scale: number
  /** false when a bar radius was clamped up to stay visible. */
  barsToScale: boolean
  /** true when the bars don't fit side by side in one layer. */
  barsOverlap: boolean
  barCountShown: number
  barCountTotal: number
  title: string
}

export type MeshDir = { lines: string[]; count: number; drawnAll: boolean }

export type MeshPlanDiagram = {
  variant: 'plan'
  viewW: number
  viewH: number
  panel: Rect
  dir1: MeshDir
  dir2: MeshDir
  dims: [Dim, Dim]
  scale: number
  title: string
}

export type MemberDiagram = SectionDiagram | MeshPlanDiagram

function frameDims(box: Rect): [Dim, Dim] {
  const yw = box.y + box.h + 13
  const widthDim: Dim = {
    path: dimLine({ x: box.x, y: yw }, { x: box.x + box.w, y: yw }, SEC_TICK, false),
    tx: box.x + box.w / 2,
    ty: yw + 10,
    anchor: 'middle',
    label: '',
  }
  const xd = box.x - 14
  const depthDim: Dim = {
    path: dimLine({ x: xd, y: box.y }, { x: xd, y: box.y + box.h }, SEC_TICK, true),
    tx: xd - 4,
    ty: box.y + box.h / 2,
    anchor: 'end',
    label: '',
  }
  return [widthDim, depthDim]
}

/** Evenly spaces n bar centres across a link's inner width, tangent at the ends. */
export function spreadAcross(link: Rect, n: number, r: number): number[] {
  if (n <= 0) return []
  if (n === 1) return [link.x + link.w / 2]
  const step = (link.w - 2 * r) / (n - 1)
  return Array.from({ length: n }, (_, i) => link.x + r + i * step)
}

type SectionCore = {
  scale: number
  outer: Rect
  link: Rect
  viewW: number
  viewH: number
  dims: [Dim, Dim]
}

function sectionCore(wMm: number, dMm: number, coverMm: number): SectionCore | null {
  if (!fin(wMm) || !fin(dMm) || !fin(coverMm)) return null
  if (wMm <= 0 || dMm <= 0) return null
  if (wMm - 2 * coverMm <= 0 || dMm - 2 * coverMm <= 0) return null

  const scale = fitScale(wMm, dMm, SEC_MAX_W, SEC_MAX_H)
  if (scale <= 0) return null

  const outer: Rect = { x: SEC_PAD_L, y: SEC_PAD_T, w: wMm * scale, h: dMm * scale }
  // The link is drawn as a zero-thickness outline with bars tangent to it:
  // stirrupCuttingLengthMm ignores the link bar's own thickness in the cover
  // offset, so giving it thickness here would depict what the number doesn't.
  const link: Rect = {
    x: outer.x + coverMm * scale,
    y: outer.y + coverMm * scale,
    w: (wMm - 2 * coverMm) * scale,
    h: (dMm - 2 * coverMm) * scale,
  }
  const dims = frameDims(outer)
  dims[0].label = String(Math.round(wMm))
  dims[1].label = String(Math.round(dMm))

  return {
    scale,
    outer,
    link,
    viewW: r2(SEC_PAD_L + outer.w + SEC_PAD_R),
    viewH: r2(SEC_PAD_T + outer.h + SEC_PAD_B),
    dims,
  }
}

export function beamSectionDiagram(i: BeamInputs): SectionDiagram | null {
  const core = sectionCore(i.widthMm, i.depthMm, i.coverMm)
  if (!core) return null
  const { scale, link } = core

  const botTotal = safeInt(i.botCount)
  const topTotal = safeInt(i.topCount)
  const botN = Math.min(botTotal, MAX_LAYER_BARS)
  const topN = Math.min(topTotal, MAX_LAYER_BARS)

  const trueBotR = (i.botDiaMm / 2) * scale
  const trueTopR = (i.topDiaMm / 2) * scale
  const botR = safeRadius(i.botDiaMm, scale)
  const topR = safeRadius(i.topDiaMm, scale)

  const bars: BarCircle[] = [
    ...spreadAcross(link, botN, botR).map((cx) => ({ cx: r2(cx), cy: r2(link.y + link.h - botR), r: r2(botR) })),
    ...spreadAcross(link, topN, topR).map((cx) => ({ cx: r2(cx), cy: r2(link.y + topR), r: r2(topR) })),
  ]

  // Don't fabricate a second layer — the tool never computed one. Overlapping
  // circles plus a caption is honest feedback that the section is too narrow.
  const overlaps = (n: number, r: number) => n > 1 && (link.w - 2 * r) / (n - 1) < 2 * r

  return {
    variant: 'section',
    viewW: core.viewW,
    viewH: core.viewH,
    outer: core.outer,
    link,
    bars,
    dims: core.dims,
    scale,
    barsToScale: (botN === 0 || (fin(trueBotR) && trueBotR >= MIN_BAR_R)) && (topN === 0 || (fin(trueTopR) && trueTopR >= MIN_BAR_R)),
    barsOverlap: overlaps(botN, botR) || overlaps(topN, topR),
    barCountShown: botN + topN,
    barCountTotal: botTotal + topTotal,
    title: `Beam section ${Math.round(i.widthMm)} × ${Math.round(i.depthMm)} mm, ${Math.round(i.coverMm)} mm cover, ${botTotal} bottom and ${topTotal} top bars`,
  }
}

/** Corners first, then remaining bars spread along faces by largest remainder. */
export function distributeAlongFaces(link: Rect, n: number, r: number): BarCircle[] {
  if (n <= 0) return []
  if (n === 1) return [{ cx: link.x + link.w / 2, cy: link.y + link.h / 2, r }]

  const x0 = link.x + r
  const x1 = link.x + link.w - r
  const y0 = link.y + r
  const y1 = link.y + link.h - r

  const corners: BarCircle[] = [
    { cx: x0, cy: y0, r },
    { cx: x1, cy: y0, r },
    { cx: x1, cy: y1, r },
    { cx: x0, cy: y1, r },
  ].slice(0, Math.min(n, 4))

  const rem = n - 4
  if (rem <= 0) return corners

  const hLen = Math.max(0, x1 - x0)
  const vLen = Math.max(0, y1 - y0)
  const faces = [
    { key: 'top' as const, len: hLen },
    { key: 'bottom' as const, len: hLen },
    { key: 'left' as const, len: vLen },
    { key: 'right' as const, len: vLen },
  ]
  const total = faces.reduce((s, f) => s + f.len, 0)

  let alloc: number[]
  if (total <= 0) {
    alloc = [rem, 0, 0, 0]
  } else {
    const raw = faces.map((f) => (rem * f.len) / total)
    alloc = raw.map((v) => Math.floor(v))
    let left = rem - alloc.reduce((s, v) => s + v, 0)
    const order = raw
      .map((v, idx) => ({ idx, frac: v - Math.floor(v) }))
      .sort((p, q) => q.frac - p.frac || p.idx - q.idx)
    for (let k = 0; left > 0; k++, left--) alloc[order[k % order.length].idx]++
  }

  const extras: BarCircle[] = []
  faces.forEach((f, idx) => {
    const k = alloc[idx]
    for (let j = 1; j <= k; j++) {
      const frac = (j * f.len) / (k + 1)
      if (f.key === 'top') extras.push({ cx: x0 + frac, cy: y0, r })
      else if (f.key === 'bottom') extras.push({ cx: x0 + frac, cy: y1, r })
      else if (f.key === 'left') extras.push({ cx: x0, cy: y0 + frac, r })
      else extras.push({ cx: x1, cy: y0 + frac, r })
    }
  })

  return [...corners, ...extras]
}

export function columnSectionDiagram(i: ColumnInputs): SectionDiagram | null {
  const core = sectionCore(i.widthMm, i.depthMm, i.coverMm)
  if (!core) return null
  const { scale, link } = core

  const total = safeInt(i.mainCount)
  const shown = Math.min(total, MAX_LAYER_BARS * 2)
  const trueR = (i.mainDiaMm / 2) * scale
  const r = safeRadius(i.mainDiaMm, scale)

  const bars = distributeAlongFaces(link, shown, r).map((b) => ({ cx: r2(b.cx), cy: r2(b.cy), r: r2(b.r) }))

  const perFaceMax = Math.max(1, Math.ceil(shown / 4))
  const barsOverlap = shown > 4 && Math.min(link.w, link.h) - 2 * r < 2 * r * perFaceMax

  return {
    variant: 'section',
    viewW: core.viewW,
    viewH: core.viewH,
    outer: core.outer,
    link,
    bars,
    dims: core.dims,
    scale,
    barsToScale: shown === 0 || (fin(trueR) && trueR >= MIN_BAR_R),
    barsOverlap,
    barCountShown: shown,
    barCountTotal: total,
    title: `Column section ${Math.round(i.widthMm)} × ${Math.round(i.depthMm)} mm, ${Math.round(i.coverMm)} mm cover, ${total} main bars`,
  }
}

type MeshDirInput = {
  /** Bars are laid out at 0, s, 2s… from the panel edge — literally what barCount() means. */
  count: number
  spacingMm: number
  /** How far each bar is pulled in at both ends, i.e. its own cutting length. */
  extentInsetMm: number
}

function meshLines(
  panel: Rect,
  scale: number,
  d: MeshDirInput,
  alongX: boolean,
): MeshDir {
  const count = fin(d.count) ? Math.max(0, Math.round(d.count)) : 0
  if (count === 0 || !fin(d.spacingMm) || d.spacingMm <= 0) {
    return { lines: [], count: 0, drawnAll: true }
  }

  const runLen = alongX ? panel.w : panel.h
  // A non-finite cover must not leak into the path — Math.max(0, NaN) is NaN.
  const insetMm = fin(d.extentInsetMm) ? Math.max(0, d.extentInsetMm) : 0
  const inset = Math.max(0, Math.min(insetMm * scale, runLen / 2 - 0.5))
  const from = (alongX ? panel.x : panel.y) + inset
  const to = (alongX ? panel.x + panel.w : panel.y + panel.h) - inset

  // Past the density cap, show the true first and last three rather than
  // resampling — resampling would misrepresent the spacing.
  const drawnAll = count <= MAX_MESH_LINES
  const indices = drawnAll
    ? Array.from({ length: count }, (_, k) => k)
    : [0, 1, 2, count - 3, count - 2, count - 1]

  const lines = indices.map((k) => {
    const off = k * d.spacingMm * scale
    if (alongX) {
      const y = panel.y + off
      return `M ${num(from)} ${num(y)} L ${num(to)} ${num(y)}`
    }
    const x = panel.x + off
    return `M ${num(x)} ${num(from)} L ${num(x)} ${num(to)}`
  })

  return { lines, count, drawnAll }
}

export function meshPlanDiagram(input: {
  panelWmm: number
  panelHmm: number
  /** Runs along x, spaced along y. */
  dir1: MeshDirInput
  /** Runs along y, spaced along x. */
  dir2: MeshDirInput
  title: string
}): MeshPlanDiagram | null {
  const { panelWmm, panelHmm } = input
  if (!fin(panelWmm) || !fin(panelHmm) || panelWmm <= 0 || panelHmm <= 0) return null

  const scale = fitScale(panelWmm, panelHmm, SEC_MAX_W, SEC_MAX_H)
  if (scale <= 0) return null

  const panel: Rect = { x: SEC_PAD_L, y: SEC_PAD_T, w: panelWmm * scale, h: panelHmm * scale }
  const dims = frameDims(panel)
  dims[0].label = String(Math.round(panelWmm))
  dims[1].label = String(Math.round(panelHmm))

  return {
    variant: 'plan',
    viewW: r2(SEC_PAD_L + panel.w + SEC_PAD_R),
    viewH: r2(SEC_PAD_T + panel.h + SEC_PAD_B),
    panel,
    dir1: meshLines(panel, scale, input.dir1, true),
    dir2: meshLines(panel, scale, input.dir2, false),
    dims,
    scale,
    title: input.title,
  }
}

export function slabPlanDiagram(i: SlabInputs): MeshPlanDiagram | null {
  // Short span on x, long span on y — matching computeSlab, where main bars run
  // the short span (CL = shortSpan + 2·Ld, so they overrun the panel: no inset)
  // and are counted across the long span.
  return meshPlanDiagram({
    panelWmm: i.shortSpanMm,
    panelHmm: i.longSpanMm,
    dir1: {
      count: barCount(i.longSpanMm, i.mainSpacingMm),
      spacingMm: i.mainSpacingMm,
      extentInsetMm: 0,
    },
    dir2: {
      count: barCount(i.shortSpanMm, i.distSpacingMm),
      spacingMm: i.distSpacingMm,
      extentInsetMm: i.coverMm,
    },
    title: `Slab plan ${Math.round(i.shortSpanMm)} × ${Math.round(i.longSpanMm)} mm, main bars at ${Math.round(i.mainSpacingMm)} mm and distribution bars at ${Math.round(i.distSpacingMm)} mm centres`,
  })
}

export function footingPlanDiagram(i: FootingInputs): MeshPlanDiagram | null {
  return meshPlanDiagram({
    panelWmm: i.lengthMm,
    panelHmm: i.widthMm,
    dir1: {
      count: barCount(i.widthMm, i.dir1SpacingMm),
      spacingMm: i.dir1SpacingMm,
      extentInsetMm: i.coverMm,
    },
    dir2: {
      count: barCount(i.lengthMm, i.dir2SpacingMm),
      spacingMm: i.dir2SpacingMm,
      extentInsetMm: i.coverMm,
    },
    title: `Footing plan ${Math.round(i.lengthMm)} × ${Math.round(i.widthMm)} mm mesh, bars at ${Math.round(i.dir1SpacingMm)} and ${Math.round(i.dir2SpacingMm)} mm centres`,
  })
}
