'use client'

import { useMemo, useState } from 'react'

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

/** Typical share of total cost for an Indian residential build. */
const BREAKDOWN: Array<[string, number]> = [
  ['Structure & masonry (RCC, walls, plaster)', 0.42],
  ['Finishing (flooring, tiles, paint, kitchen)', 0.28],
  ['Electrical & plumbing', 0.14],
  ['Doors & windows', 0.09],
  ['Site work & miscellaneous', 0.07],
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

const fmtInt = (n: number) => Math.round(n).toLocaleString('en-IN')

/** ₹ formatted the way Indian builders read money: 24.5 Lakh / 1.2 Cr. */
function fmtMoney(n: number): string {
  if (n >= 1e7) return `₹ ${(n / 1e7).toFixed(2)} Cr`
  if (n >= 1e5) return `₹ ${(n / 1e5).toFixed(1)} Lakh`
  return `₹ ${fmtInt(n)}`
}

export default function CostCalculator() {
  const [area, setArea] = useState('1000')
  const [unit, setUnit] = useState<'sqft' | 'sqm'>('sqft')
  const [floors, setFloors] = useState(1)
  const [quality, setQuality] = useState<QualityKey>('standard')
  const [location, setLocation] = useState<LocationKey>('tier2')

  const r = useMemo(() => {
    const perFloor = (parseFloat(area) || 0) * (unit === 'sqm' ? 10.764 : 1)
    const totalSqft = perFloor * floors
    const rate = QUALITY[quality].rate * LOCATION[location].mult
    const cost = totalSqft * rate
    return { totalSqft, rate, cost, low: cost * 0.92, high: cost * 1.08 }
  }, [area, unit, floors, quality, location])

  const hasInput = r.totalSqft > 0

  return (
    <div className="tool-panel fade-up in">
      <div className="tool-grid2">
        {/* ── Inputs ── */}
        <div className="tf">
          <div className="tf-sec-title first">Your building</div>
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

          <div className="tool-table-wrap">
            <table className="tool-table">
              <thead>
                <tr>
                  <th>Cost Head</th>
                  <th className="num">Share</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {BREAKDOWN.map(([head, share]) => (
                  <tr key={head}>
                    <td>{head}</td>
                    <td className="num">{Math.round(share * 100)}%</td>
                    <td className="num">{hasInput ? fmtMoney(r.cost * share) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
    </div>
  )
}
