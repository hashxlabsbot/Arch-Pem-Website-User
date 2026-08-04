'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ShareButton from './ShareButton'
import { ExportIcon, PrinterIcon } from '@/components/icons'
import {
  summarizeByDiameter, deriveMarkPrefix,
  type BarSpec, type BbsResult, type SpacingZone,
} from '@/lib/bbs'
import { type MemberDiagram } from '@/lib/bbs-diagram'
import {
  LENGTH_FIELDS, MEMBERS, PROJECT_SCHEMA_VERSION,
  checksOf, computeFor, diagramsFor, errorsOf, hydrateProjectMember,
  inputsFromFields, issuesFor,
  type Member, type MemberInputs, type ProjectMember,
} from '@/lib/bbs-fields'
import { decodeBarSpecs, decodeLifts, decodeSpacingZones, encodeBarSpecs, encodeLifts, encodeSpacingZones } from '@/lib/bbs-serialize'
import { DEFAULT_STOCK_MM, nestSchedule } from '@/lib/bbs-nesting'
import { formatLength, parseLengthMm, type UnitMode } from '@/lib/units'
import { BarShapeCell, MemberFigure } from './BBSDiagrams'
import BBSLengthInput from './BBSLengthInput'
import { BarSpecRows, ColumnLiftRows, SpacingZoneRows } from './BBSListRows'

type BeamForm = {
  mark: string
  span: string; width: string; depth: string; cover: string
  botBars: string; topBars: string
  xTopBars: string; xTopLen: string; xTopBoth: string
  faceBars: string; faceBoth: string
  stirDia: string; stirSpacing: string; stirZones: string; anchor: string; nos: string
}
/** Chosen so an untouched beam reproduces the shipped 58.04 kg schedule exactly. */
const BEAM_DEFAULTS: BeamForm = {
  mark: '',
  span: '4000', width: '230', depth: '450', cover: '25',
  botBars: '4x16', topBars: '2x12',
  xTopBars: '', xTopLen: '', xTopBoth: '1',
  faceBars: '', faceBoth: '1',
  stirDia: '8', stirSpacing: '150', stirZones: '', anchor: '1', nos: '1',
}

type ColumnForm = {
  mark: string
  height: string; width: string; depth: string; cover: string
  mainBars: string; lifts: string
  tieDia: string; tieSpacing: string; tieZones: string
  innerDia: string; innerA: string; innerB: string
  lap: string; nos: string
}
const COLUMN_DEFAULTS: ColumnForm = {
  mark: '',
  height: '3000', width: '230', depth: '230', cover: '40',
  mainBars: '6x16', lifts: '',
  tieDia: '8', tieSpacing: '150', tieZones: '',
  innerDia: '', innerA: '', innerB: '',
  lap: '1', nos: '1',
}

type SlabForm = {
  mark: string
  type: string
  shortSpan: string; longSpan: string; cover: string
  mainDia: string; mainSpacing: string; distDia: string; distSpacing: string
  topDia: string; topSpacing: string; topLen: string; topEdges: string
  nos: string
}
const SLAB_DEFAULTS: SlabForm = {
  mark: '',
  // 25 mm matches the cover these drawings actually specify for slabs.
  type: 'oneway', shortSpan: '3000', longSpan: '4000', cover: '25',
  mainDia: '10', mainSpacing: '150', distDia: '8', distSpacing: '200',
  topDia: '', topSpacing: '', topLen: '', topEdges: '2',
  nos: '1',
}

type FootingForm = {
  mark: string
  length: string; width: string; cover: string
  dir1Dia: string; dir1Spacing: string; dir2Dia: string; dir2Spacing: string
  nos: string
}
const FOOTING_DEFAULTS: FootingForm = {
  mark: '',
  length: '1500', width: '1500', cover: '50',
  dir1Dia: '12', dir1Spacing: '150', dir2Dia: '12', dir2Spacing: '150',
  nos: '1',
}

/**
 * Seeds a form group from the URL.
 *
 * Values present in the URL are taken verbatim — they were written in that
 * link's own unit mode, so converting them would corrupt them. Defaults are
 * authored in millimetres, so when the link opens in feet-inches they DO need
 * converting; otherwise a 3000 mm default height would be read as 3000 feet.
 */
function seedGroup<T extends Record<string, string>>(
  params: URLSearchParams,
  prefix: string,
  defaults: T,
  member: Member,
  mode: UnitMode,
): T {
  const out = { ...defaults }
  const lengths = LENGTH_FIELDS[member]
  for (const k of Object.keys(defaults) as (keyof T)[]) {
    const key = String(k)
    const v = params.get(`${prefix}_${key}`)
    if (v !== null) {
      out[k] = v as T[keyof T]
    } else if (mode !== 'mm' && lengths[key]) {
      const asMm = parseLengthMm(defaults[k], { mode: 'mm', bareUnit: 'mm' })
      if (asMm.ok) out[k] = formatLength(asMm.mm, mode) as T[keyof T]
    }
  }
  return out
}

/** Unlike a capped "recent runs" list, a BBS project must never silently evict entries. */
const PROJECT_KEY = 'arcpem_bbs_project'
const UNITS_KEY = 'arcpem_bbs_units'

function defaultLabelFor(m: Member, list: ProjectMember[]): string {
  const typeLabel = MEMBERS.find((x) => x.key === m)?.label ?? ''
  return `${typeLabel} ${list.filter((p) => p.type === m).length + 1}`
}

const mm = (v: number) => Math.round(v).toLocaleString('en-IN')

function MeshLegend({ solid, dashed }: { solid: string; dashed: string }) {
  return (
    <span className="bbs-legend">
      <span>
        <svg width="20" height="8" aria-hidden="true"><line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="1.4" /></svg>
        {solid}
      </span>
      <span>
        <svg width="20" height="8" aria-hidden="true"><line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2.2" /></svg>
        {dashed}
      </span>
    </span>
  )
}

/**
 * Beam and column sections get an explicit "indicative" caveat because the tool
 * never asks how bars are arranged. Slab and footing plans deliberately do NOT
 * — their bar positions come from the spacings entered and the same barCount()
 * the schedule uses, so hedging them would be untrue.
 */
function diagramCaption(mi: MemberInputs, d: MemberDiagram): React.ReactNode {
  const notes: string[] = []
  if (d.variant === 'section') {
    if (!d.barsToScale) notes.push('Bar circles are enlarged for visibility.')
    if (d.barsOverlap) notes.push('Bars are shown overlapping — they do not fit side by side in one layer at this section width.')
    if (d.barCountShown < d.barCountTotal) notes.push(`Showing ${d.barCountShown} of ${d.barCountTotal} bars.`)
  } else if (d.variant === 'plan') {
    if (!d.dir1.drawnAll || !d.dir2.drawnAll) notes.push('Representative bars shown — the full count is in the schedule.')
  } else if (!d.drawnAll) {
    notes.push('Representative stirrups shown — the full count is in the schedule.')
  }
  const tail = notes.length > 0 ? ` ${notes.join(' ')}` : ''

  if (d.variant === 'elevation' && mi.type === 'beam') {
    return (
      <>
        <strong>Beam elevation</strong> — stirrup spacing by zone along the {mm(mi.v.clearSpanMm)} mm span.
        Vertical scale is exaggerated, so no depth is dimensioned here.
        {d.anchored && ' Bars run past each support to show anchorage, which is added to the cutting length rather than drawn to shape.'}
        {tail}
      </>
    )
  }
  if (mi.type === 'beam' || mi.type === 'column') {
    const label = mi.type === 'beam' ? 'Beam section' : 'Column section'
    return (
      <>
        <strong>{label}</strong> — {mm(mi.v.widthMm)} × {mm(mi.v.depthMm)} mm, {mm(mi.v.coverMm)} mm clear cover.{' '}
        <em>Bar arrangement is indicative, not a detailing drawing</em> — the calculator doesn&apos;t ask
        how bars are arranged, so positions here are assumed. Quantities and lengths in the schedule are
        unaffected.{tail}
      </>
    )
  }
  if (mi.type === 'slab' && d.variant === 'plan') {
    return (
      <>
        <strong>Slab plan</strong> — {mm(mi.v.shortSpanMm)} × {mm(mi.v.longSpanMm)} mm. Bar positions are
        computed from the spacings entered: {d.dir1.count} main bars at {mm(mi.v.mainSpacingMm)} mm centres
        and {d.dir2.count} distribution bars at {mm(mi.v.distSpacingMm)} mm centres.{tail}
        <MeshLegend solid="S1 main bars" dashed="S2 distribution bars" />
      </>
    )
  }
  if (mi.type === 'footing' && d.variant === 'plan') {
    return (
      <>
        <strong>Footing plan</strong> — {mm(mi.v.lengthMm)} × {mm(mi.v.widthMm)} mm mesh. Bar positions are
        computed from the spacings entered: {d.dir1.count} bars at {mm(mi.v.dir1SpacingMm)} mm centres along
        the length and {d.dir2.count} at {mm(mi.v.dir2SpacingMm)} mm along the width.{tail}
        <MeshLegend solid="F1 bars along length" dashed="F2 bars along width" />
      </>
    )
  }
  return null
}

/**
 * The nine schedule columns, defined once — they render into both the
 * single-member and the whole-project print sheets, which must never drift.
 * Widths sum to 100; Shape carries a drawing so it takes the largest share.
 */
const BBS_COLS = [
  { label: 'Mark', width: '5%' },
  { label: 'Description', width: '14%' },
  { label: 'Dia (mm)', width: '7%', num: true },
  { label: 'Shape', width: '22%' },
  { label: 'Cutting Length (mm)', width: '12%', num: true },
  { label: 'Nos', width: '6%', num: true },
  { label: 'Total Length (m)', width: '11%', num: true },
  { label: 'Unit Wt (kg/m)', width: '11%', num: true },
  { label: 'Total Wt (kg)', width: '12%', num: true },
] as const

function BbsPrintTable({ rows, fmt }: { rows: BbsResult['rows']; fmt: (v: number, d?: number) => string }) {
  return (
    <table className="inv-table" style={{ tableLayout: 'fixed', width: '100%' }}>
      <thead>
        <tr>
          {BBS_COLS.map((c) => (
            <th key={c.label} className={'num' in c && c.num ? 'num' : undefined} style={{ width: c.width, whiteSpace: 'normal' }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.mark}>
            <td>{r.mark}</td>
            <td>{r.desc}</td>
            <td className="num">{r.diaMm}</td>
            <td><BarShapeCell row={r} /></td>
            <td className="num">{fmt(r.cuttingLengthMm, 0)}</td>
            <td className="num">{r.nos}</td>
            <td className="num">{fmt(r.totalLengthM)}</td>
            <td className="num">{fmt(r.unitWtKgM, 3)}</td>
            <td className="num">{fmt(r.totalWtKg)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function BBSCalculator() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [member, setMember] = useState<Member>(() => {
    const m = params.get('member')
    return m === 'column' || m === 'slab' || m === 'footing' ? m : 'beam'
  })
  const [unitMode, setUnitMode] = useState<UnitMode>(() => (params.get('u') === 'ftin' ? 'ftin' : 'mm'))
  const [ldFactor, setLdFactor] = useState(() => params.get('ld') ?? '50')
  const [lapFactor, setLapFactor] = useState(() => params.get('lapf') ?? '50')

  const [beam, setBeam] = useState<BeamForm>(() => seedGroup(params, 'b', BEAM_DEFAULTS, 'beam', unitMode))
  const [column, setColumn] = useState<ColumnForm>(() => seedGroup(params, 'c', COLUMN_DEFAULTS, 'column', unitMode))
  const [slab, setSlab] = useState<SlabForm>(() => seedGroup(params, 's', SLAB_DEFAULTS, 'slab', unitMode))
  const [footing, setFooting] = useState<FootingForm>(() => seedGroup(params, 'f', FOOTING_DEFAULTS, 'footing', unitMode))

  const [project, setProject] = useState<ProjectMember[]>([])
  const [projectLabel, setProjectLabel] = useState(() => defaultLabelFor(member, []))
  const [wastagePct, setWastagePct] = useState('3')
  const [ratePerKg, setRatePerKg] = useState('')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    try {
      // URL wins over the personal default so a shared link reproduces what the
      // sender saw; the stored preference only fills in when the link is silent.
      if (!params.get('u')) {
        const savedUnits = localStorage.getItem(UNITS_KEY)
        if ((savedUnits === 'ftin' || savedUnits === 'mm') && savedUnits !== unitMode) {
          convertGroups(unitMode, savedUnits)
          setUnitMode(savedUnits)
        }
      }
    } catch {
      /* storage blocked — keep the default */
    }
    try {
      const raw = localStorage.getItem(PROJECT_KEY)
      if (raw) {
        const list: ProjectMember[] = JSON.parse(raw).map(hydrateProjectMember)
        setProject(list)
        setProjectLabel(defaultLabelFor(member, list))
      }
    } catch {
      /* corrupted storage — start fresh */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced URL sync — lets an engineer share a link that reproduces this exact schedule.
  const syncTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const qs = new URLSearchParams({ member, ld: ldFactor, lapf: lapFactor })
      if (unitMode !== 'mm') qs.set('u', unitMode)
      // Only non-default values go in, which keeps a shared link readable.
      const put = <T extends Record<string, string>>(prefix: string, group: T, defaults: T) => {
        for (const [k, v] of Object.entries(group)) {
          if (v !== defaults[k as keyof T]) qs.set(`${prefix}_${k}`, v)
        }
      }
      put('b', beam, BEAM_DEFAULTS)
      put('c', column, COLUMN_DEFAULTS)
      put('s', slab, SLAB_DEFAULTS)
      put('f', footing, FOOTING_DEFAULTS)
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
    }, 350)
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current) }
  }, [member, unitMode, ldFactor, lapFactor, beam, column, slab, footing, router, pathname])

  function persistProject(list: ProjectMember[]) {
    setProject(list)
    try {
      localStorage.setItem(PROJECT_KEY, JSON.stringify(list))
    } catch {
      /* storage full / blocked — non-fatal */
    }
  }

  function snapshotFields(m: Member): Record<string, string> {
    const base: Record<string, string> = m === 'beam' ? beam : m === 'column' ? column : m === 'slab' ? slab : footing
    // The mode travels with the member so re-opening it later can never
    // reinterpret a millimetre value as feet.
    return { ...base, ldFactor, lapFactor, u: unitMode }
  }

  function addToProject() {
    if (!has || errors.length > 0) return
    const label = projectLabel.trim() || defaultLabelFor(member, project)
    const entry: ProjectMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: member,
      label,
      fields: snapshotFields(member),
      result,
      addedAt: Date.now(),
    }
    const next = [...project, entry]
    persistProject(next)
    setProjectLabel(defaultLabelFor(member, next))
  }

  function removeFromProject(id: string) {
    persistProject(project.filter((p) => p.id !== id))
  }

  function editProjectMember(id: string) {
    const pm = project.find((p) => p.id === id)
    if (!pm) return
    const { ldFactor: fLd, lapFactor: fLap, u: fUnits, ...rest } = pm.fields
    if (fLd !== undefined) setLdFactor(fLd)
    if (fLap !== undefined) setLapFactor(fLap)
    if (fUnits === 'ftin' || fUnits === 'mm') setUnitMode(fUnits)
    if (pm.type === 'beam') setBeam(rest as unknown as BeamForm)
    else if (pm.type === 'column') setColumn(rest as unknown as ColumnForm)
    else if (pm.type === 'slab') setSlab(rest as unknown as SlabForm)
    else setFooting(rest as unknown as FootingForm)
    setMember(pm.type)
    setProjectLabel(pm.label)
    removeFromProject(id)
  }

  function clearProject() {
    if (project.length === 0) return
    const ok = window.confirm(`Remove all ${project.length} member${project.length > 1 ? 's' : ''} from this project? This can't be undone.`)
    if (!ok) return
    persistProject([])
  }

  const n = (v: string) => parseFloat(v) || 0

  /**
   * Switching units CONVERTS the values; it never reinterprets them. Treating a
   * 230 mm width as 230 feet would silently turn a beam into a 70 m member.
   *
   * mm -> ft-in rounds to the nearest 1/8", so a per-mode snapshot restores the
   * user's exact original text when a field hasn't actually been edited.
   */
  const rawSnapshots = useRef<Partial<Record<UnitMode, Record<string, Record<string, string>>>>>({})
  const [unitNote, setUnitNote] = useState('')

  /** Rewrites every length field from one mode's notation into the other's. */
  function convertGroups(from: UnitMode, to: UnitMode): number {
    const groups: Record<string, [Record<string, string>, (v: never) => void]> = {
      beam: [beam, setBeam as (v: never) => void],
      column: [column, setColumn as (v: never) => void],
      slab: [slab, setSlab as (v: never) => void],
      footing: [footing, setFooting as (v: never) => void],
    }
    rawSnapshots.current[from] = Object.fromEntries(
      Object.entries(groups).map(([k, [g]]) => [k, { ...g }]),
    )
    const prior = rawSnapshots.current[to]
    let converted = 0

    for (const [key, [group, setGroup]] of Object.entries(groups)) {
      const out: Record<string, string> = { ...group }
      for (const [field, bareUnit] of Object.entries(LENGTH_FIELDS[key as Member])) {
        const parsed = parseLengthMm(group[field] ?? '', { mode: from, bareUnit })
        if (!parsed.ok) continue
        const saved = prior?.[key]?.[field]
        if (saved !== undefined) {
          const savedMm = parseLengthMm(saved, { mode: to, bareUnit })
          // Unedited since we were last in that mode — restore the exact text
          // rather than re-rounding it through 1/8".
          if (savedMm.ok && Math.abs(savedMm.mm - parsed.mm) < 0.05) {
            out[field] = saved
            converted++
            continue
          }
        }
        out[field] = formatLength(parsed.mm, to)
        converted++
      }
      setGroup(out as never)
    }
    return converted
  }

  function switchUnits(next: UnitMode) {
    if (next === unitMode) return
    const converted = convertGroups(unitMode, next)
    setUnitMode(next)
    try { localStorage.setItem(UNITS_KEY, next) } catch { /* storage blocked */ }
    setUnitNote(`Converted ${converted} dimension${converted === 1 ? '' : 's'} to ${next === 'ftin' ? 'feet-inches' : 'millimetres'}. Bar diameters and clear cover stay in mm.`)
    window.setTimeout(() => setUnitNote(''), 6000)
  }

  /** Reads a list field, edits it, and writes it back encoded. */
  const barSpecsOf = (v: string) => decodeBarSpecs(v)
  const zonesOf = (v: string) => decodeSpacingZones(v)

  const memberInputs = useMemo(
    () => inputsFromFields(member, snapshotFields(member)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [member, beam, column, slab, footing, ldFactor, lapFactor],
  )
  const result: BbsResult = useMemo(() => computeFor(memberInputs), [memberInputs])
  const issues = useMemo(() => issuesFor(memberInputs), [memberInputs])
  // Errors block saving into the project; checks only ask the user to look.
  const errors = useMemo(() => errorsOf(issues), [issues])
  const checks = useMemo(() => checksOf(issues), [issues])
  const diagrams = useMemo(() => diagramsFor(memberInputs), [memberInputs])

  const has = result.totalKg > 0
  const f = (v: number, d = 2) => v.toLocaleString('en-IN', { maximumFractionDigits: d })
  const memberLabel = MEMBERS.find((m) => m.key === member)?.label ?? ''

  const wastageMultiplier = 1 + (n(wastagePct) || 0) / 100
  const projectTotalKg = useMemo(() => project.reduce((s, p) => s + p.result.totalKg, 0), [project])
  const projectTotalTonnes = projectTotalKg / 1000
  const projectOrderKg = projectTotalKg * wastageMultiplier
  const diaSummary = useMemo(() => summarizeByDiameter(project.map((p) => p.result)), [project])

  // Cutting plan: how the schedule's cut lengths nest into stock bars.
  const [stockLen, setStockLen] = useState('12000')
  const cuttingPlan = useMemo(
    () => nestSchedule(project.flatMap((p) => p.result.rows), n(stockLen) || DEFAULT_STOCK_MM),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [project, stockLen],
  )
  const cuttingTotals = useMemo(() => cuttingPlan.reduce(
    (acc, r) => ({
      bars: acc.bars + r.barsNeeded,
      offcutKg: acc.offcutKg + r.offcutKg,
      lower: acc.lower + r.lowerBound,
      oversize: acc.oversize + r.oversizeMm.length,
    }),
    { bars: 0, offcutKg: 0, lower: 0, oversize: 0 },
  ), [cuttingPlan])
  const hasRate = n(ratePerKg) > 0
  const estimatedCost = projectOrderKg * n(ratePerKg)

  function csvField(v: string | number): string {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csvRow = (fields: (string | number)[]) => fields.map(csvField).join(',')

  function exportProjectCsv() {
    if (project.length === 0) return
    const lines: string[] = [
      csvRow(['Project Bar Bending Schedule']),
      csvRow([`Generated ${new Date().toLocaleDateString('en-IN')}`]),
      '',
      csvRow(['Member Label', 'Type', 'Mark', 'Description', 'Dia (mm)', 'Shape', 'Cutting Length (mm)', 'Nos', 'Total Length (m)', 'Unit Wt (kg/m)', 'Total Wt (kg)']),
    ]
    for (const pm of project) {
      const typeLabel = MEMBERS.find((m) => m.key === pm.type)?.label ?? pm.type
      for (const row of pm.result.rows) {
        lines.push(csvRow([
          pm.label, typeLabel, row.mark, row.desc, row.diaMm, row.shape,
          Math.round(row.cuttingLengthMm), row.nos, row.totalLengthM.toFixed(2),
          row.unitWtKgM.toFixed(3), row.totalWtKg.toFixed(2),
        ]))
      }
    }
    lines.push('', csvRow(['Diameter (mm)', 'Total Weight (kg)', `Order Qty incl. ${wastagePct}% wastage (kg)`]))
    for (const d of diaSummary) {
      lines.push(csvRow([d.diaMm, d.totalWtKg.toFixed(2), (d.totalWtKg * wastageMultiplier).toFixed(2)]))
    }
    lines.push('', csvRow(['Grand Total Weight (kg)', projectTotalKg.toFixed(2)]))
    lines.push(csvRow(['Grand Total Weight (tonnes)', projectTotalTonnes.toFixed(3)]))
    lines.push(csvRow(['Order Quantity incl. wastage (kg)', projectOrderKg.toFixed(2)]))
    if (hasRate) lines.push(csvRow(['Estimated Cost (INR)', estimatedCost.toFixed(0)]))

    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bbs-project-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Printable schedule (portalled to <body> so print yields exactly one clean page) ──
  const scheduleSheet = (
    <div className="inv-sheet">
      <div className="inv-top">
        <div style={{ maxWidth: '60%' }}>
          <div className="inv-firm-name">Bar Bending Schedule</div>
          <div className="inv-muted">{memberLabel} · generated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="inv-title">BBS</div>
          <div className="inv-muted">arcpem.com/tools</div>
        </div>
      </div>

      {diagrams[0] && <MemberFigure diagram={diagrams[0]} caption={diagramCaption(memberInputs, diagrams[0])} />}

      <BbsPrintTable rows={result.rows} fmt={f} />

      <div className="inv-totals" style={{ marginLeft: 0, width: '100%' }}>
        <div className="inv-trow inv-grand">
          <span>Total Steel Weight</span>
          <span>{f(result.totalKg)} kg ({f(result.totalTonnes, 3)} t)</span>
        </div>
      </div>

      <div className="inv-brand">
        Generated using ARC PEM Free Tools (arcpem.com/tools) — offline project &amp; material tracking for builders
      </div>
    </div>
  )

  const projectSheet = (
    <div className="inv-sheet">
      <div className="inv-top">
        <div style={{ maxWidth: '60%' }}>
          <div className="inv-firm-name">Bar Bending Schedule — Project</div>
          <div className="inv-muted">
            {project.length} member{project.length > 1 ? 's' : ''} · generated{' '}
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="inv-title">BBS</div>
          <div className="inv-muted">arcpem.com/tools</div>
        </div>
      </div>

      {project.map((pm, idx) => {
        const typeLabel = MEMBERS.find((m) => m.key === pm.type)?.label ?? pm.type
        // Member dimensions live in the stored form fields, not in the stored
        // result — if they're missing we simply omit the drawing rather than
        // fabricate one.
        const pmInputs = pm.fields ? inputsFromFields(pm.type, pm.fields) : null
        const pmDiagram = pmInputs ? (diagramsFor(pmInputs)[0] ?? null) : null
        return (
          <div key={pm.id} className="bbs-member-block" style={{ marginTop: idx === 0 ? 16 : 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div className="inv-h">{pm.label} — {typeLabel}</div>
              {pmDiagram && (
                <MemberFigure
                  diagram={pmDiagram}
                  caption={null}
                  className="bbs-member-fig"
                />
              )}
            </div>
            <BbsPrintTable rows={pm.result.rows} fmt={f} />
            <div className="inv-totals" style={{ marginLeft: 0, width: '100%', marginTop: 4 }}>
              <div className="inv-trow">
                <span>Subtotal — {pm.label}</span>
                <span>{f(pm.result.totalKg)} kg</span>
              </div>
            </div>
          </div>
        )
      })}

      <div className="inv-h" style={{ marginTop: 20 }}>Diameter-wise Steel Summary</div>
      <table className="inv-table">
        <thead>
          <tr>
            <th>Dia (mm)</th>
            <th className="num">Total Wt (kg)</th>
            <th className="num">Order Qty incl. {wastagePct}% (kg)</th>
          </tr>
        </thead>
        <tbody>
          {diaSummary.map((d) => (
            <tr key={d.diaMm}>
              <td>{d.diaMm} mm</td>
              <td className="num">{f(d.totalWtKg)}</td>
              <td className="num">{f(d.totalWtKg * wastageMultiplier)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-totals" style={{ marginLeft: 0, width: '100%' }}>
        <div className="inv-trow">
          <span>Theoretical Steel Weight</span>
          <span>{f(projectTotalKg)} kg ({f(projectTotalTonnes, 3)} t)</span>
        </div>
        <div className="inv-trow">
          <span>Order Quantity (incl. {wastagePct}% wastage)</span>
          <span>{f(projectOrderKg)} kg</span>
        </div>
        <div className="inv-trow inv-grand">
          <span>{hasRate ? 'Estimated Cost' : 'Total Members'}</span>
          <span>{hasRate ? `₹ ${f(estimatedCost, 0)}` : project.length}</span>
        </div>
      </div>

      <div className="inv-brand">
        Generated using ARC PEM Free Tools (arcpem.com/tools) — offline project &amp; material tracking for builders
      </div>
    </div>
  )

  const printSheet = project.length > 0 ? projectSheet : scheduleSheet

  return (
    <div className="tool-panel fade-up in">
      <div className="tool-grid2">
        {/* ── Inputs ── */}
        <div className="tf">
          <div className="tf-tabs tf-tabs--sm" role="radiogroup" aria-label="Measurement units">
            {([['mm', 'Millimetres'], ['ftin', 'Feet-inches']] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={unitMode === key}
                className={`tf-tab${unitMode === key ? ' active' : ''}`}
                onClick={() => switchUnits(key)}
              >
                {label}
              </button>
            ))}
          </div>
          {unitNote && <p className="tf-note">{unitNote}</p>}

          <div className="tf-tabs" role="tablist">
            {MEMBERS.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                id={`tf-tab-${m.key}`}
                aria-selected={member === m.key}
                aria-controls="tf-panel"
                className={`tf-tab${member === m.key ? ' active' : ''}`}
                onClick={() => { setMember(m.key); setProjectLabel(defaultLabelFor(m.key, project)) }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {errors.length > 0 && (
            <div className="tool-warning" role="alert">
              <strong>Fix before saving</strong>
              <ul>{errors.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}
          {checks.length > 0 && (
            <div className="tool-warning is-check">
              <strong>Worth a look</strong>
              <ul>{checks.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}

          <div role="tabpanel" id="tf-panel" aria-labelledby={`tf-tab-${member}`} style={{ display: 'contents' }}>
          {member === 'beam' && (
            <>
              <div className="tf-sec-title first">Beam size &amp; cover</div>
              <div className="tf-row">
                <label>Beam Mark (from the drawing)</label>
                <input type="text" value={beam.mark} placeholder="e.g. B7" onChange={(e) => setBeam({ ...beam, mark: e.target.value })} />
                <span className="tf-echo">{beam.mark.trim() ? `Bar marks: ${deriveMarkPrefix(beam.mark, 'B')}-1, ${deriveMarkPrefix(beam.mark, 'B')}-2 …` : 'Optional — used to prefix the bar marks'}</span>
              </div>
              <div className="tf-2col">
                <BBSLengthInput label="Clear Span" value={beam.span} mode={unitMode} bareUnit={LENGTH_FIELDS.beam.span} onChange={(v) => setBeam({ ...beam, span: v })} />
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={beam.cover} onChange={(e) => setBeam({ ...beam, cover: e.target.value })} /></div>
                <BBSLengthInput label="Width" value={beam.width} mode={unitMode} bareUnit={LENGTH_FIELDS.beam.width} onChange={(v) => setBeam({ ...beam, width: v })} />
                <BBSLengthInput label="Overall Depth" value={beam.depth} mode={unitMode} bareUnit={LENGTH_FIELDS.beam.depth} onChange={(v) => setBeam({ ...beam, depth: v })} />
              </div>

              <div className="tf-sec-title">Bottom bars</div>
              <BarSpecRows title="Bottom bar" specs={barSpecsOf(beam.botBars)} onChange={(next) => setBeam({ ...beam, botBars: encodeBarSpecs(next) })} />

              <div className="tf-sec-title">Top bars</div>
              <BarSpecRows title="Top bar" specs={barSpecsOf(beam.topBars)} onChange={(next) => setBeam({ ...beam, topBars: encodeBarSpecs(next) })} />

              <div className="tf-sec-title">Extra top bars over supports</div>
              <p className="tf-note">
                Curtailed bars the drawing shows over a support, with the length it states — e.g.
                2-16&#8960; × 3&#39;-9&quot;. Leave empty if there are none.
              </p>
              <BarSpecRows title="Extra top bar" specs={barSpecsOf(beam.xTopBars)} onChange={(next) => setBeam({ ...beam, xTopBars: encodeBarSpecs(next) })} />
              {barSpecsOf(beam.xTopBars).length > 0 && (
                <>
                  <BBSLengthInput label="Length over support" value={beam.xTopLen} mode={unitMode} bareUnit={LENGTH_FIELDS.beam.xTopLen} onChange={(v) => setBeam({ ...beam, xTopLen: v })} />
                  <label className="tf-check">
                    <input type="checkbox" checked={beam.xTopBoth !== '0'} onChange={(e) => setBeam({ ...beam, xTopBoth: e.target.checked ? '1' : '0' })} />
                    At both supports
                  </label>
                </>
              )}

              <div className="tf-sec-title">Side face bars</div>
              <p className="tf-note">Side reinforcement on a deep beam — e.g. 1-16&#8960; on each face.</p>
              <BarSpecRows title="Face bar" specs={barSpecsOf(beam.faceBars)} onChange={(next) => setBeam({ ...beam, faceBars: encodeBarSpecs(next) })} />
              {barSpecsOf(beam.faceBars).length > 0 && (
                <label className="tf-check">
                  <input type="checkbox" checked={beam.faceBoth !== '0'} onChange={(e) => setBeam({ ...beam, faceBoth: e.target.checked ? '1' : '0' })} />
                  On each face
                </label>
              )}

              <label className="tf-check">
                <input type="checkbox" checked={beam.anchor === '1'} onChange={(e) => setBeam({ ...beam, anchor: e.target.checked ? '1' : '0' })} />
                Main bars anchor into support (adds development length each end)
              </label>
              {beam.anchor === '1' && (
                <div className="tf-row">
                  <label>Development Length Factor (× dia)</label>
                  <input type="number" min="0" value={ldFactor} onChange={(e) => setLdFactor(e.target.value)} />
                </div>
              )}

              <div className="tf-sec-title">Stirrups</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={beam.stirDia} onChange={(e) => setBeam({ ...beam, stirDia: e.target.value })} /></div>
                <BBSLengthInput label="Spacing (elsewhere)" value={beam.stirSpacing} mode={unitMode} bareUnit={LENGTH_FIELDS.beam.stirSpacing} onChange={(v) => setBeam({ ...beam, stirSpacing: v })} />
              </div>
              <p className="tf-note">
                Add a zone for each tightened run near the supports — e.g. @4&quot; over 3&#39;-6&quot;. Zones apply
                at both ends; the spacing above fills the middle. Leave empty for uniform spacing.
              </p>
              <SpacingZoneRows title="Stirrup" zones={zonesOf(beam.stirZones)} mode={unitMode} onChange={(next) => setBeam({ ...beam, stirZones: encodeSpacingZones(next) })} />

              <div className="tf-row"><label>No. of Identical Beams</label><input type="number" min="1" value={beam.nos} onChange={(e) => setBeam({ ...beam, nos: e.target.value })} /></div>
            </>
          )}

          {member === 'column' && (
            <>
              <div className="tf-sec-title first">Column size &amp; cover</div>
              <div className="tf-row">
                <label>Column Mark (from the drawing)</label>
                <input type="text" value={column.mark} placeholder="e.g. C2" onChange={(e) => setColumn({ ...column, mark: e.target.value })} />
                <span className="tf-echo">{column.mark.trim() ? `Bar marks: ${deriveMarkPrefix(column.mark, 'C')}-1, ${deriveMarkPrefix(column.mark, 'C')}-2 …` : 'Optional — used to prefix the bar marks'}</span>
              </div>
              <div className="tf-2col">
                <BBSLengthInput label="Clear Height" value={column.height} mode={unitMode} bareUnit={LENGTH_FIELDS.column.height} onChange={(v) => setColumn({ ...column, height: v })} />
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={column.cover} onChange={(e) => setColumn({ ...column, cover: e.target.value })} /></div>
                <BBSLengthInput label="Width" value={column.width} mode={unitMode} bareUnit={LENGTH_FIELDS.column.width} onChange={(v) => setColumn({ ...column, width: v })} />
                <BBSLengthInput label="Depth" value={column.depth} mode={unitMode} bareUnit={LENGTH_FIELDS.column.depth} onChange={(v) => setColumn({ ...column, depth: v })} />
              </div>

              <div className="tf-sec-title">Main bars</div>
              {decodeLifts(column.lifts).length === 0 && (
                <BarSpecRows title="Main bar" specs={barSpecsOf(column.mainBars)} onChange={(next) => setColumn({ ...column, mainBars: encodeBarSpecs(next) })} />
              )}
              <p className="tf-note">
                A column schedule usually changes the main bars per storey while keeping one tie
                arrangement. Add a lift per level to tabulate them together; leave it empty for a
                single lift.
              </p>
              <ColumnLiftRows lifts={decodeLifts(column.lifts)} mode={unitMode} onChange={(next) => setColumn({ ...column, lifts: encodeLifts(next) })} />

              <label className="tf-check">
                <input type="checkbox" checked={column.lap === '1'} onChange={(e) => setColumn({ ...column, lap: e.target.checked ? '1' : '0' })} />
                Lap main bars into the next lift
              </label>
              {column.lap === '1' && (
                <div className="tf-row">
                  <label>Lap Length Factor (× dia)</label>
                  <input type="number" min="0" value={lapFactor} onChange={(e) => setLapFactor(e.target.value)} />
                </div>
              )}

              <div className="tf-sec-title">Ties</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={column.tieDia} onChange={(e) => setColumn({ ...column, tieDia: e.target.value })} /></div>
                <BBSLengthInput label="Spacing (elsewhere)" value={column.tieSpacing} mode={unitMode} bareUnit={LENGTH_FIELDS.column.tieSpacing} onChange={(v) => setColumn({ ...column, tieSpacing: v })} />
              </div>
              <p className="tf-note">
                Add a zone for each tightened run at the ends — e.g. @75 in the ductile zone. Zones apply at
                both ends; the spacing above fills the middle.
              </p>
              <SpacingZoneRows title="Tie" zones={zonesOf(column.tieZones)} mode={unitMode} onChange={(next) => setColumn({ ...column, tieZones: encodeSpacingZones(next) })} />

              <div className="tf-sec-title">Inner / cross ties</div>
              <p className="tf-note">
                State the inner tie&#39;s own internal size from the drawing — the tool never infers it
                from the bar arrangement, which it doesn&#39;t ask for. Counted at the same spacing as
                the outer tie.
              </p>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={column.innerDia} onChange={(e) => setColumn({ ...column, innerDia: e.target.value })} /></div>
                <div />
                <BBSLengthInput label="Internal a" value={column.innerA} mode={unitMode} bareUnit={LENGTH_FIELDS.column.innerA} onChange={(v) => setColumn({ ...column, innerA: v })} />
                <BBSLengthInput label="Internal b" value={column.innerB} mode={unitMode} bareUnit={LENGTH_FIELDS.column.innerB} onChange={(v) => setColumn({ ...column, innerB: v })} />
              </div>

              <div className="tf-row"><label>No. of Identical Columns</label><input type="number" min="1" value={column.nos} onChange={(e) => setColumn({ ...column, nos: e.target.value })} /></div>
            </>
          )}

          {member === 'slab' && (
            <>
              <div className="tf-sec-title first">Slab span &amp; cover</div>
              <div className="tf-row">
                <label>Slab Mark (from the drawing)</label>
                <input type="text" value={slab.mark} placeholder="e.g. S3" onChange={(e) => setSlab({ ...slab, mark: e.target.value })} />
                <span className="tf-echo">{slab.mark.trim() ? `Bar marks: ${deriveMarkPrefix(slab.mark, 'S')}-1, ${deriveMarkPrefix(slab.mark, 'S')}-2 …` : 'Optional — used to prefix the bar marks'}</span>
              </div>
              <div className="tf-row">
                <label>Slab Type</label>
                <select value={slab.type} onChange={(e) => setSlab({ ...slab, type: e.target.value })}>
                  <option value="oneway">One-way slab</option>
                  <option value="twoway">Two-way slab</option>
                </select>
              </div>
              <div className="tf-2col">
                <BBSLengthInput label="Short Span" value={slab.shortSpan} mode={unitMode} bareUnit={LENGTH_FIELDS.slab.shortSpan} onChange={(v) => setSlab({ ...slab, shortSpan: v })} />
                <BBSLengthInput label="Long Span" value={slab.longSpan} mode={unitMode} bareUnit={LENGTH_FIELDS.slab.longSpan} onChange={(v) => setSlab({ ...slab, longSpan: v })} />
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={slab.cover} onChange={(e) => setSlab({ ...slab, cover: e.target.value })} /></div>
                <div className="tf-row"><label>No. of Panels</label><input type="number" min="1" value={slab.nos} onChange={(e) => setSlab({ ...slab, nos: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Main bars (across short span)</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={slab.mainDia} onChange={(e) => setSlab({ ...slab, mainDia: e.target.value })} /></div>
                <BBSLengthInput label="Spacing" value={slab.mainSpacing} mode={unitMode} bareUnit={LENGTH_FIELDS.slab.mainSpacing} onChange={(v) => setSlab({ ...slab, mainSpacing: v })} />
              </div>
              <div className="tf-row">
                <label>Development Length Factor (× dia)</label>
                <input type="number" min="0" value={ldFactor} onChange={(e) => setLdFactor(e.target.value)} />
              </div>

              <div className="tf-sec-title">Top bars over supports</div>
              <p className="tf-note">
                Negative-moment steel over the supporting beams, at the length the drawing states —
                e.g. 10&#8960; @ 150 × 2&#39;-3&quot;. Leave empty if the panel has none.
              </p>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={slab.topDia} onChange={(e) => setSlab({ ...slab, topDia: e.target.value })} /></div>
                <div className="tf-row"><label>Supported Edges</label><input type="number" min="1" max="4" value={slab.topEdges} onChange={(e) => setSlab({ ...slab, topEdges: e.target.value })} /></div>
                <BBSLengthInput label="Spacing" value={slab.topSpacing} mode={unitMode} bareUnit={LENGTH_FIELDS.slab.topSpacing} onChange={(v) => setSlab({ ...slab, topSpacing: v })} />
                <BBSLengthInput label="Length each bar" value={slab.topLen} mode={unitMode} bareUnit={LENGTH_FIELDS.slab.topLen} onChange={(v) => setSlab({ ...slab, topLen: v })} />
              </div>

              <div className="tf-sec-title">Distribution bars</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={slab.distDia} onChange={(e) => setSlab({ ...slab, distDia: e.target.value })} /></div>
                <BBSLengthInput label="Spacing" value={slab.distSpacing} mode={unitMode} bareUnit={LENGTH_FIELDS.slab.distSpacing} onChange={(v) => setSlab({ ...slab, distSpacing: v })} />
              </div>
            </>
          )}

          {member === 'footing' && (
            <>
              <div className="tf-sec-title first">Footing size &amp; cover</div>
              <div className="tf-row">
                <label>Footing Mark (from the drawing)</label>
                <input type="text" value={footing.mark} placeholder="e.g. F1" onChange={(e) => setFooting({ ...footing, mark: e.target.value })} />
                <span className="tf-echo">{footing.mark.trim() ? `Bar marks: ${deriveMarkPrefix(footing.mark, 'F')}-1, ${deriveMarkPrefix(footing.mark, 'F')}-2 …` : 'Optional — used to prefix the bar marks'}</span>
              </div>
              <div className="tf-2col">
                <BBSLengthInput label="Length" value={footing.length} mode={unitMode} bareUnit={LENGTH_FIELDS.footing.length} onChange={(v) => setFooting({ ...footing, length: v })} />
                <BBSLengthInput label="Width" value={footing.width} mode={unitMode} bareUnit={LENGTH_FIELDS.footing.width} onChange={(v) => setFooting({ ...footing, width: v })} />
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={footing.cover} onChange={(e) => setFooting({ ...footing, cover: e.target.value })} /></div>
                <div className="tf-row"><label>No. of Footings</label><input type="number" min="1" value={footing.nos} onChange={(e) => setFooting({ ...footing, nos: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Bars along length</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={footing.dir1Dia} onChange={(e) => setFooting({ ...footing, dir1Dia: e.target.value })} /></div>
                <BBSLengthInput label="Spacing" value={footing.dir1Spacing} mode={unitMode} bareUnit={LENGTH_FIELDS.footing.dir1Spacing} onChange={(v) => setFooting({ ...footing, dir1Spacing: v })} />
              </div>

              <div className="tf-sec-title">Bars along width</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={footing.dir2Dia} onChange={(e) => setFooting({ ...footing, dir2Dia: e.target.value })} /></div>
                <BBSLengthInput label="Spacing" value={footing.dir2Spacing} mode={unitMode} bareUnit={LENGTH_FIELDS.footing.dir2Spacing} onChange={(v) => setFooting({ ...footing, dir2Spacing: v })} />
              </div>
            </>
          )}
          </div>

          <p className="tf-note">
            {unitMode === 'ftin'
              ? 'Spans and sections in feet-inches — type them as the drawing writes them (15\'-4½", 9", @4"). Bar diameters and clear cover are always in millimetres.'
              : 'All dimensions in millimetres. You can still paste feet-inch values like 3\'-6" into any length field.'}
          </p>
        </div>

        {/* ── Results ── */}
        <div>
          <div className="tr-big" aria-live="polite" aria-atomic="true">
            <div className="tr-big-label">Total Steel Weight — {memberLabel}</div>
            <div className="tr-big-num">{has ? `${f(result.totalKg)} kg` : '—'}</div>
            <div className="tr-big-sub">
              {has ? `= ${f(result.totalTonnes, 3)} tonnes across ${result.rows.length} bar mark${result.rows.length > 1 ? 's' : ''}` : 'Enter member details to calculate'}
            </div>
          </div>

          {diagrams.map((d, k) => <MemberFigure key={`${d.variant}-${k}`} diagram={d} caption={diagramCaption(memberInputs, d)} />)}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, margin: '16px 0', flexWrap: 'wrap' }}>
            <button type="button" className="share-link-btn" onClick={() => window.print()}>
              <PrinterIcon size={15} color="currentColor" />
              {project.length > 0 ? 'Download Project PDF' : 'Download PDF'}
            </button>
            <ShareButton />
          </div>

          <div className="save-name-row" style={{ marginBottom: 16 }}>
            <input
              type="text"
              value={projectLabel}
              onChange={(e) => setProjectLabel(e.target.value)}
              placeholder={defaultLabelFor(member, project)}
              onKeyDown={(e) => { if (e.key === 'Enter' && has && errors.length === 0) addToProject() }}
              aria-label="Member label"
            />
            <button type="button" className="btn btn-primary btn-sm" disabled={!has || errors.length > 0} onClick={addToProject}>
              Add to Project
            </button>
          </div>

          <div className="tool-table-wrap">
            <table className="tool-table">
              <thead>
                <tr>
                  <th scope="col">Mark</th>
                  <th scope="col">Description</th>
                  <th scope="col" className="num">Dia</th>
                  <th scope="col">Shape</th>
                  <th scope="col" className="num">Cut. Length</th>
                  <th scope="col" className="num">Nos</th>
                  <th scope="col" className="num">Total Wt</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.mark}>
                    <td>{r.mark}</td>
                    <td>{r.desc}</td>
                    <td className="num">{r.diaMm} mm</td>
                    <td><BarShapeCell row={r} /></td>
                    <td className="num">{f(r.cuttingLengthMm, 0)} mm</td>
                    <td className="num">{r.nos}</td>
                    <td className="num">{f(r.totalWtKg)} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mounted && project.length > 0 && (
            <>
              <div className="tf-sec-title">Project Schedule ({project.length} member{project.length > 1 ? 's' : ''})</div>
              <div className="saved-list">
                {project.map((pm) => {
                  const typeLabel = MEMBERS.find((m) => m.key === pm.type)?.label ?? pm.type
                  return (
                    <div className="saved-item" key={pm.id}>
                      <div className="saved-item-info">
                        <div className="saved-item-name">
                          {pm.label} <span className="badge badge-indigo" style={{ marginLeft: 6 }}>{typeLabel}</span>
                        </div>
                        <div className="saved-item-meta">
                          {f(pm.result.totalKg)} kg · {pm.result.rows.length} bar mark{pm.result.rows.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="saved-item-actions">
                        <button type="button" aria-label={`Edit ${pm.label}`} onClick={() => editProjectMember(pm.id)}>Edit</button>
                        <button type="button" className="danger" aria-label={`Remove ${pm.label}`} onClick={() => removeFromProject(pm.id)}>Remove</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="tr-tiles" style={{ marginTop: 16 }}>
                <div className="tr-tile">
                  <div className="tr-tile-label">Total Steel Weight</div>
                  <div className="tr-tile-num">{f(projectTotalKg)}</div>
                  <div className="tr-tile-sub">kg ({f(projectTotalTonnes, 3)} t)</div>
                </div>
                <div className="tr-tile">
                  <div className="tr-tile-label">Order Qty (+{wastagePct}%)</div>
                  <div className="tr-tile-num">{f(projectOrderKg)}</div>
                  <div className="tr-tile-sub">kg to place on order</div>
                </div>
                <div className="tr-tile">
                  <div className="tr-tile-label">{hasRate ? 'Estimated Cost' : 'Members'}</div>
                  <div className="tr-tile-num">{hasRate ? `₹ ${f(estimatedCost, 0)}` : project.length}</div>
                  <div className="tr-tile-sub">{hasRate ? 'at entered rate, incl. wastage' : `member${project.length > 1 ? 's' : ''} added`}</div>
                </div>
              </div>

              <div className="tf-sec-title">Diameter-wise Steel Summary</div>
              <div className="tool-table-wrap">
                <table className="tool-table">
                  <thead>
                    <tr>
                      <th scope="col">Dia</th>
                      <th scope="col" className="num">Total Wt</th>
                      <th scope="col" className="num">Order Qty (+{wastagePct}%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diaSummary.map((d) => (
                      <tr key={d.diaMm}>
                        <td>{d.diaMm} mm</td>
                        <td className="num">{f(d.totalWtKg)} kg</td>
                        <td className="num">{f(d.totalWtKg * wastageMultiplier)} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="tf-sec-title">Cutting plan — nesting into stock bars</div>
              <p className="tf-note">
                How the cut lengths above pack into the bar lengths you buy. Offcut is the steel left
                over after every cut is made — pure arithmetic, so this part is exact.
              </p>
              <div className="tf-2col">
                <div className="tf-row">
                  <label>Stock Bar Length (mm)</label>
                  <input type="number" min="1000" step="500" value={stockLen} onChange={(e) => setStockLen(e.target.value)} />
                  <span className="tf-echo">12 m is standard in India; 9 m and 6 m are also sold.</span>
                </div>
                <div className="tf-row">
                  <label>Stock Bars Needed</label>
                  <input type="text" readOnly value={`${cuttingTotals.bars} bars · ${f(cuttingTotals.offcutKg)} kg offcut`} />
                  <span className="tf-echo">
                    {cuttingTotals.bars === cuttingTotals.lower
                      ? 'Matches the theoretical floor — no plan can do better.'
                      : `Theoretical floor is ${cuttingTotals.lower} bars, ignoring how cuts combine; long bars often can't be paired.`}
                  </span>
                </div>
              </div>
              <div className="tool-table-wrap">
                <table className="tool-table">
                  <thead>
                    <tr>
                      <th scope="col">Dia</th>
                      <th scope="col" className="num">Stock Bars</th>
                      <th scope="col">Cutting Patterns (mm per bar)</th>
                      <th scope="col" className="num">Offcut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuttingPlan.map((r) => (
                      <tr key={r.diaMm}>
                        <td>{r.diaMm} mm</td>
                        <td className="num">{r.barsNeeded}</td>
                        <td>
                          {r.patterns.slice(0, 3).map((p) => (
                            <div key={p.cuts.join('+')} className="bbs-pattern">
                              {p.bars}× &nbsp;{p.cuts.map((c) => f(c, 0)).join(' + ')}
                              {p.offcutMm > 1 && <span className="bbs-pattern-waste"> (+{f(p.offcutMm, 0)} waste)</span>}
                            </div>
                          ))}
                          {r.patterns.length > 3 && <div className="bbs-pattern">+{r.patterns.length - 3} more pattern{r.patterns.length - 3 > 1 ? 's' : ''}</div>}
                          {r.oversizeMm.length > 0 && (
                            <div className="bbs-pattern bbs-pattern-waste">
                              {r.oversizeMm.length} bar{r.oversizeMm.length > 1 ? 's' : ''} longer than stock — needs a lap splice
                            </div>
                          )}
                        </td>
                        <td className="num">{f(r.offcutKg)} kg<br /><span className="bbs-pattern-waste">{f(r.offcutPct, 1)}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="tf-2col">
                <div className="tf-row">
                  <label>Wastage Allowance (%)</label>
                  <input type="number" min="0" step="0.5" value={wastagePct} onChange={(e) => setWastagePct(e.target.value)} />
                </div>
                <div className="tf-row">
                  <label>Steel Rate (₹/kg, optional)</label>
                  <input type="number" min="0" value={ratePerKg} onChange={(e) => setRatePerKg(e.target.value)} placeholder="e.g. 62" />
                </div>
              </div>
              <p className="tf-note">
                Project data is saved only in this browser (localStorage) — nothing is uploaded. Export a
                CSV or PDF as a backup before clearing browser data.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, margin: '16px 0', flexWrap: 'wrap' }}>
                <button type="button" className="share-link-btn" onClick={exportProjectCsv}>
                  <ExportIcon size={15} color="currentColor" />
                  Export CSV
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={clearProject}>
                  Clear Project
                </button>
              </div>
            </>
          )}

          <p className="tool-disclaimer">
            This is a quantity/geometry calculator, not a structural design tool — it does not derive
            development or lap length from concrete/steel grade (IS 456 Table 26); confirm the Ld/lap
            factor against your structural drawing. Stirrup and tie lengths use the standard SP-34
            formula (2×(a+b) + 12×dia, i.e. two 135° hooks less three 90° corner bends) and ignore the
            stirrup bar&apos;s own thickness in the cover offset. Section and plan drawings are generated
            from the dimensions and spacings you entered; for beams and columns the arrangement of bars
            within the section is an assumed depiction, since the tool doesn&apos;t ask for it.
            Modelled: mixed-diameter bar groups, variable stirrup/tie spacing zones, extra top bars
            curtailed over supports, side face bars, per-level column lifts, inner/cross ties and slab
            top steel — each taken from the length or size the drawing states, never derived. Not
            modelled: cranked/bent-up bars, multi-span continuous beams and independently designed
            two-way slab steel. Always verify against your engineer&apos;s BBS before ordering.
          </p>
        </div>
      </div>

      {mounted && createPortal(
        <div className="inv-print-root" aria-hidden="true">{printSheet}</div>,
        document.body,
      )}
    </div>
  )
}
