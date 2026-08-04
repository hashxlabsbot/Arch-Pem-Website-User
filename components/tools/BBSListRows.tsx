'use client'

import type { BarSpec, ColumnLift, SpacingZone } from '@/lib/bbs'
import { formatLength, parseLengthMm, type BareUnit, type UnitMode } from '@/lib/units'

/**
 * Editors for the two list-shaped inputs a real drawing needs: a bar group that
 * mixes diameters ("2-20Ø + 1-16Ø") and a run of tightened stirrup spacing
 * ("@4\" c/c over 3'-6\" at each end").
 *
 * Both store canonical millimetres and re-render through the active unit mode,
 * so a project keeps working when the mode changes.
 */

export function BarSpecRows({
  title, specs, onChange,
}: {
  title: string
  specs: BarSpec[]
  onChange: (next: BarSpec[]) => void
}) {
  const patch = (i: number, p: Partial<BarSpec>) =>
    onChange(specs.map((s, k) => (k === i ? { ...s, ...p } : s)))

  return (
    <>
      {specs.map((s, i) => (
        <div className="item-row" key={i}>
          <div className="item-row-grid bbs-2">
            <input
              type="number" min="0" step="1" inputMode="numeric"
              value={s.count || ''}
              aria-label={`${title} row ${i + 1} — number of bars`}
              placeholder="Nos"
              onChange={(e) => patch(i, { count: parseFloat(e.target.value) || 0 })}
            />
            <input
              type="number" min="0" step="1" inputMode="numeric"
              value={s.diaMm || ''}
              aria-label={`${title} row ${i + 1} — diameter in mm`}
              placeholder="Dia (mm)"
              onChange={(e) => patch(i, { diaMm: parseFloat(e.target.value) || 0 })}
            />
            <button
              type="button" className="item-del"
              aria-label={`Remove ${title} row ${i + 1}`}
              onClick={() => onChange(specs.filter((_, k) => k !== i))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="add-item-btn" onClick={() => onChange([...specs, { diaMm: 0, count: 0 }])}>
        + Add another diameter
      </button>
    </>
  )
}

export function SpacingZoneRows({
  title, zones, onChange, mode,
}: {
  title: string
  zones: SpacingZone[]
  onChange: (next: SpacingZone[]) => void
  mode: UnitMode
}) {
  // Zone length reads like a span (feet); spacing reads like a c/c value (inches).
  const num = (raw: string, bareUnit: BareUnit) => {
    const r = parseLengthMm(raw, { mode, bareUnit })
    return r.ok ? r.mm : 0
  }
  const patch = (i: number, p: Partial<SpacingZone>) =>
    onChange(zones.map((z, k) => (k === i ? { ...z, ...p } : z)))

  return (
    <>
      {zones.map((z, i) => (
        <div className="item-row" key={i}>
          <div className="item-row-grid bbs-2">
            <input
              type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
              defaultValue={formatLength(z.lengthMm, mode)}
              key={`${mode}-len-${i}`}
              aria-label={`${title} zone ${i + 1} — length from the support`}
              placeholder={mode === 'ftin' ? `3'-6"` : 'Length'}
              onChange={(e) => patch(i, { lengthMm: num(e.target.value, 'ft') })}
            />
            <input
              type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
              defaultValue={formatLength(z.spacingMm, mode)}
              key={`${mode}-sp-${i}`}
              aria-label={`${title} zone ${i + 1} — spacing`}
              placeholder={mode === 'ftin' ? '4"' : 'Spacing'}
              onChange={(e) => patch(i, { spacingMm: num(e.target.value, 'in') })}
            />
            <button
              type="button" className="item-del"
              aria-label={`Remove ${title} zone ${i + 1}`}
              onClick={() => onChange(zones.filter((_, k) => k !== i))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="add-item-btn" onClick={() => onChange([...zones, { lengthMm: 0, spacingMm: 0 }])}>
        + Add a tightened zone
      </button>
    </>
  )
}

/**
 * One row per storey of a column mark: a level label, its height, and the main
 * bars for that lift. Ties are shared across lifts, which is how a real column
 * schedule is drawn — only the reinforcement changes per level.
 */
export function ColumnLiftRows({
  lifts, onChange, mode,
}: {
  lifts: ColumnLift[]
  onChange: (next: ColumnLift[]) => void
  mode: UnitMode
}) {
  const patch = (i: number, p: Partial<ColumnLift>) =>
    onChange(lifts.map((l, k) => (k === i ? { ...l, ...p } : l)))
  const heightMm = (raw: string) => {
    const r = parseLengthMm(raw, { mode, bareUnit: 'ft' })
    return r.ok ? r.mm : 0
  }

  return (
    <>
      {lifts.map((l, i) => (
        <div className="item-row" key={i}>
          <div className="item-row-grid bbs-lift">
            <input
              type="text" autoComplete="off"
              value={l.label}
              aria-label={`Lift ${i + 1} — level name`}
              placeholder="Level, e.g. 2nd-Fdn"
              onChange={(e) => patch(i, { label: e.target.value })}
            />
            <input
              type="text" inputMode="decimal" autoComplete="off" spellCheck={false}
              defaultValue={formatLength(l.heightMm, mode)}
              key={`${mode}-h-${i}`}
              aria-label={`Lift ${i + 1} — clear height`}
              placeholder={mode === 'ftin' ? `9'-10"` : 'Height'}
              onChange={(e) => patch(i, { heightMm: heightMm(e.target.value) })}
            />
            <button
              type="button" className="item-del"
              aria-label={`Remove lift ${i + 1}`}
              onClick={() => onChange(lifts.filter((_, k) => k !== i))}
            >
              ✕
            </button>
          </div>
          <div className="bbs-lift-bars">
            <BarSpecRows
              title={`Lift ${i + 1} main bar`}
              specs={l.mainBars}
              onChange={(next) => patch(i, { mainBars: next })}
            />
          </div>
        </div>
      ))}
      <button type="button" className="add-item-btn" onClick={() => onChange([...lifts, { label: '', heightMm: 0, mainBars: [] }])}>
        + Add a storey / lift
      </button>
    </>
  )
}
