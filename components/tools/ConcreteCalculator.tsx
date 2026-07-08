'use client'

import { useMemo, useState } from 'react'

/** Nominal mix proportions — cement : sand : aggregate. */
const GRADES = {
  M10: { c: 1, s: 3, a: 6, use: 'Levelling course, non-structural beds' },
  M15: { c: 1, s: 2, a: 4, use: 'PCC, flooring base' },
  M20: { c: 1, s: 1.5, a: 3, use: 'Slabs, beams, columns (residential RCC)' },
  M25: { c: 1, s: 1, a: 2, use: 'Footings, structural members' },
} as const

type GradeKey = keyof typeof GRADES

const DRY_FACTOR = 1.54          // wet → dry volume
const BAG_VOLUME_M3 = 0.0347     // one 50 kg cement bag
const M3_TO_CFT = 35.3147
const FT3_TO_M3 = 1 / 35.3147
const SAND_T_PER_M3 = 1.6        // dry river sand bulk density
const AGG_T_PER_M3 = 1.45        // 20 mm coarse aggregate bulk density

export default function ConcreteCalculator() {
  const [shape, setShape] = useState<'rect' | 'round'>('rect')
  const [unit, setUnit] = useState<'m' | 'ft'>('ft')
  const [dims, setDims] = useState({ length: '10', width: '10', depth: '0.5', dia: '1.25', height: '10' })
  const [count, setCount] = useState('1')
  const [grade, setGrade] = useState<GradeKey>('M20')

  const r = useMemo(() => {
    const n = (v: string) => parseFloat(v) || 0
    const toM3 = unit === 'ft' ? FT3_TO_M3 : 1
    const qty = Math.max(1, Math.round(n(count) || 1))

    const rawVolume =
      shape === 'rect'
        ? n(dims.length) * n(dims.width) * n(dims.depth)
        : (Math.PI / 4) * n(dims.dia) ** 2 * n(dims.height)

    const wet = rawVolume * toM3 * qty
    const dry = wet * DRY_FACTOR
    const g = GRADES[grade]
    const sum = g.c + g.s + g.a

    const cementM3 = (dry * g.c) / sum
    const bags = cementM3 / BAG_VOLUME_M3
    const cementKg = bags * 50
    const sandM3 = (dry * g.s) / sum
    const aggM3 = (dry * g.a) / sum
    const waterL = cementKg * 0.5 // w/c ratio ≈ 0.5

    return { wet, dry, bags, cementKg, sandM3, aggM3, waterL }
  }, [shape, unit, dims, count, grade])

  const has = r.wet > 0
  const f = (n: number, d = 2) => n.toLocaleString('en-IN', { maximumFractionDigits: d })
  const g = GRADES[grade]

  return (
    <div className="tool-panel fade-up in">
      <div className="tool-grid2">
        {/* ── Inputs ── */}
        <div className="tf">
          <div className="tf-sec-title first">Element &amp; size</div>
          <div className="tf-row">
            <label>Element Shape</label>
            <select value={shape} onChange={(e) => setShape(e.target.value as 'rect' | 'round')}>
              <option value="rect">Slab / Beam / Footing / Rect. column (L × B × D)</option>
              <option value="round">Circular column (dia × height)</option>
            </select>
          </div>
          <div className="tf-row">
            <label>Measurement Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value as 'm' | 'ft')}>
              <option value="ft">feet</option>
              <option value="m">metres</option>
            </select>
          </div>
          {shape === 'rect' ? (
            <div className="tf-2col">
              <div className="tf-row">
                <label>Length ({unit})</label>
                <input type="number" min="0" value={dims.length} onChange={(e) => setDims({ ...dims, length: e.target.value })} />
              </div>
              <div className="tf-row">
                <label>Width / Breadth ({unit})</label>
                <input type="number" min="0" value={dims.width} onChange={(e) => setDims({ ...dims, width: e.target.value })} />
              </div>
              <div className="tf-row">
                <label>Depth / Thickness ({unit})</label>
                <input type="number" min="0" step="0.05" value={dims.depth} onChange={(e) => setDims({ ...dims, depth: e.target.value })} />
              </div>
              <div className="tf-row">
                <label>Count (nos)</label>
                <input type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
            </div>
          ) : (
            <div className="tf-2col">
              <div className="tf-row">
                <label>Diameter ({unit})</label>
                <input type="number" min="0" step="0.05" value={dims.dia} onChange={(e) => setDims({ ...dims, dia: e.target.value })} />
              </div>
              <div className="tf-row">
                <label>Height ({unit})</label>
                <input type="number" min="0" value={dims.height} onChange={(e) => setDims({ ...dims, height: e.target.value })} />
              </div>
              <div className="tf-row">
                <label>Count (nos)</label>
                <input type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} />
              </div>
            </div>
          )}
          <div className="tf-row">
            <label>Concrete Grade</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value as GradeKey)}>
              {(Object.keys(GRADES) as GradeKey[]).map((k) => {
                const gr = GRADES[k]
                return (
                  <option key={k} value={k}>
                    {k} — 1 : {gr.s} : {gr.a}
                  </option>
                )
              })}
            </select>
          </div>
          <p className="tf-note">
            {grade} = 1 : {g.s} : {g.a} (cement : sand : aggregate) — {g.use.toLowerCase()}.
            A tip for site orders: 1 bag cement = 50 kg = 1.226 cft.
          </p>
        </div>

        {/* ── Results ── */}
        <div>
          <div className="tr-big">
            <div className="tr-big-label">Wet Concrete Volume</div>
            <div className="tr-big-num">{has ? `${f(r.wet)} m³` : '—'}</div>
            <div className="tr-big-sub">
              {has ? `= ${f(r.wet * M3_TO_CFT, 1)} cft · dry volume ${f(r.dry)} m³ (× 1.54)` : 'Enter dimensions to calculate'}
            </div>
          </div>

          <div className="tr-tiles">
            <div className="tr-tile">
              <div className="tr-tile-label">Cement</div>
              <div className="tr-tile-num">{has ? `${f(r.bags, 1)} bags` : '—'}</div>
              <div className="tr-tile-sub">{has ? `≈ ${f(r.cementKg, 0)} kg (50 kg bags)` : ''}</div>
            </div>
            <div className="tr-tile">
              <div className="tr-tile-label">Sand</div>
              <div className="tr-tile-num">{has ? `${f(r.sandM3 * M3_TO_CFT, 1)} cft` : '—'}</div>
              <div className="tr-tile-sub">{has ? `${f(r.sandM3)} m³ ≈ ${f(r.sandM3 * SAND_T_PER_M3)} t` : ''}</div>
            </div>
            <div className="tr-tile">
              <div className="tr-tile-label">Aggregate</div>
              <div className="tr-tile-num">{has ? `${f(r.aggM3 * M3_TO_CFT, 1)} cft` : '—'}</div>
              <div className="tr-tile-sub">{has ? `${f(r.aggM3)} m³ ≈ ${f(r.aggM3 * AGG_T_PER_M3)} t` : ''}</div>
            </div>
            <div className="tr-tile">
              <div className="tr-tile-label">Water</div>
              <div className="tr-tile-num">{has ? `${f(r.waterL, 0)} L` : '—'}</div>
              <div className="tr-tile-sub">at w/c ratio ≈ 0.5</div>
            </div>
          </div>

          <p className="tool-disclaimer">
            Quantities use the standard nominal-mix method: dry volume = wet volume × 1.54, split in
            the {grade} ratio, with 1 bag = 0.0347 m³. Add 2–5% extra for wastage. For structural work
            above M25, use a lab-designed mix instead of nominal proportions.
          </p>
        </div>
      </div>
    </div>
  )
}
