/**
 * The bridge between the calculator's flat string form state and the typed
 * domain inputs.
 *
 * Lives outside the component so the backward-compatibility path — projects and
 * share links saved before feet-inches, mixed diameters and stirrup zones
 * existed — is directly unit-testable. That guarantee matters: a saved schedule
 * is a record someone may already have ordered steel against.
 */
import {
  computeBeam, computeColumn, computeFooting, computeSlab,
  issuesForBeam, issuesForColumn, issuesForFooting, issuesForSlab,
  deriveMarkPrefix,
  type BarSpec, type BbsResult, type BeamInputs, type ColumnInputs,
  type FootingInputs, type Issue, type SlabInputs,
} from './bbs'
import {
  beamElevationDiagram, beamSectionDiagram, columnSectionDiagram,
  footingPlanDiagram, slabPlanDiagram, type MemberDiagram,
} from './bbs-diagram'
import { decodeBarSpecs, decodeLifts, decodeSpacingZones } from './bbs-serialize'
import { parseLengthMm, type BareUnit, type UnitMode } from './units'

export type Member = 'beam' | 'column' | 'slab' | 'footing'

export const MEMBERS: { key: Member; label: string }[] = [
  { key: 'beam', label: 'Beam' },
  { key: 'column', label: 'Column' },
  { key: 'slab', label: 'Slab' },
  { key: 'footing', label: 'Footing' },
]

/**
 * Which fields are lengths, and what a bare number means in each — matching the
 * drawing convention exactly: spans in feet, sections and spacings in inches,
 * while diameters and cover are always millimetres and never routed here.
 */
export const LENGTH_FIELDS: Record<Member, Record<string, BareUnit>> = {
  beam: { span: 'ft', width: 'in', depth: 'in', stirSpacing: 'in', xTopLen: 'ft' },
  column: { height: 'ft', width: 'in', depth: 'in', tieSpacing: 'in', innerA: 'in', innerB: 'in' },
  slab: { shortSpan: 'ft', longSpan: 'ft', mainSpacing: 'in', distSpacing: 'in', topSpacing: 'in', topLen: 'ft' },
  footing: { length: 'ft', width: 'ft', dir1Spacing: 'in', dir2Spacing: 'in' },
}

export type MemberInputs =
  | { type: 'beam'; v: BeamInputs }
  | { type: 'column'; v: ColumnInputs }
  | { type: 'slab'; v: SlabInputs }
  | { type: 'footing'; v: FootingInputs }

export type ProjectMember = {
  id: string
  type: Member
  label: string
  fields: Record<string, string>
  result: BbsResult
  addedAt: number
  schemaVersion?: number
}

export const PROJECT_SCHEMA_VERSION = 2

const plain = (v: string | undefined) => parseFloat(v ?? '') || 0

/** Falls back to the pre-list scalar keys, which is what every saved project has. */
function barsFrom(
  f: Record<string, string>,
  listKey: string,
  legacyDiaKey: string,
  legacyCountKey: string,
): BarSpec[] {
  const listed = decodeBarSpecs(f[listKey])
  if (listed.length > 0) return listed
  const diaMm = plain(f[legacyDiaKey])
  const count = plain(f[legacyCountKey])
  return diaMm > 0 && count > 0 ? [{ diaMm, count }] : []
}

export function inputsFromFields(type: Member, f: Record<string, string>): MemberInputs {
  // The saved member's own mode, never the live UI's — otherwise re-opening a
  // millimetre-era member while the UI sits in feet-inches would reinterpret
  // 4000 as 4000 feet.
  const mode: UnitMode = f.u === 'ftin' ? 'ftin' : 'mm'
  const len = (key: string) => {
    const bareUnit = LENGTH_FIELDS[type][key] ?? 'mm'
    const r = parseLengthMm(f[key] ?? '', { mode, bareUnit })
    return r.ok ? r.mm : 0
  }
  const markPrefix = f.mark ? deriveMarkPrefix(f.mark, '') || undefined : undefined
  const ld = plain(f.ldFactor)
  const lap = plain(f.lapFactor)

  switch (type) {
    case 'column':
      return { type, v: {
        clearHeightMm: len('height'), widthMm: len('width'), depthMm: len('depth'), coverMm: plain(f.cover),
        mainBars: barsFrom(f, 'mainBars', 'mainDia', 'mainCount'),
        lifts: decodeLifts(f.lifts),
        tieDiaMm: plain(f.tieDia), tieSpacingMm: len('tieSpacing'),
        tieEndZones: decodeSpacingZones(f.tieZones),
        innerTieDiaMm: plain(f.innerDia), innerTieAMm: len('innerA'), innerTieBMm: len('innerB'),
        lapToNextLift: f.lap === '1', lapFactor: lap, nos: plain(f.nos), markPrefix,
      } }
    case 'slab':
      return { type, v: {
        slabType: f.type === 'twoway' ? 'twoway' : 'oneway',
        shortSpanMm: len('shortSpan'), longSpanMm: len('longSpan'), coverMm: plain(f.cover),
        mainDiaMm: plain(f.mainDia), mainSpacingMm: len('mainSpacing'),
        distDiaMm: plain(f.distDia), distSpacingMm: len('distSpacing'),
        topDiaMm: plain(f.topDia), topSpacingMm: len('topSpacing'),
        topLengthMm: len('topLen'), topEdges: plain(f.topEdges) || 2,
        ldFactor: ld, nos: plain(f.nos), markPrefix,
      } }
    case 'footing':
      return { type, v: {
        lengthMm: len('length'), widthMm: len('width'), coverMm: plain(f.cover),
        dir1DiaMm: plain(f.dir1Dia), dir1SpacingMm: len('dir1Spacing'),
        dir2DiaMm: plain(f.dir2Dia), dir2SpacingMm: len('dir2Spacing'),
        nos: plain(f.nos), markPrefix,
      } }
    case 'beam':
    default:
      return { type: 'beam', v: {
        clearSpanMm: len('span'), widthMm: len('width'), depthMm: len('depth'), coverMm: plain(f.cover),
        botBars: barsFrom(f, 'botBars', 'botDia', 'botCount'),
        topBars: barsFrom(f, 'topBars', 'topDia', 'topCount'),
        extraTopBars: decodeBarSpecs(f.xTopBars),
        extraTopLengthMm: len('xTopLen'),
        extraTopBothEnds: f.xTopBoth !== '0',
        faceBars: decodeBarSpecs(f.faceBars),
        faceEachFace: f.faceBoth !== '0',
        stirDiaMm: plain(f.stirDia), stirSpacingMm: len('stirSpacing'),
        stirEndZones: decodeSpacingZones(f.stirZones),
        anchorIntoSupport: f.anchor === '1', ldFactor: ld, nos: plain(f.nos), markPrefix,
      } }
  }
}

export function computeFor(mi: MemberInputs): BbsResult {
  switch (mi.type) {
    case 'column': return computeColumn(mi.v)
    case 'slab': return computeSlab(mi.v)
    case 'footing': return computeFooting(mi.v)
    default: return computeBeam(mi.v)
  }
}

export function issuesFor(mi: MemberInputs): Issue[] {
  switch (mi.type) {
    case 'column': return issuesForColumn(mi.v)
    case 'slab': return issuesForSlab(mi.v)
    case 'footing': return issuesForFooting(mi.v)
    default: return issuesForBeam(mi.v)
  }
}

export const errorsOf = (issues: Issue[]) => issues.filter((x) => x.level === 'error').map((x) => x.message)
export const checksOf = (issues: Issue[]) => issues.filter((x) => x.level === 'check').map((x) => x.message)

/**
 * Re-derives a saved member from its stored fields so older entries pick up new
 * capabilities. Adopts the recomputed rows ONLY if they reproduce the stored
 * total to the cent, the row count matches, AND every mark is unchanged —
 * anything else keeps the stored rows verbatim. This must never silently
 * rewrite a schedule a user has already exported or ordered against.
 */
export function hydrateProjectMember(pm: ProjectMember): ProjectMember {
  const rows = pm?.result?.rows
  if (!Array.isArray(rows)) return pm
  const current = pm.schemaVersion === PROJECT_SCHEMA_VERSION && rows.every((r) => r.geom)
  if (current) return pm

  try {
    const fresh = computeFor(inputsFromFields(pm.type, pm.fields ?? {}))
    if (fresh.rows.length !== rows.length) return pm
    if (Math.abs(fresh.totalKg - pm.result.totalKg) > 0.005) return pm
    if (fresh.rows.some((r, idx) => r.mark !== rows[idx].mark)) return pm
    return { ...pm, result: fresh, schemaVersion: PROJECT_SCHEMA_VERSION }
  } catch {
    return pm
  }
}

/**
 * Figures for a member. Beams return a section plus, when the stirrup spacing
 * varies, an elevation — the only view that can show zoning.
 */
export function diagramsFor(mi: MemberInputs): MemberDiagram[] {
  const list: (MemberDiagram | null)[] =
    mi.type === 'column' ? [columnSectionDiagram(mi.v)]
    : mi.type === 'slab' ? [slabPlanDiagram(mi.v)]
    : mi.type === 'footing' ? [footingPlanDiagram(mi.v)]
    : [beamSectionDiagram(mi.v), beamElevationDiagram(mi.v)]
  return list.filter((d): d is MemberDiagram => d !== null)
}
