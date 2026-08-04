/**
 * Bar Bending Schedule (BBS) geometry — quantity/weight calculations only.
 * Standard SP-34:1987 / IS 2502 conventions. This does NOT derive development
 * or lap length from bond stress / concrete-steel grade (IS 456 Table 26) —
 * that's a structural design decision, so it's exposed as an editable "×dia"
 * factor instead of computed here.
 */

/** Unit weight of a bar = dia(mm)² / 162, in kg per running metre. */
export const UNIT_WEIGHT_DIVISOR = 162
/** Extra length added per 135° hook (stirrups/ties), in multiples of dia. */
export const HOOK_135_ALLOWANCE_D = 9
/** Length deducted per 90° corner bend, in multiples of dia. */
export const BEND_90_DEDUCTION_D = 2

export function unitWeightKgPerM(diaMm: number): number {
  return (diaMm * diaMm) / UNIT_WEIGHT_DIVISOR
}

/**
 * Cutting length of a closed rectangular stirrup/tie.
 * a, b = clear internal dimensions of the link (member width/depth − 2×cover).
 * = 2(a+b) + 2×(9d) − 3×(2d), i.e. two 135° hooks minus the three effective
 * 90° corner bends in a closed rectangular link.
 */
export function stirrupCuttingLengthMm(aMm: number, bMm: number, diaMm: number): number {
  return 2 * (aMm + bMm) + 2 * (HOOK_135_ALLOWANCE_D * diaMm) - 3 * (BEND_90_DEDUCTION_D * diaMm)
}

export function barCount(spanMm: number, spacingMm: number): number {
  if (spacingMm <= 0 || spanMm <= 0) return 0
  return Math.floor(spanMm / spacingMm) + 1
}

const fin = (n: number) => Number.isFinite(n)

/** Bar diameters a drawing will realistically call up (IS 1786). */
export const STANDARD_DIAMETERS_MM = [6, 8, 10, 12, 16, 20, 25, 32, 40] as const

/**
 * One diameter within a bar group. Drawings routinely mix them in a single
 * layer — "2-20Ø + 1-16Ø" is [{20,2},{16,1}].
 */
export type BarSpec = { diaMm: number; count: number }

/**
 * Drops unusable entries, MERGES duplicate diameters (so "2-20Ø + 1-20Ø"
 * tabulates as one 3-20Ø row rather than two), and sorts largest-first the way
 * drawings write them.
 */
export function normalizeBarSpecs(specs: BarSpec[] | undefined): BarSpec[] {
  const merged = new Map<number, number>()
  for (const s of specs ?? []) {
    if (!s || !fin(s.diaMm) || !fin(s.count)) continue
    if (s.diaMm <= 0 || s.count <= 0) continue
    merged.set(s.diaMm, (merged.get(s.diaMm) ?? 0) + Math.round(s.count))
  }
  return Array.from(merged, ([diaMm, count]) => ({ diaMm, count })).sort((a, b) => b.diaMm - a.diaMm)
}

export function totalBarCount(specs: BarSpec[] | undefined): number {
  return normalizeBarSpecs(specs).reduce((s, x) => s + x.count, 0)
}

/** A stated run of one spacing, measured inward from a support. */
export type SpacingZone = { lengthMm: number; spacingMm: number }

export type PlannedZone = SpacingZone & { count: number; kind: 'end' | 'middle' }
export type ZonePlan = {
  /** Full left-to-right sequence, mirrored about mid-span — drives the elevation. */
  zones: PlannedZone[]
  totalCount: number
  middleLengthMm: number
  /** Stated end zones didn't fit the span — a transcription error, not a design one. */
  overrun: boolean
}

/**
 * Counts stirrups/ties across a span with tightened end zones.
 *
 * Each zone contributes its INTERVALS (floor(len/spacing)); one closing bar is
 * added for the whole span. Adjacent zones therefore share the bar on their
 * boundary, which is what actually gets tied on site — counting each zone with
 * barCount() would double it.
 *
 * With no end zones this reduces exactly to barCount(span, spacing).
 */
export function planStirrupZones(
  spanMm: number,
  endZones: SpacingZone[] | undefined,
  middleSpacingMm: number,
): ZonePlan {
  const empty: ZonePlan = { zones: [], totalCount: 0, middleLengthMm: 0, overrun: false }
  if (!fin(spanMm) || spanMm <= 0) return empty

  const stated = (endZones ?? []).filter((z) => z && fin(z.lengthMm) && z.lengthMm > 0)
  const statedTotal = stated.reduce((s, z) => s + z.lengthMm, 0)
  // Stated zones are per end, so both ends together must fit inside the span.
  let overrun = 2 * statedTotal > spanMm

  // Clamp rather than let a mis-typed length produce negative geometry. The
  // matching error issue is what actually blocks saving.
  const used: SpacingZone[] = []
  let room = spanMm / 2
  for (const z of stated) {
    if (room <= 0) break
    used.push({ lengthMm: Math.min(z.lengthMm, room), spacingMm: z.spacingMm })
    room -= z.lengthMm
  }

  const endTotal = used.reduce((s, z) => s + z.lengthMm, 0)
  const middleLengthMm = Math.max(0, spanMm - 2 * endTotal)

  // +1e-6 guards the float case: 914.4 / 101.6 is 8.999999999999998, and a
  // 3'-0" zone at 4" c/c must count 9 intervals, not 8.
  const intervals = (len: number, s: number) =>
    fin(len) && fin(s) && len > 0 && s > 0 ? Math.floor(len / s + 1e-6) : 0

  const left: PlannedZone[] = used.map((z) => ({ ...z, count: intervals(z.lengthMm, z.spacingMm), kind: 'end' }))
  const mid: PlannedZone[] = middleLengthMm > 0
    ? [{ lengthMm: middleLengthMm, spacingMm: middleSpacingMm, count: intervals(middleLengthMm, middleSpacingMm), kind: 'middle' }]
    : []
  const zones = [...left, ...mid, ...[...left].reverse()]
  const totalCount = zones.reduce((s, z) => s + z.count, 0) + 1

  return { zones, totalCount, middleLengthMm, overrun }
}

/** Human summary of a zone plan, appended to a stirrup/tie row description. */
export function describeZones(plan: ZonePlan, base: string, diaMm: number): string {
  const ends = plan.zones.filter((z) => z.kind === 'end')
  if (ends.length === 0) return base
  const half = ends.slice(0, ends.length / 2 || 1)
  const parts = half.map((z) => `@ ${Math.round(z.spacingMm)} c/c over ${Math.round(z.lengthMm)}`)
  const mid = plan.zones.find((z) => z.kind === 'middle')
  const tail = mid ? `, @ ${Math.round(mid.spacingMm)} elsewhere` : ''
  return `${base} — ${diaMm}Ø ${parts.join(' then ')} at each end${tail}`
}

/**
 * Row-mark prefix taken from the member's own label, so a schedule transcribed
 * from drawing beam "B7" produces B7-1, B7-2 … instead of generic B1/B2/B3
 * that collide with the drawing's own beam marks.
 */
export function deriveMarkPrefix(label: string, fallback: string): string {
  const clean = (label ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  return clean || fallback
}

/** A validation finding. Errors block saving; checks only warn. */
export type Issue = { level: 'error' | 'check'; message: string }

export type BarShape = 'Straight' | 'Rectangular closed stirrup' | 'Rectangular closed tie' | 'Straight (mesh)'

/**
 * Shape geometry needed to draw a bar to scale. `aMm`/`bMm` are the same
 * internal link dimensions fed to stirrupCuttingLengthMm, so a drawing and the
 * cutting length beside it can never disagree.
 *
 * Optional on BarRow by design: results deserialised from localStorage before
 * this field existed must still typecheck and render.
 */
export type BarGeometry =
  | { kind: 'straight'; lengthMm: number }
  | { kind: 'rect-link'; aMm: number; bMm: number; diaMm: number }

export type BarRow = {
  mark: string
  desc: string
  diaMm: number
  shape: BarShape
  cuttingLengthMm: number
  nos: number
  totalLengthM: number
  unitWtKgM: number
  totalWtKg: number
  geom?: BarGeometry
}

export type BbsResult = {
  rows: BarRow[]
  totalKg: number
  totalTonnes: number
}

function buildRow(
  mark: string,
  desc: string,
  diaMm: number,
  shape: BarShape,
  cuttingLengthMm: number,
  nos: number,
  geom?: BarGeometry,
): BarRow {
  const cl = Math.max(0, cuttingLengthMm)
  const n = Math.max(0, nos)
  const unitWtKgM = unitWeightKgPerM(diaMm)
  const totalLengthM = (cl * n) / 1000
  const totalWtKg = totalLengthM * unitWtKgM
  return { mark, desc, diaMm, shape, cuttingLengthMm: cl, nos: n, totalLengthM, unitWtKgM, totalWtKg, ...(geom ? { geom } : {}) }
}

function summarize(rows: BarRow[]): BbsResult {
  const totalKg = rows.reduce((sum, r) => sum + r.totalWtKg, 0)
  return { rows, totalKg, totalTonnes: totalKg / 1000 }
}

export type BeamInputs = {
  clearSpanMm: number
  widthMm: number
  depthMm: number
  coverMm: number
  botBars: BarSpec[]
  topBars: BarSpec[]
  /** Curtailed bars sitting over the supports, with the length the drawing states. */
  extraTopBars?: BarSpec[]
  extraTopLengthMm?: number
  /** Default true — a single span has a support at each end. */
  extraTopBothEnds?: boolean
  /** Side-face reinforcement on deep beams. */
  faceBars?: BarSpec[]
  /** Default true — "on each face" doubles the count. */
  faceEachFace?: boolean
  stirDiaMm: number
  /** Spacing in the middle / remainder of the span. */
  stirSpacingMm: number
  /** Tightened runs measured inward from each support; [] = uniform spacing. */
  stirEndZones?: SpacingZone[]
  anchorIntoSupport: boolean
  ldFactor: number
  nos: number
  /** Absent reproduces the original B1/B2/B3 marks. */
  markPrefix?: string
}

/** Sequential row marks, prefixed by the member label when one is supplied. */
function marker(prefix: string | undefined, legacy: string) {
  let n = 0
  return () => (prefix ? `${prefix}-${++n}` : `${legacy}${++n}`)
}

export function computeBeam(i: BeamInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const mark = marker(i.markPrefix, 'B')
  const rows: BarRow[] = []
  // Anchorage is added per diameter — a 20Ø and a 16Ø in the same group
  // genuinely get different development lengths.
  const anchorAddMm = (diaMm: number) => (i.anchorIntoSupport ? 2 * i.ldFactor * diaMm : 0)

  for (const s of normalizeBarSpecs(i.botBars)) {
    const cl = i.clearSpanMm + anchorAddMm(s.diaMm)
    rows.push(buildRow(mark(), 'Bottom main bars', s.diaMm, 'Straight', cl, s.count * nos, { kind: 'straight', lengthMm: cl }))
  }
  for (const s of normalizeBarSpecs(i.topBars)) {
    const cl = i.clearSpanMm + anchorAddMm(s.diaMm)
    rows.push(buildRow(mark(), 'Top main bars', s.diaMm, 'Straight', cl, s.count * nos, { kind: 'straight', lengthMm: cl }))
  }

  // Curtailed over-support bars: the drawing states their length, so this is
  // transcription, not a curtailment calculation.
  const xLen = i.extraTopLengthMm ?? 0
  if (xLen > 0) {
    const ends = i.extraTopBothEnds === false ? 1 : 2
    for (const sp of normalizeBarSpecs(i.extraTopBars)) {
      rows.push(buildRow(mark(), 'Extra top bars over supports', sp.diaMm, 'Straight', xLen, sp.count * ends * nos, { kind: 'straight', lengthMm: xLen }))
    }
  }

  for (const sp of normalizeBarSpecs(i.faceBars)) {
    const cl = i.clearSpanMm + anchorAddMm(sp.diaMm)
    const faces = i.faceEachFace === false ? 1 : 2
    rows.push(buildRow(mark(), 'Side face bars', sp.diaMm, 'Straight', cl, sp.count * faces * nos, { kind: 'straight', lengthMm: cl }))
  }

  const a = i.widthMm - 2 * i.coverMm
  const b = i.depthMm - 2 * i.coverMm
  const stirCL = stirrupCuttingLengthMm(a, b, i.stirDiaMm)
  const plan = planStirrupZones(i.clearSpanMm, i.stirEndZones, i.stirSpacingMm)
  // One row: every stirrup is an identical bar of one cutting length, which is
  // what a bar-bender is handed. The zoning lives in the description.
  rows.push(buildRow(
    mark(), describeZones(plan, 'Stirrups', i.stirDiaMm), i.stirDiaMm,
    'Rectangular closed stirrup', stirCL, plan.totalCount * nos,
    { kind: 'rect-link', aMm: a, bMm: b, diaMm: i.stirDiaMm },
  ))

  return summarize(rows)
}

/**
 * Flags physically-impossible geometry (not soft advisory nitpicks) — e.g. a
 * clear cover large enough that a stirrup's internal dimension goes negative,
 * which would make the calculated cutting length/weight meaningless rather
 * than just imprecise.
 */
/** Shared plausibility checks — never blocking, only "look at this". */
function commonChecks(o: {
  dims: number[]
  coverMm: number
  diameters: number[]
  nos: number
  factor?: number
}): Issue[] {
  const c: Issue[] = []
  const check = (message: string) => c.push({ level: 'check', message })
  const smallest = Math.min(...o.dims.filter((d) => d > 0))
  if (fin(smallest) && o.coverMm >= smallest / 4) {
    check(`Clear cover ${Math.round(o.coverMm)} mm is over a quarter of the ${Math.round(smallest)} mm section — cover is always in mm, even when sizes are in inches.`)
  }
  if (o.coverMm > 0 && ![20, 25, 30, 40, 50, 75].includes(Math.round(o.coverMm))) {
    check(`Clear cover ${Math.round(o.coverMm)} mm is not a standard value (20, 25, 30, 40, 50, 75 mm).`)
  }
  for (const d of o.diameters) {
    if (d > 0 && !(STANDARD_DIAMETERS_MM as readonly number[]).includes(d)) {
      check(`${d} mm is not a standard bar diameter — check for a typo.`)
    }
  }
  for (const d of o.dims) {
    if (d > 0 && d < 75) check(`A section dimension of ${Math.round(d)} mm looks too small — was a value in inches entered as millimetres?`)
    if (d > 2000) check(`A section dimension of ${Math.round(d)} mm looks too large — check the units.`)
  }
  if (o.nos < 1) check('Number of identical members is less than 1.')
  if (o.factor !== undefined && o.factor > 0 && (o.factor < 30 || o.factor > 70)) {
    check(`A ×${o.factor} development/lap factor is outside the usual 30–70 range.`)
  }
  return c
}

/** Flags a span/height that reads like a feet value typed into a millimetre field. */
function spanChecks(lengthMm: number, label: string): Issue[] {
  const c: Issue[] = []
  if (lengthMm > 20000) c.push({ level: 'check', message: `${label} ${Math.round(lengthMm).toLocaleString('en-IN')} mm (${(lengthMm / 304.8).toFixed(1)}′) looks unusually long — was a feet value entered where millimetres were meant?` })
  else if (lengthMm > 0 && lengthMm < 300) c.push({ level: 'check', message: `${label} ${Math.round(lengthMm)} mm looks unusually short — check the units.` })
  return c
}

function barGroupIssues(specs: BarSpec[] | undefined, label: string): Issue[] {
  const c: Issue[] = []
  for (const s of specs ?? []) {
    if (!s) continue
    const hasDia = fin(s.diaMm) && s.diaMm > 0
    const hasCount = fin(s.count) && s.count > 0
    if (hasDia !== hasCount) c.push({ level: 'error', message: `A ${label} row is half filled in — enter both a diameter and a count, or remove the row.` })
  }
  return c
}

function zoneIssues(spanMm: number, zones: SpacingZone[] | undefined, label: string): Issue[] {
  const c: Issue[] = []
  const stated = (zones ?? []).filter((z) => z && fin(z.lengthMm) && z.lengthMm > 0)
  for (const z of stated) {
    if (!fin(z.spacingMm) || z.spacingMm <= 0) {
      c.push({ level: 'error', message: `A ${label} zone has a length but no spacing.` })
    }
  }
  const total = stated.reduce((s, z) => s + z.lengthMm, 0)
  if (spanMm > 0 && 2 * total > spanMm) {
    c.push({
      level: 'error',
      message: `${label} zone lengths (2 × ${Math.round(total).toLocaleString('en-IN')} mm) exceed the span (${Math.round(spanMm).toLocaleString('en-IN')} mm).`,
    })
  }
  return c
}

export function issuesForBeam(i: BeamInputs): Issue[] {
  const out: Issue[] = []
  const e = (message: string) => out.push({ level: 'error', message })
  if (i.clearSpanMm <= 0) e('Clear span must be greater than 0.')
  if (i.widthMm - 2 * i.coverMm <= 0) e('Clear cover is too large for the beam width — stirrup dimensions would be zero or negative.')
  if (i.depthMm - 2 * i.coverMm <= 0) e('Clear cover is too large for the beam depth — stirrup dimensions would be zero or negative.')
  if (totalBarCount(i.botBars) <= 0 && totalBarCount(i.topBars) <= 0) e('Enter at least one bottom or top bar.')
  if (i.stirSpacingMm <= 0) e('Stirrup spacing must be greater than 0.')
  out.push(...barGroupIssues(i.botBars, 'bottom bar'), ...barGroupIssues(i.topBars, 'top bar'))
  out.push(...barGroupIssues(i.extraTopBars, 'extra top bar'), ...barGroupIssues(i.faceBars, 'face bar'))
  if (totalBarCount(i.extraTopBars) > 0 && (i.extraTopLengthMm ?? 0) <= 0) {
    e('Extra top bars need the length the drawing states over the support.')
  }
  if ((i.extraTopLengthMm ?? 0) > i.clearSpanMm && i.clearSpanMm > 0) {
    out.push({ level: 'check', message: 'Extra top bars are longer than the span — check the stated length.' })
  }
  out.push(...zoneIssues(i.clearSpanMm, i.stirEndZones, 'Stirrup'))

  out.push(...spanChecks(i.clearSpanMm, 'Clear span'))
  if (i.stirSpacingMm > 0 && i.clearSpanMm > 0 && i.stirSpacingMm >= i.clearSpanMm) {
    out.push({ level: 'check', message: 'Stirrup spacing is larger than the span — only one stirrup will be counted.' })
  }
  const mainDias = [...normalizeBarSpecs(i.botBars), ...normalizeBarSpecs(i.topBars)].map((s) => s.diaMm)
  if (mainDias.length > 0 && i.stirDiaMm > Math.min(...mainDias)) {
    out.push({ level: 'check', message: 'Stirrup diameter is larger than the smallest main bar — are the fields swapped?' })
  }
  out.push(...commonChecks({
    dims: [i.widthMm, i.depthMm], coverMm: i.coverMm,
    diameters: [...mainDias, i.stirDiaMm], nos: i.nos, factor: i.anchorIntoSupport ? i.ldFactor : undefined,
  }))
  return out
}

const errorsOf = (issues: Issue[]) => issues.filter((x) => x.level === 'error').map((x) => x.message)

export function validateBeamInputs(i: BeamInputs): string[] {
  return errorsOf(issuesForBeam(i))
}

/**
 * One storey of a column mark. A real column schedule varies the main
 * reinforcement per level while keeping one tie arrangement for the whole
 * mark, which is exactly what these drawings show.
 */
export type ColumnLift = { label: string; heightMm: number; mainBars: BarSpec[] }

export type ColumnInputs = {
  clearHeightMm: number
  widthMm: number
  depthMm: number
  coverMm: number
  mainBars: BarSpec[]
  /** When present, replaces mainBars/clearHeightMm — one entry per storey. */
  lifts?: ColumnLift[]
  tieDiaMm: number
  /** Spacing in the middle / remainder of the lift. */
  tieSpacingMm: number
  /** Tightened runs measured inward from each end (ductile/lap zones); [] = uniform. */
  tieEndZones?: SpacingZone[]
  /** Inner / cross tie. Its size is stated on the drawing, never inferred from
   *  the bar arrangement — which this tool deliberately never asks for. */
  innerTieDiaMm?: number
  innerTieAMm?: number
  innerTieBMm?: number
  lapToNextLift: boolean
  lapFactor: number
  nos: number
  markPrefix?: string
}

/** The storeys to tabulate: the explicit lift list, else the single lift. */
function columnLifts(i: ColumnInputs): ColumnLift[] {
  const listed = (i.lifts ?? []).filter((l) => l && fin(l.heightMm) && l.heightMm > 0 && totalBarCount(l.mainBars) > 0)
  if (listed.length > 0) return listed
  return [{ label: '', heightMm: i.clearHeightMm, mainBars: i.mainBars }]
}

export function computeColumn(i: ColumnInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const mark = marker(i.markPrefix, 'C')
  const rows: BarRow[] = []
  const lifts = columnLifts(i)

  for (const lift of lifts) {
    const suffix = lift.label ? ` (${lift.label})` : ''
    for (const s of normalizeBarSpecs(lift.mainBars)) {
      const cl = lift.heightMm + (i.lapToNextLift ? i.lapFactor * s.diaMm : 0)
      rows.push(buildRow(mark(), `Main vertical bars${suffix}`, s.diaMm, 'Straight', cl, s.count * nos, { kind: 'straight', lengthMm: cl }))
    }
  }

  const a = i.widthMm - 2 * i.coverMm
  const b = i.depthMm - 2 * i.coverMm
  // One tie arrangement serves every lift, so the counts simply add up.
  const plans = lifts.map((l) => planStirrupZones(l.heightMm, i.tieEndZones, i.tieSpacingMm))
  const tieCount = plans.reduce((sum, p) => sum + p.totalCount, 0)
  const tieCL = stirrupCuttingLengthMm(a, b, i.tieDiaMm)
  rows.push(buildRow(
    mark(), describeZones(plans[0], 'Ties', i.tieDiaMm), i.tieDiaMm,
    'Rectangular closed tie', tieCL, tieCount * nos,
    { kind: 'rect-link', aMm: a, bMm: b, diaMm: i.tieDiaMm },
  ))

  const innerDia = i.innerTieDiaMm ?? 0
  const innerA = i.innerTieAMm ?? 0
  const innerB = i.innerTieBMm ?? 0
  if (innerDia > 0 && innerA > 0 && innerB > 0) {
    rows.push(buildRow(
      mark(), 'Inner ties', innerDia, 'Rectangular closed tie',
      stirrupCuttingLengthMm(innerA, innerB, innerDia), tieCount * nos,
      { kind: 'rect-link', aMm: innerA, bMm: innerB, diaMm: innerDia },
    ))
  }

  return summarize(rows)
}

export function issuesForColumn(i: ColumnInputs): Issue[] {
  const out: Issue[] = []
  const e = (message: string) => out.push({ level: 'error', message })
  if (i.clearHeightMm <= 0) e('Clear height must be greater than 0.')
  if (i.widthMm - 2 * i.coverMm <= 0) e('Clear cover is too large for the column width — tie dimensions would be zero or negative.')
  if (i.depthMm - 2 * i.coverMm <= 0) e('Clear cover is too large for the column depth — tie dimensions would be zero or negative.')
  const anyLiftBars = (i.lifts ?? []).some((l) => totalBarCount(l.mainBars) > 0)
  if (totalBarCount(i.mainBars) <= 0 && !anyLiftBars) e('Enter at least one main bar.')
  if (i.tieSpacingMm <= 0) e('Tie spacing must be greater than 0.')
  out.push(...barGroupIssues(i.mainBars, 'main bar'))
  for (const l of i.lifts ?? []) out.push(...barGroupIssues(l.mainBars, `lift "${l.label || '?'}" main bar`))
  out.push(...zoneIssues(i.clearHeightMm, i.tieEndZones, 'Tie'))
  const innerSet = [i.innerTieDiaMm ?? 0, i.innerTieAMm ?? 0, i.innerTieBMm ?? 0]
  if (innerSet.some((v) => v > 0) && innerSet.some((v) => v <= 0)) {
    e('Inner ties need a diameter and both internal dimensions, or leave all three empty.')
  }
  if ((i.innerTieAMm ?? 0) > i.widthMm - 2 * i.coverMm + 1) {
    out.push({ level: 'check', message: 'Inner tie is wider than the outer tie — check the stated internal dimensions.' })
  }

  out.push(...spanChecks(i.clearHeightMm, 'Clear height'))
  if (i.tieSpacingMm > 0 && i.clearHeightMm > 0 && i.tieSpacingMm >= i.clearHeightMm) {
    out.push({ level: 'check', message: 'Tie spacing is larger than the lift height — only one tie will be counted.' })
  }
  const mainDias = normalizeBarSpecs(i.mainBars).map((s) => s.diaMm)
  if (mainDias.length > 0 && i.tieDiaMm > Math.min(...mainDias)) {
    out.push({ level: 'check', message: 'Tie diameter is larger than the smallest main bar — are the fields swapped?' })
  }
  out.push(...commonChecks({
    dims: [i.widthMm, i.depthMm], coverMm: i.coverMm,
    diameters: [...mainDias, i.tieDiaMm], nos: i.nos, factor: i.lapToNextLift ? i.lapFactor : undefined,
  }))
  return out
}

export function validateColumnInputs(i: ColumnInputs): string[] {
  return errorsOf(issuesForColumn(i))
}

export type SlabInputs = {
  slabType: 'oneway' | 'twoway'
  shortSpanMm: number
  longSpanMm: number
  coverMm: number
  mainDiaMm: number
  mainSpacingMm: number
  distDiaMm: number
  distSpacingMm: number
  /** Top steel over the supports. The drawing states the bar length, so it is
   *  transcribed rather than derived from a moment envelope. */
  topDiaMm?: number
  topSpacingMm?: number
  topLengthMm?: number
  /** How many supported edges carry it — default 2. */
  topEdges?: number
  ldFactor: number
  nos: number
  markPrefix?: string
}

export function computeSlab(i: SlabInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const mark = marker(i.markPrefix, 'S')
  const mainCL = i.shortSpanMm + 2 * i.ldFactor * i.mainDiaMm
  const mainCount = barCount(i.longSpanMm, i.mainSpacingMm)

  // Distribution (temperature/shrinkage) steel — no development-length addition.
  const distCL = i.longSpanMm - 2 * i.coverMm
  const distCount = barCount(i.shortSpanMm, i.distSpacingMm)

  const rows: BarRow[] = [
    buildRow(mark(), 'Main bars', i.mainDiaMm, 'Straight', mainCL, mainCount * nos, { kind: 'straight', lengthMm: mainCL }),
    buildRow(mark(), 'Distribution bars', i.distDiaMm, 'Straight', distCL, distCount * nos, { kind: 'straight', lengthMm: distCL }),
  ]

  const topDia = i.topDiaMm ?? 0
  const topSpacing = i.topSpacingMm ?? 0
  const topLen = i.topLengthMm ?? 0
  if (topDia > 0 && topSpacing > 0 && topLen > 0) {
    const edges = Math.max(1, Math.round(i.topEdges ?? 2))
    // Counted across the long span, the same way the main bars are.
    const topCount = barCount(i.longSpanMm, topSpacing)
    rows.push(buildRow(mark(), 'Top bars over supports', topDia, 'Straight', topLen, topCount * edges * nos, { kind: 'straight', lengthMm: topLen }))
  }

  return summarize(rows)
}

export function issuesForSlab(i: SlabInputs): Issue[] {
  const out: Issue[] = []
  const e = (message: string) => out.push({ level: 'error', message })
  if (i.shortSpanMm <= 0) e('Short span must be greater than 0.')
  if (i.longSpanMm <= 0) e('Long span must be greater than 0.')
  if (i.longSpanMm - 2 * i.coverMm <= 0) e('Clear cover is too large relative to the long span — distribution bar length would be zero or negative.')
  if (i.mainSpacingMm <= 0) e('Main bar spacing must be greater than 0.')
  if (i.distSpacingMm <= 0) e('Distribution bar spacing must be greater than 0.')

  const topSet = [i.topDiaMm ?? 0, i.topSpacingMm ?? 0, i.topLengthMm ?? 0]
  if (topSet.some((v) => v > 0) && topSet.some((v) => v <= 0)) {
    e('Top bars need a diameter, a spacing and the length stated on the drawing — or leave all three empty.')
  }
  if ((i.topLengthMm ?? 0) > i.shortSpanMm && i.shortSpanMm > 0) {
    out.push({ level: 'check', message: 'Top bars are longer than the short span — check the stated length.' })
  }
  out.push(...spanChecks(i.shortSpanMm, 'Short span'), ...spanChecks(i.longSpanMm, 'Long span'))
  if (i.shortSpanMm > 0 && i.longSpanMm > 0 && i.shortSpanMm > i.longSpanMm) {
    out.push({ level: 'check', message: 'Short span is longer than the long span — are the two swapped?' })
  }
  if (i.mainSpacingMm > 0 && i.longSpanMm > 0 && i.mainSpacingMm >= i.longSpanMm) {
    out.push({ level: 'check', message: 'Main bar spacing is larger than the span — only one bar will be counted.' })
  }
  out.push(...commonChecks({
    dims: [], coverMm: i.coverMm, diameters: [i.mainDiaMm, i.distDiaMm], nos: i.nos, factor: i.ldFactor,
  }))
  return out
}

export function validateSlabInputs(i: SlabInputs): string[] {
  return errorsOf(issuesForSlab(i))
}

export type FootingInputs = {
  lengthMm: number
  widthMm: number
  coverMm: number
  dir1DiaMm: number
  dir1SpacingMm: number
  dir2DiaMm: number
  dir2SpacingMm: number
  nos: number
  markPrefix?: string
}

/** Aggregates every bar row's weight across N members, grouped by diameter, ascending. */
export function summarizeByDiameter(results: BbsResult[]): { diaMm: number; totalWtKg: number }[] {
  const map = new Map<number, number>()
  for (const r of results) {
    for (const row of r.rows) {
      map.set(row.diaMm, (map.get(row.diaMm) ?? 0) + row.totalWtKg)
    }
  }
  return Array.from(map, ([diaMm, totalWtKg]) => ({ diaMm, totalWtKg })).sort((a, b) => a.diaMm - b.diaMm)
}

export function computeFooting(i: FootingInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const mark = marker(i.markPrefix, 'F')
  const dir1CL = i.lengthMm - 2 * i.coverMm
  const dir1Count = barCount(i.widthMm, i.dir1SpacingMm)
  const dir2CL = i.widthMm - 2 * i.coverMm
  const dir2Count = barCount(i.lengthMm, i.dir2SpacingMm)

  return summarize([
    buildRow(mark(), 'Bars along length', i.dir1DiaMm, 'Straight (mesh)', dir1CL, dir1Count * nos, { kind: 'straight', lengthMm: dir1CL }),
    buildRow(mark(), 'Bars along width', i.dir2DiaMm, 'Straight (mesh)', dir2CL, dir2Count * nos, { kind: 'straight', lengthMm: dir2CL }),
  ])
}

export function issuesForFooting(i: FootingInputs): Issue[] {
  const out: Issue[] = []
  const e = (message: string) => out.push({ level: 'error', message })
  if (i.lengthMm <= 0) e('Length must be greater than 0.')
  if (i.widthMm <= 0) e('Width must be greater than 0.')
  if (i.lengthMm - 2 * i.coverMm <= 0) e('Clear cover is too large relative to the footing length — bar length would be zero or negative.')
  if (i.widthMm - 2 * i.coverMm <= 0) e('Clear cover is too large relative to the footing width — bar length would be zero or negative.')
  if (i.dir1SpacingMm <= 0) e('Spacing for bars along length must be greater than 0.')
  if (i.dir2SpacingMm <= 0) e('Spacing for bars along width must be greater than 0.')

  out.push(...spanChecks(i.lengthMm, 'Footing length'), ...spanChecks(i.widthMm, 'Footing width'))
  out.push(...commonChecks({
    dims: [], coverMm: i.coverMm, diameters: [i.dir1DiaMm, i.dir2DiaMm], nos: i.nos,
  }))
  return out
}

export function validateFootingInputs(i: FootingInputs): string[] {
  return errorsOf(issuesForFooting(i))
}
