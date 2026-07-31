'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ShareButton from './ShareButton'
import { ExportIcon, PrinterIcon } from '@/components/icons'
import {
  computeBeam, computeColumn, computeFooting, computeSlab, summarizeByDiameter,
  validateBeamInputs, validateColumnInputs, validateFootingInputs, validateSlabInputs,
  type BbsResult,
} from '@/lib/bbs'

type Member = 'beam' | 'column' | 'slab' | 'footing'

const MEMBERS: { key: Member; label: string }[] = [
  { key: 'beam', label: 'Beam' },
  { key: 'column', label: 'Column' },
  { key: 'slab', label: 'Slab' },
  { key: 'footing', label: 'Footing' },
]

type BeamForm = {
  span: string; width: string; depth: string; cover: string
  botDia: string; botCount: string; topDia: string; topCount: string
  stirDia: string; stirSpacing: string; anchor: string; nos: string
}
const BEAM_DEFAULTS: BeamForm = {
  span: '4000', width: '230', depth: '450', cover: '25',
  botDia: '16', botCount: '4', topDia: '12', topCount: '2',
  stirDia: '8', stirSpacing: '150', anchor: '1', nos: '1',
}

type ColumnForm = {
  height: string; width: string; depth: string; cover: string
  mainDia: string; mainCount: string; tieDia: string; tieSpacing: string
  lap: string; nos: string
}
const COLUMN_DEFAULTS: ColumnForm = {
  height: '3000', width: '230', depth: '230', cover: '40',
  mainDia: '16', mainCount: '6', tieDia: '8', tieSpacing: '150',
  lap: '1', nos: '1',
}

type SlabForm = {
  type: string
  shortSpan: string; longSpan: string; cover: string
  mainDia: string; mainSpacing: string; distDia: string; distSpacing: string
  nos: string
}
const SLAB_DEFAULTS: SlabForm = {
  type: 'oneway', shortSpan: '3000', longSpan: '4000', cover: '20',
  mainDia: '10', mainSpacing: '150', distDia: '8', distSpacing: '200',
  nos: '1',
}

type FootingForm = {
  length: string; width: string; cover: string
  dir1Dia: string; dir1Spacing: string; dir2Dia: string; dir2Spacing: string
  nos: string
}
const FOOTING_DEFAULTS: FootingForm = {
  length: '1500', width: '1500', cover: '50',
  dir1Dia: '12', dir1Spacing: '150', dir2Dia: '12', dir2Spacing: '150',
  nos: '1',
}

function seedGroup<T extends Record<string, string>>(params: URLSearchParams, prefix: string, defaults: T): T {
  const out = { ...defaults }
  for (const k of Object.keys(defaults) as (keyof T)[]) {
    const v = params.get(`${prefix}_${String(k)}`)
    if (v !== null) out[k] = v as T[keyof T]
  }
  return out
}

type ProjectMember = {
  id: string
  type: Member
  label: string
  fields: Record<string, string>
  result: BbsResult
  addedAt: number
}
/** Unlike a capped "recent runs" list, a BBS project must never silently evict entries. */
const PROJECT_KEY = 'arcpem_bbs_project'

function defaultLabelFor(m: Member, list: ProjectMember[]): string {
  const typeLabel = MEMBERS.find((x) => x.key === m)?.label ?? ''
  return `${typeLabel} ${list.filter((p) => p.type === m).length + 1}`
}

export default function BBSCalculator() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [member, setMember] = useState<Member>(() => {
    const m = params.get('member')
    return m === 'column' || m === 'slab' || m === 'footing' ? m : 'beam'
  })
  const [ldFactor, setLdFactor] = useState(() => params.get('ld') ?? '50')
  const [lapFactor, setLapFactor] = useState(() => params.get('lapf') ?? '50')

  const [beam, setBeam] = useState<BeamForm>(() => seedGroup(params, 'b', BEAM_DEFAULTS))
  const [column, setColumn] = useState<ColumnForm>(() => seedGroup(params, 'c', COLUMN_DEFAULTS))
  const [slab, setSlab] = useState<SlabForm>(() => seedGroup(params, 's', SLAB_DEFAULTS))
  const [footing, setFooting] = useState<FootingForm>(() => seedGroup(params, 'f', FOOTING_DEFAULTS))

  const [project, setProject] = useState<ProjectMember[]>([])
  const [projectLabel, setProjectLabel] = useState(() => defaultLabelFor(member, []))
  const [wastagePct, setWastagePct] = useState('3')
  const [ratePerKg, setRatePerKg] = useState('')

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(PROJECT_KEY)
      if (raw) {
        const list: ProjectMember[] = JSON.parse(raw)
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
      for (const [k, v] of Object.entries(beam)) qs.set(`b_${k}`, v)
      for (const [k, v] of Object.entries(column)) qs.set(`c_${k}`, v)
      for (const [k, v] of Object.entries(slab)) qs.set(`s_${k}`, v)
      for (const [k, v] of Object.entries(footing)) qs.set(`f_${k}`, v)
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
    }, 350)
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current) }
  }, [member, ldFactor, lapFactor, beam, column, slab, footing, router, pathname])

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
    return { ...base, ldFactor, lapFactor }
  }

  function addToProject() {
    if (!has || warnings.length > 0) return
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
    const { ldFactor: fLd, lapFactor: fLap, ...rest } = pm.fields
    if (fLd !== undefined) setLdFactor(fLd)
    if (fLap !== undefined) setLapFactor(fLap)
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

  const result: BbsResult = useMemo(() => {
    const ld = n(ldFactor)
    const lap = n(lapFactor)
    switch (member) {
      case 'column':
        return computeColumn({
          clearHeightMm: n(column.height), widthMm: n(column.width), depthMm: n(column.depth), coverMm: n(column.cover),
          mainDiaMm: n(column.mainDia), mainCount: n(column.mainCount), tieDiaMm: n(column.tieDia), tieSpacingMm: n(column.tieSpacing),
          lapToNextLift: column.lap === '1', lapFactor: lap, nos: n(column.nos),
        })
      case 'slab':
        return computeSlab({
          slabType: slab.type === 'twoway' ? 'twoway' : 'oneway',
          shortSpanMm: n(slab.shortSpan), longSpanMm: n(slab.longSpan), coverMm: n(slab.cover),
          mainDiaMm: n(slab.mainDia), mainSpacingMm: n(slab.mainSpacing), distDiaMm: n(slab.distDia), distSpacingMm: n(slab.distSpacing),
          ldFactor: ld, nos: n(slab.nos),
        })
      case 'footing':
        return computeFooting({
          lengthMm: n(footing.length), widthMm: n(footing.width), coverMm: n(footing.cover),
          dir1DiaMm: n(footing.dir1Dia), dir1SpacingMm: n(footing.dir1Spacing),
          dir2DiaMm: n(footing.dir2Dia), dir2SpacingMm: n(footing.dir2Spacing), nos: n(footing.nos),
        })
      case 'beam':
      default:
        return computeBeam({
          clearSpanMm: n(beam.span), widthMm: n(beam.width), depthMm: n(beam.depth), coverMm: n(beam.cover),
          botDiaMm: n(beam.botDia), botCount: n(beam.botCount), topDiaMm: n(beam.topDia), topCount: n(beam.topCount),
          stirDiaMm: n(beam.stirDia), stirSpacingMm: n(beam.stirSpacing), anchorIntoSupport: beam.anchor === '1',
          ldFactor: ld, nos: n(beam.nos),
        })
    }
  }, [member, beam, column, slab, footing, ldFactor, lapFactor])

  const warnings: string[] = useMemo(() => {
    const ld = n(ldFactor)
    const lap = n(lapFactor)
    switch (member) {
      case 'column':
        return validateColumnInputs({
          clearHeightMm: n(column.height), widthMm: n(column.width), depthMm: n(column.depth), coverMm: n(column.cover),
          mainDiaMm: n(column.mainDia), mainCount: n(column.mainCount), tieDiaMm: n(column.tieDia), tieSpacingMm: n(column.tieSpacing),
          lapToNextLift: column.lap === '1', lapFactor: lap, nos: n(column.nos),
        })
      case 'slab':
        return validateSlabInputs({
          slabType: slab.type === 'twoway' ? 'twoway' : 'oneway',
          shortSpanMm: n(slab.shortSpan), longSpanMm: n(slab.longSpan), coverMm: n(slab.cover),
          mainDiaMm: n(slab.mainDia), mainSpacingMm: n(slab.mainSpacing), distDiaMm: n(slab.distDia), distSpacingMm: n(slab.distSpacing),
          ldFactor: ld, nos: n(slab.nos),
        })
      case 'footing':
        return validateFootingInputs({
          lengthMm: n(footing.length), widthMm: n(footing.width), coverMm: n(footing.cover),
          dir1DiaMm: n(footing.dir1Dia), dir1SpacingMm: n(footing.dir1Spacing),
          dir2DiaMm: n(footing.dir2Dia), dir2SpacingMm: n(footing.dir2Spacing), nos: n(footing.nos),
        })
      case 'beam':
      default:
        return validateBeamInputs({
          clearSpanMm: n(beam.span), widthMm: n(beam.width), depthMm: n(beam.depth), coverMm: n(beam.cover),
          botDiaMm: n(beam.botDia), botCount: n(beam.botCount), topDiaMm: n(beam.topDia), topCount: n(beam.topCount),
          stirDiaMm: n(beam.stirDia), stirSpacingMm: n(beam.stirSpacing), anchorIntoSupport: beam.anchor === '1',
          ldFactor: ld, nos: n(beam.nos),
        })
    }
  }, [member, beam, column, slab, footing, ldFactor, lapFactor])

  const has = result.totalKg > 0
  const f = (v: number, d = 2) => v.toLocaleString('en-IN', { maximumFractionDigits: d })
  const memberLabel = MEMBERS.find((m) => m.key === member)?.label ?? ''

  const wastageMultiplier = 1 + (n(wastagePct) || 0) / 100
  const projectTotalKg = useMemo(() => project.reduce((s, p) => s + p.result.totalKg, 0), [project])
  const projectTotalTonnes = projectTotalKg / 1000
  const projectOrderKg = projectTotalKg * wastageMultiplier
  const diaSummary = useMemo(() => summarizeByDiameter(project.map((p) => p.result)), [project])
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

      <table className="inv-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ width: '6%', whiteSpace: 'normal' }}>Mark</th>
            <th style={{ width: '18%', whiteSpace: 'normal' }}>Description</th>
            <th className="num" style={{ width: '8%', whiteSpace: 'normal' }}>Dia (mm)</th>
            <th style={{ width: '15%', whiteSpace: 'normal' }}>Shape</th>
            <th className="num" style={{ width: '13%', whiteSpace: 'normal' }}>Cutting Length (mm)</th>
            <th className="num" style={{ width: '6%', whiteSpace: 'normal' }}>Nos</th>
            <th className="num" style={{ width: '11%', whiteSpace: 'normal' }}>Total Length (m)</th>
            <th className="num" style={{ width: '11%', whiteSpace: 'normal' }}>Unit Wt (kg/m)</th>
            <th className="num" style={{ width: '12%', whiteSpace: 'normal' }}>Total Wt (kg)</th>
          </tr>
        </thead>
        <tbody>
          {result.rows.map((r) => (
            <tr key={r.mark}>
              <td>{r.mark}</td>
              <td>{r.desc}</td>
              <td className="num">{r.diaMm}</td>
              <td>{r.shape}</td>
              <td className="num">{f(r.cuttingLengthMm, 0)}</td>
              <td className="num">{r.nos}</td>
              <td className="num">{f(r.totalLengthM)}</td>
              <td className="num">{f(r.unitWtKgM, 3)}</td>
              <td className="num">{f(r.totalWtKg)}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
        return (
          <div key={pm.id} style={{ marginTop: idx === 0 ? 16 : 22 }}>
            <div className="inv-h">{pm.label} — {typeLabel}</div>
            <table className="inv-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '6%', whiteSpace: 'normal' }}>Mark</th>
                  <th style={{ width: '18%', whiteSpace: 'normal' }}>Description</th>
                  <th className="num" style={{ width: '8%', whiteSpace: 'normal' }}>Dia (mm)</th>
                  <th style={{ width: '15%', whiteSpace: 'normal' }}>Shape</th>
                  <th className="num" style={{ width: '13%', whiteSpace: 'normal' }}>Cutting Length (mm)</th>
                  <th className="num" style={{ width: '6%', whiteSpace: 'normal' }}>Nos</th>
                  <th className="num" style={{ width: '11%', whiteSpace: 'normal' }}>Total Length (m)</th>
                  <th className="num" style={{ width: '11%', whiteSpace: 'normal' }}>Unit Wt (kg/m)</th>
                  <th className="num" style={{ width: '12%', whiteSpace: 'normal' }}>Total Wt (kg)</th>
                </tr>
              </thead>
              <tbody>
                {pm.result.rows.map((r) => (
                  <tr key={r.mark}>
                    <td>{r.mark}</td>
                    <td>{r.desc}</td>
                    <td className="num">{r.diaMm}</td>
                    <td>{r.shape}</td>
                    <td className="num">{f(r.cuttingLengthMm, 0)}</td>
                    <td className="num">{r.nos}</td>
                    <td className="num">{f(r.totalLengthM)}</td>
                    <td className="num">{f(r.unitWtKgM, 3)}</td>
                    <td className="num">{f(r.totalWtKg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

          {warnings.length > 0 && (
            <div className="tool-warning" role="alert">
              <strong>Check these inputs</strong>
              <ul>
                {warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
          )}

          <div role="tabpanel" id="tf-panel" aria-labelledby={`tf-tab-${member}`} style={{ display: 'contents' }}>
          {member === 'beam' && (
            <>
              <div className="tf-sec-title first">Beam size &amp; cover</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Clear Span (mm)</label><input type="number" min="0" value={beam.span} onChange={(e) => setBeam({ ...beam, span: e.target.value })} /></div>
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={beam.cover} onChange={(e) => setBeam({ ...beam, cover: e.target.value })} /></div>
                <div className="tf-row"><label>Width (mm)</label><input type="number" min="0" value={beam.width} onChange={(e) => setBeam({ ...beam, width: e.target.value })} /></div>
                <div className="tf-row"><label>Overall Depth (mm)</label><input type="number" min="0" value={beam.depth} onChange={(e) => setBeam({ ...beam, depth: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Main bars</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Bottom Dia (mm)</label><input type="number" min="0" value={beam.botDia} onChange={(e) => setBeam({ ...beam, botDia: e.target.value })} /></div>
                <div className="tf-row"><label>Bottom Count</label><input type="number" min="0" value={beam.botCount} onChange={(e) => setBeam({ ...beam, botCount: e.target.value })} /></div>
                <div className="tf-row"><label>Top Dia (mm)</label><input type="number" min="0" value={beam.topDia} onChange={(e) => setBeam({ ...beam, topDia: e.target.value })} /></div>
                <div className="tf-row"><label>Top Count</label><input type="number" min="0" value={beam.topCount} onChange={(e) => setBeam({ ...beam, topCount: e.target.value })} /></div>
              </div>
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
                <div className="tf-row"><label>Spacing (mm)</label><input type="number" min="0" value={beam.stirSpacing} onChange={(e) => setBeam({ ...beam, stirSpacing: e.target.value })} /></div>
              </div>
              <div className="tf-row"><label>No. of Identical Beams</label><input type="number" min="1" value={beam.nos} onChange={(e) => setBeam({ ...beam, nos: e.target.value })} /></div>
            </>
          )}

          {member === 'column' && (
            <>
              <div className="tf-sec-title first">Column size &amp; cover</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Clear Height (mm)</label><input type="number" min="0" value={column.height} onChange={(e) => setColumn({ ...column, height: e.target.value })} /></div>
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={column.cover} onChange={(e) => setColumn({ ...column, cover: e.target.value })} /></div>
                <div className="tf-row"><label>Width (mm)</label><input type="number" min="0" value={column.width} onChange={(e) => setColumn({ ...column, width: e.target.value })} /></div>
                <div className="tf-row"><label>Depth (mm)</label><input type="number" min="0" value={column.depth} onChange={(e) => setColumn({ ...column, depth: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Main bars</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={column.mainDia} onChange={(e) => setColumn({ ...column, mainDia: e.target.value })} /></div>
                <div className="tf-row"><label>Count</label><input type="number" min="0" value={column.mainCount} onChange={(e) => setColumn({ ...column, mainCount: e.target.value })} /></div>
              </div>
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
                <div className="tf-row"><label>Spacing (mm)</label><input type="number" min="0" value={column.tieSpacing} onChange={(e) => setColumn({ ...column, tieSpacing: e.target.value })} /></div>
              </div>
              <div className="tf-row"><label>No. of Identical Columns</label><input type="number" min="1" value={column.nos} onChange={(e) => setColumn({ ...column, nos: e.target.value })} /></div>
            </>
          )}

          {member === 'slab' && (
            <>
              <div className="tf-sec-title first">Slab span &amp; cover</div>
              <div className="tf-row">
                <label>Slab Type</label>
                <select value={slab.type} onChange={(e) => setSlab({ ...slab, type: e.target.value })}>
                  <option value="oneway">One-way slab</option>
                  <option value="twoway">Two-way slab</option>
                </select>
              </div>
              <div className="tf-2col">
                <div className="tf-row"><label>Short Span (mm)</label><input type="number" min="0" value={slab.shortSpan} onChange={(e) => setSlab({ ...slab, shortSpan: e.target.value })} /></div>
                <div className="tf-row"><label>Long Span (mm)</label><input type="number" min="0" value={slab.longSpan} onChange={(e) => setSlab({ ...slab, longSpan: e.target.value })} /></div>
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={slab.cover} onChange={(e) => setSlab({ ...slab, cover: e.target.value })} /></div>
                <div className="tf-row"><label>No. of Panels</label><input type="number" min="1" value={slab.nos} onChange={(e) => setSlab({ ...slab, nos: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Main bars (across short span)</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={slab.mainDia} onChange={(e) => setSlab({ ...slab, mainDia: e.target.value })} /></div>
                <div className="tf-row"><label>Spacing (mm)</label><input type="number" min="0" value={slab.mainSpacing} onChange={(e) => setSlab({ ...slab, mainSpacing: e.target.value })} /></div>
              </div>
              <div className="tf-row">
                <label>Development Length Factor (× dia)</label>
                <input type="number" min="0" value={ldFactor} onChange={(e) => setLdFactor(e.target.value)} />
              </div>

              <div className="tf-sec-title">Distribution bars</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={slab.distDia} onChange={(e) => setSlab({ ...slab, distDia: e.target.value })} /></div>
                <div className="tf-row"><label>Spacing (mm)</label><input type="number" min="0" value={slab.distSpacing} onChange={(e) => setSlab({ ...slab, distSpacing: e.target.value })} /></div>
              </div>
            </>
          )}

          {member === 'footing' && (
            <>
              <div className="tf-sec-title first">Footing size &amp; cover</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Length (mm)</label><input type="number" min="0" value={footing.length} onChange={(e) => setFooting({ ...footing, length: e.target.value })} /></div>
                <div className="tf-row"><label>Width (mm)</label><input type="number" min="0" value={footing.width} onChange={(e) => setFooting({ ...footing, width: e.target.value })} /></div>
                <div className="tf-row"><label>Clear Cover (mm)</label><input type="number" min="0" value={footing.cover} onChange={(e) => setFooting({ ...footing, cover: e.target.value })} /></div>
                <div className="tf-row"><label>No. of Footings</label><input type="number" min="1" value={footing.nos} onChange={(e) => setFooting({ ...footing, nos: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Bars along length</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={footing.dir1Dia} onChange={(e) => setFooting({ ...footing, dir1Dia: e.target.value })} /></div>
                <div className="tf-row"><label>Spacing (mm)</label><input type="number" min="0" value={footing.dir1Spacing} onChange={(e) => setFooting({ ...footing, dir1Spacing: e.target.value })} /></div>
              </div>

              <div className="tf-sec-title">Bars along width</div>
              <div className="tf-2col">
                <div className="tf-row"><label>Dia (mm)</label><input type="number" min="0" value={footing.dir2Dia} onChange={(e) => setFooting({ ...footing, dir2Dia: e.target.value })} /></div>
                <div className="tf-row"><label>Spacing (mm)</label><input type="number" min="0" value={footing.dir2Spacing} onChange={(e) => setFooting({ ...footing, dir2Spacing: e.target.value })} /></div>
              </div>
            </>
          )}
          </div>

          <p className="tf-note">All dimensions in millimetres (mm), as per standard structural drawings.</p>
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
              onKeyDown={(e) => { if (e.key === 'Enter' && has && warnings.length === 0) addToProject() }}
              aria-label="Member label"
            />
            <button type="button" className="btn btn-primary btn-sm" disabled={!has || warnings.length > 0} onClick={addToProject}>
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
                    <td>{r.shape}</td>
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
            stirrup bar&apos;s own thickness in the cover offset. Cranked/bent-up bars, multi-span
            continuous beams, true two-way slab reinforcement and custom bar marks aren&apos;t modelled —
            for anything beyond a straightforward single member, verify against your engineer&apos;s BBS.
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
