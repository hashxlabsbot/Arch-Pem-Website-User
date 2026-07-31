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
  botDiaMm: number
  botCount: number
  topDiaMm: number
  topCount: number
  stirDiaMm: number
  stirSpacingMm: number
  anchorIntoSupport: boolean
  ldFactor: number
  nos: number
}

export function computeBeam(i: BeamInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const anchorAddMm = (diaMm: number) => (i.anchorIntoSupport ? 2 * i.ldFactor * diaMm : 0)
  const botCL = i.clearSpanMm + anchorAddMm(i.botDiaMm)
  const topCL = i.clearSpanMm + anchorAddMm(i.topDiaMm)

  const a = i.widthMm - 2 * i.coverMm
  const b = i.depthMm - 2 * i.coverMm
  const stirCL = stirrupCuttingLengthMm(a, b, i.stirDiaMm)
  const stirCount = barCount(i.clearSpanMm, i.stirSpacingMm)

  return summarize([
    buildRow('B1', 'Bottom main bars', i.botDiaMm, 'Straight', botCL, i.botCount * nos, { kind: 'straight', lengthMm: botCL }),
    buildRow('B2', 'Top main bars', i.topDiaMm, 'Straight', topCL, i.topCount * nos, { kind: 'straight', lengthMm: topCL }),
    buildRow('B3', 'Stirrups', i.stirDiaMm, 'Rectangular closed stirrup', stirCL, stirCount * nos, { kind: 'rect-link', aMm: a, bMm: b, diaMm: i.stirDiaMm }),
  ])
}

/**
 * Flags physically-impossible geometry (not soft advisory nitpicks) — e.g. a
 * clear cover large enough that a stirrup's internal dimension goes negative,
 * which would make the calculated cutting length/weight meaningless rather
 * than just imprecise.
 */
export function validateBeamInputs(i: BeamInputs): string[] {
  const w: string[] = []
  if (i.clearSpanMm <= 0) w.push('Clear span must be greater than 0.')
  if (i.widthMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large for the beam width — stirrup dimensions would be zero or negative.')
  if (i.depthMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large for the beam depth — stirrup dimensions would be zero or negative.')
  if (i.botCount <= 0 && i.topCount <= 0) w.push('Enter at least one bottom or top bar.')
  if (i.stirSpacingMm <= 0) w.push('Stirrup spacing must be greater than 0.')
  return w
}

export type ColumnInputs = {
  clearHeightMm: number
  widthMm: number
  depthMm: number
  coverMm: number
  mainDiaMm: number
  mainCount: number
  tieDiaMm: number
  tieSpacingMm: number
  lapToNextLift: boolean
  lapFactor: number
  nos: number
}

export function computeColumn(i: ColumnInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const mainCL = i.clearHeightMm + (i.lapToNextLift ? i.lapFactor * i.mainDiaMm : 0)

  const a = i.widthMm - 2 * i.coverMm
  const b = i.depthMm - 2 * i.coverMm
  const tieCL = stirrupCuttingLengthMm(a, b, i.tieDiaMm)
  const tieCount = barCount(i.clearHeightMm, i.tieSpacingMm)

  return summarize([
    buildRow('C1', 'Main vertical bars', i.mainDiaMm, 'Straight', mainCL, i.mainCount * nos, { kind: 'straight', lengthMm: mainCL }),
    buildRow('C2', 'Ties', i.tieDiaMm, 'Rectangular closed tie', tieCL, tieCount * nos, { kind: 'rect-link', aMm: a, bMm: b, diaMm: i.tieDiaMm }),
  ])
}

export function validateColumnInputs(i: ColumnInputs): string[] {
  const w: string[] = []
  if (i.clearHeightMm <= 0) w.push('Clear height must be greater than 0.')
  if (i.widthMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large for the column width — tie dimensions would be zero or negative.')
  if (i.depthMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large for the column depth — tie dimensions would be zero or negative.')
  if (i.mainCount <= 0) w.push('Enter at least one main bar.')
  if (i.tieSpacingMm <= 0) w.push('Tie spacing must be greater than 0.')
  return w
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
  ldFactor: number
  nos: number
}

export function computeSlab(i: SlabInputs): BbsResult {
  const nos = Math.max(1, i.nos || 1)
  const mainCL = i.shortSpanMm + 2 * i.ldFactor * i.mainDiaMm
  const mainCount = barCount(i.longSpanMm, i.mainSpacingMm)

  // Distribution (temperature/shrinkage) steel — no development-length addition.
  const distCL = i.longSpanMm - 2 * i.coverMm
  const distCount = barCount(i.shortSpanMm, i.distSpacingMm)

  return summarize([
    buildRow('S1', 'Main bars', i.mainDiaMm, 'Straight', mainCL, mainCount * nos, { kind: 'straight', lengthMm: mainCL }),
    buildRow('S2', 'Distribution bars', i.distDiaMm, 'Straight', distCL, distCount * nos, { kind: 'straight', lengthMm: distCL }),
  ])
}

export function validateSlabInputs(i: SlabInputs): string[] {
  const w: string[] = []
  if (i.shortSpanMm <= 0) w.push('Short span must be greater than 0.')
  if (i.longSpanMm <= 0) w.push('Long span must be greater than 0.')
  if (i.longSpanMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large relative to the long span — distribution bar length would be zero or negative.')
  if (i.mainSpacingMm <= 0) w.push('Main bar spacing must be greater than 0.')
  if (i.distSpacingMm <= 0) w.push('Distribution bar spacing must be greater than 0.')
  return w
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
  const dir1CL = i.lengthMm - 2 * i.coverMm
  const dir1Count = barCount(i.widthMm, i.dir1SpacingMm)
  const dir2CL = i.widthMm - 2 * i.coverMm
  const dir2Count = barCount(i.lengthMm, i.dir2SpacingMm)

  return summarize([
    buildRow('F1', 'Bars along length', i.dir1DiaMm, 'Straight (mesh)', dir1CL, dir1Count * nos, { kind: 'straight', lengthMm: dir1CL }),
    buildRow('F2', 'Bars along width', i.dir2DiaMm, 'Straight (mesh)', dir2CL, dir2Count * nos, { kind: 'straight', lengthMm: dir2CL }),
  ])
}

export function validateFootingInputs(i: FootingInputs): string[] {
  const w: string[] = []
  if (i.lengthMm <= 0) w.push('Length must be greater than 0.')
  if (i.widthMm <= 0) w.push('Width must be greater than 0.')
  if (i.lengthMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large relative to the footing length — bar length would be zero or negative.')
  if (i.widthMm - 2 * i.coverMm <= 0) w.push('Clear cover is too large relative to the footing width — bar length would be zero or negative.')
  if (i.dir1SpacingMm <= 0) w.push('Spacing for bars along length must be greater than 0.')
  if (i.dir2SpacingMm <= 0) w.push('Spacing for bars along width must be greater than 0.')
  return w
}
