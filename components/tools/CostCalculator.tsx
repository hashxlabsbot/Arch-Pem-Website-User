'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ShareButton from './ShareButton'
import { PrinterIcon, SaveIcon, CompareIcon } from '@/components/icons'

/** 2026 pan-India base rates (₹ per sq ft of built-up area, structure + finishing). */
const QUALITY = {
  basic: { label: 'Basic — simple, functional finishes', rate: 1800 },
  standard: { label: 'Standard — good branded materials', rate: 2200 },
  premium: { label: 'Premium — high-end fittings & finishes', rate: 2700 },
  luxury: { label: 'Luxury — designer / imported finishes', rate: 3300 },
} as const

const LOCATION = {
  metro: { label: 'Metro city (Mumbai, Delhi NCR, Bengaluru…)', mult: 1.15 },
  tier2: { label: 'Tier-2 city (Pune, Jaipur, Indore, Lucknow…)', mult: 1.0 },
  tier3: { label: 'Tier-3 city / town / rural', mult: 0.88 },
} as const

/** Typical share of total cost for an Indian residential build, paired with a chart colour. */
const BREAKDOWN: Array<[string, number, string]> = [
  ['Structure & masonry (RCC, walls, plaster)', 0.42, '#4f46e5'],
  ['Finishing (flooring, tiles, paint, kitchen)', 0.28, '#0ea5e9'],
  ['Electrical & plumbing', 0.14, '#10b981'],
  ['Doors & windows', 0.09, '#f59e0b'],
  ['Site work & miscellaneous', 0.07, '#8b5cf6'],
]

/** Widely used thumb rules — quantity per sq ft of built-up area (RCC framed). */
const MATERIALS: Array<[string, number, string]> = [
  ['Cement', 0.4, 'bags (50 kg)'],
  ['Steel (TMT)', 4.0, 'kg'],
  ['Sand', 1.35, 'cft'],
  ['Aggregate', 1.35, 'cft'],
  ['Bricks', 8, 'nos'],
  ['Paint', 0.18, 'litres'],
]

type QualityKey = keyof typeof QUALITY
type LocationKey = keyof typeof LOCATION

type SavedEstimate = {
  id: string
  name: string
  area: string
  unit: 'sqft' | 'sqm'
  floors: number
  quality: QualityKey
  location: LocationKey
  low: number
  high: number
  totalSqft: number
  savedAt: number
}

const SAVE_KEY = 'arcpem_cost_estimates'
const MAX_SAVED = 12

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN')

/** ₹ formatted the way Indian builders read money: 24.5 Lakh / 1.2 Cr. */
function fmtMoney(n: number): string {
  if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(1)} Lakh`
  return `₹ ${fmtInt(n)}`
}

export default function CostCalculator() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [area, setArea] = useState(() => params.get('area') ?? '1000')
  const [unit, setUnit] = useState<'sqft' | 'sqm'>(() => (params.get('unit') === 'sqm' ? 'sqm' : 'sqft'))
  const [floors, setFloors] = useState(() => {
    const f = Number(params.get('floors'))
    return f >= 1 && f <= 5 ? f : 1
  })
  const [quality, setQuality] = useState<QualityKey>(() => {
    const q = params.get('quality')
    return q && q in QUALITY ? (q as QualityKey) : 'standard'
  })
  const [location, setLocation] = useState<LocationKey>(() => {
    const l = params.get('location')
    return l && l in LOCATION ? (l as LocationKey) : 'tier2'
  })

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Debounced URL sync — lets a contractor share a link that reproduces this exact estimate.
  const syncTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const qs = new URLSearchParams({ area, unit, floors: String(floors), quality, location })
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false })
    }, 350)
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current) }
  }, [area, unit, floors, quality, location, router, pathname])

  const r = useMemo(() => {
    const perFloor = (parseFloat(area) || 0) * (unit === 'sqm' ? 10.764 : 1)
    const totalSqft = perFloor * floors
    const rate = QUALITY[quality].rate * LOCATION[location].mult
    const cost = totalSqft * rate
    return { totalSqft, rate, cost, low: cost * 0.92, high: cost * 1.08 }
  }, [area, unit, floors, quality, location])

  const hasInput = r.totalSqft > 0

  const pieGradient = useMemo(() => {
    let acc = 0
    const stops = BREAKDOWN.map(([, share, color]) => {
      const from = acc * 100
      acc += share
      return `${color} ${from}% ${acc * 100}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [])

  // ── Plot-based input: work out built-up area from plot size + FSI instead ──
  const [plotMode, setPlotMode] = useState(false)
  const [plotArea, setPlotArea] = useState('1200')
  const [fsi, setFsi] = useState('1.5')
  const [coverage, setCoverage] = useState('65')
  const [justApplied, setJustApplied] = useState(false)

  const plot = useMemo(() => {
    const plotSqft = (parseFloat(plotArea) || 0) * (unit === 'sqm' ? 10.764 : 1)
    const fsiNum = parseFloat(fsi) || 0
    const covNum = (parseFloat(coverage) || 0) / 100
    const maxBuildable = plotSqft * fsiNum
    const groundFootprint = plotSqft * covNum
    const suggestedFloors = groundFootprint > 0
      ? Math.max(1, Math.min(5, Math.round(maxBuildable / groundFootprint)))
      : 1
    const perFloorArea = suggestedFloors > 0 ? maxBuildable / suggestedFloors : 0
    return { plotSqft, maxBuildable, groundFootprint, suggestedFloors, perFloorArea }
  }, [plotArea, fsi, coverage, unit])

  function applyPlotResult() {
    setArea(String(Math.round(plot.perFloorArea)))
    setFloors(plot.suggestedFloors)
    setJustApplied(true)
    setTimeout(() => setJustApplied(false), 2200)
  }

  // ── Save & compare estimates (stored locally on this device) ──
  const [saved, setSaved] = useState<SavedEstimate[]>([])
  const [namingOpen, setNamingOpen] = useState(false)
  const [estimateName, setEstimateName] = useState('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (raw) setSaved(JSON.parse(raw))
    } catch {
      /* corrupted storage — start fresh */
    }
  }, [])

  function persist(list: SavedEstimate[]) {
    setSaved(list)
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(list))
    } catch {
      /* storage full / blocked — non-fatal */
    }
  }

  function saveCurrent() {
    const name = estimateName.trim() || `Estimate ${saved.length + 1}`
    const entry: SavedEstimate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name, area, unit, floors, quality, location,
      low: r.low, high: r.high, totalSqft: r.totalSqft,
      savedAt: Date.now(),
    }
    persist([entry, ...saved].slice(0, MAX_SAVED))
    setEstimateName('')
    setNamingOpen(false)
  }

  function loadEstimate(est: SavedEstimate) {
    setArea(est.area); setUnit(est.unit); setFloors(est.floors)
    setQuality(est.quality); setLocation(est.location)
  }

  function deleteEstimate(id: string) {
    persist(saved.filter((s) => s.id !== id))
  }

  // ── Printable report (portalled to <body> so print yields exactly one clean page) ──
  const reportSheet = (
    <div className="inv-sheet">
      <div className="inv-top">
        <div style={{ maxWidth: '60%' }}>
          <div className="inv-firm-name">Construction Cost Estimate</div>
          <div className="inv-muted">Generated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="inv-title">ESTIMATE</div>
          <div className="inv-muted">arcpem.com/tools</div>
        </div>
      </div>

      <div className="inv-cols">
        <div>
          <div className="inv-h">Building</div>
          <div className="inv-strong">{fmtInt(r.totalSqft)} sq ft total built-up · {floors} floor{floors > 1 ? 's' : ''}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="inv-h">Quality &amp; Location</div>
          <div className="inv-muted">{QUALITY[quality].label.split(' — ')[0]} · {LOCATION[location].label.split(' (')[0]}</div>
        </div>
      </div>

      <div className="inv-totals" style={{ marginLeft: 0, width: '100%' }}>
        <div className="inv-trow">
          <span>Rate applied</span>
          <span>₹ {fmtInt(r.rate)} / sq ft</span>
        </div>
        <div className="inv-trow inv-grand">
          <span>Estimated Cost Range</span>
          <span>{fmtMoney(r.low)} – {fmtMoney(r.high)}</span>
        </div>
      </div>

      <div className="inv-h" style={{ marginTop: 16 }}>Cost Breakdown</div>
      <table className="inv-table">
        <thead>
          <tr>
            <th>Head</th>
            <th className="num">Share</th>
            <th className="num">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {BREAKDOWN.map(([head, share]) => (
            <tr key={head}>
              <td>{head}</td>
              <td className="num">{Math.round(share * 100)}%</td>
              <td className="num">{fmtMoney(r.cost * share)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-h" style={{ marginTop: 16 }}>Material Quantities (approx.)</div>
      <table className="inv-table">
        <thead>
          <tr>
            <th>Material</th>
            <th className="num">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {MATERIALS.map(([name, perSqft, unitLabel]) => (
            <tr key={name}>
              <td>{name}</td>
              <td className="num">{fmtInt(r.totalSqft * perSqft)} {unitLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="inv-muted" style={{ marginTop: 14, lineHeight: 1.6 }}>
        Planning-stage estimate based on typical 2026 market rates and standard thumb rules for RCC
        framed residential construction. Actual cost varies with design, soil, material choices and
        local labour rates — get a detailed BOQ prepared before you build. Land, approvals,
        interiors/furniture and architect fees are not included.
      </p>

      <div className="inv-brand">
        Generated using ARC PEM Free Tools (arcpem.com/tools) — expense &amp; budget tracking software for builders
      </div>
    </div>
  )

  return (
    <div className="tool-panel fade-up in">
      <div className="tool-grid2">
        {/* ── Inputs ── */}
        <div className="tf">
          <div className="tf-sec-title first">Your building</div>

          {!plotMode ? (
            <>
              <div className="tf-2col">
                <div className="tf-row">
                  <label>Built-up Area (per floor)</label>
                  <input type="number" min="0" value={area} onChange={(e) => setArea(e.target.value)} placeholder="1000" />
                </div>
                <div className="tf-row">
                  <label>Unit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value as 'sqft' | 'sqm')}>
                    <option value="sqft">sq ft</option>
                    <option value="sqm">sq m</option>
                  </select>
                </div>
              </div>
              <button type="button" className="plot-toggle-link" onClick={() => setPlotMode(true)}>
                Don&apos;t know your built-up area? Calculate from plot size →
              </button>
            </>
          ) : (
            <div className="plot-panel">
              <div className="plot-panel-head">
                <span>Calculate from plot size</span>
                <button type="button" className="plot-panel-close" onClick={() => setPlotMode(false)} aria-label="Close">✕</button>
              </div>
              <div className="tf-2col">
                <div className="tf-row">
                  <label>Plot Area ({unit})</label>
                  <input type="number" min="0" value={plotArea} onChange={(e) => setPlotArea(e.target.value)} />
                </div>
                <div className="tf-row">
                  <label>FSI / FAR</label>
                  <input type="number" min="0" step="0.1" value={fsi} onChange={(e) => setFsi(e.target.value)} />
                </div>
              </div>
              <div className="tf-row">
                <label>Ground Coverage %</label>
                <input type="number" min="0" max="100" value={coverage} onChange={(e) => setCoverage(e.target.value)} />
              </div>
              <p className="tf-note">
                FSI/FAR and permissible ground coverage vary by city and plot size under local
                development control regulations — 1.5 and 65% are common residential defaults, but
                confirm the exact figures with your municipal corporation before finalising.
              </p>
              <div className="plot-result">
                <div><span>Max buildable area</span><strong>{fmtInt(plot.maxBuildable)} {unit}</strong></div>
                <div><span>Suggested floors</span><strong>{plot.suggestedFloors === 1 ? 'Ground only (G)' : `G + ${plot.suggestedFloors - 1}`}</strong></div>
                <div><span>Per-floor built-up area</span><strong>{fmtInt(plot.perFloorArea)} {unit}</strong></div>
              </div>
              <button type="button" className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={applyPlotResult}>
                {justApplied ? '✓ Applied to calculator' : 'Use this estimate'}
              </button>
            </div>
          )}

          <div className="tf-row">
            <label>Number of Floors (incl. ground)</label>
            <select value={floors} onChange={(e) => setFloors(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((f) => (
                <option key={f} value={f}>
                  {f === 1 ? 'Ground only (G)' : `G + ${f - 1}`}
                </option>
              ))}
            </select>
          </div>
          <div className="tf-row">
            <label>Construction Quality</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value as QualityKey)}>
              {(Object.keys(QUALITY) as QualityKey[]).map((k) => (
                <option key={k} value={k}>{QUALITY[k].label}</option>
              ))}
            </select>
          </div>
          <div className="tf-row">
            <label>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value as LocationKey)}>
              {(Object.keys(LOCATION) as LocationKey[]).map((k) => (
                <option key={k} value={k}>{LOCATION[k].label}</option>
              ))}
            </select>
          </div>
          <p className="tf-note">
            Estimates cover civil structure + finishing + basic MEP for a self-built RCC framed house.
            Land, approvals, interiors/furniture and architect fees are not included.
          </p>

          {/* ── Save & compare ── */}
          <div className="tf-sec-title">Your Estimates</div>
          {!namingOpen ? (
            <button type="button" className="add-item-btn" onClick={() => setNamingOpen(true)}>
              <SaveIcon size={15} color="currentColor" style={{ marginRight: 6 }} />
              Save this estimate
            </button>
          ) : (
            <div className="save-name-row">
              <input
                type="text" autoFocus placeholder="e.g. Pune House — Standard"
                value={estimateName} onChange={(e) => setEstimateName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveCurrent() }}
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={saveCurrent}>Save</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setNamingOpen(false); setEstimateName('') }}>Cancel</button>
            </div>
          )}

          {mounted && saved.length > 0 && (
            <div className="saved-list">
              {saved.map((s) => (
                <div className="saved-item" key={s.id}>
                  <div className="saved-item-info">
                    <div className="saved-item-name">{s.name}</div>
                    <div className="saved-item-meta">
                      {fmtInt(s.totalSqft)} sq ft · {QUALITY[s.quality].label.split(' — ')[0]} · {fmtMoney(s.low)}–{fmtMoney(s.high)}
                    </div>
                  </div>
                  <div className="saved-item-actions">
                    <button type="button" onClick={() => loadEstimate(s)} title="Load this estimate">Load</button>
                    <button type="button" onClick={() => deleteEstimate(s.id)} title="Delete" className="danger">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Results ── */}
        <div>
          <div className="tr-big">
            <div className="tr-big-label">Estimated Construction Cost</div>
            <div className="tr-big-num">
              {hasInput ? `${fmtMoney(r.low)} – ${fmtMoney(r.high)}` : '—'}
            </div>
            <div className="tr-big-sub">
              {hasInput
                ? `${fmtInt(r.totalSqft)} sq ft total built-up × ₹ ${fmtInt(r.rate)}/sq ft`
                : 'Enter your built-up area to see the estimate'}
            </div>
          </div>

          <div className="tr-tiles">
            <div className="tr-tile">
              <div className="tr-tile-label">Rate Applied</div>
              <div className="tr-tile-num">₹ {fmtInt(r.rate)}</div>
              <div className="tr-tile-sub">per sq ft</div>
            </div>
            <div className="tr-tile">
              <div className="tr-tile-label">Total Built-up</div>
              <div className="tr-tile-num">{fmtInt(r.totalSqft)}</div>
              <div className="tr-tile-sub">sq ft ({floors} floor{floors > 1 ? 's' : ''})</div>
            </div>
            <div className="tr-tile">
              <div className="tr-tile-label">Mid Estimate</div>
              <div className="tr-tile-num">{hasInput ? fmtMoney(r.cost) : '—'}</div>
              <div className="tr-tile-sub">±8% typical variation</div>
            </div>
          </div>

          <div className="pie-wrap">
            <div className="pie-chart" style={{ background: pieGradient }}>
              <div className="pie-hole">
                <div className="pie-hole-label">Cost Split</div>
                <div className="pie-hole-value">{hasInput ? fmtMoney(r.cost) : '—'}</div>
              </div>
            </div>
            <div className="pie-legend">
              {BREAKDOWN.map(([head, share, color]) => (
                <div className="pie-legend-item" key={head}>
                  <span className="pie-dot" style={{ background: color }} />
                  <span className="pie-legend-label">{head}</span>
                  <span className="pie-legend-pct">{Math.round(share * 100)}%</span>
                  <span className="pie-legend-amt">{hasInput ? fmtMoney(r.cost * share) : '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <button type="button" className="share-link-btn" onClick={() => window.print()}>
              <PrinterIcon size={15} color="currentColor" />
              Download PDF
            </button>
            <ShareButton />
          </div>

          {saved.length > 1 && (
            <>
              <div className="tf-sec-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CompareIcon size={14} color="currentColor" /> Compare Your Estimates
              </div>
              <div className="tool-table-wrap">
                <table className="tool-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th className="num">Built-up</th>
                      <th>Quality</th>
                      <th>Location</th>
                      <th className="num">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saved.map((s) => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td className="num">{fmtInt(s.totalSqft)} sq ft</td>
                        <td>{QUALITY[s.quality].label.split(' — ')[0]}</td>
                        <td>{LOCATION[s.location].label.split(' (')[0]}</td>
                        <td className="num">{fmtMoney(s.low)}–{fmtMoney(s.high)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="tool-table-wrap">
            <table className="tool-table">
              <thead>
                <tr>
                  <th>Material (approx.)</th>
                  <th className="num">Thumb Rule</th>
                  <th className="num">Your Quantity</th>
                </tr>
              </thead>
              <tbody>
                {MATERIALS.map(([name, perSqft, unitLabel]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td className="num">{perSqft} {unitLabel.split(' ')[0]}/sq ft</td>
                    <td className="num">
                      {hasInput ? `${fmtInt(r.totalSqft * perSqft)} ${unitLabel}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="tool-disclaimer">
            These are planning-stage estimates based on typical 2026 market rates and standard thumb
            rules for RCC framed residential construction. Actual cost varies with design, soil,
            material choices and local labour rates — get a detailed BOQ prepared before you build.
          </p>
        </div>
      </div>

      {mounted && createPortal(
        <div className="inv-print-root" aria-hidden="true">{reportSheet}</div>,
        document.body,
      )}
    </div>
  )
}
