'use client'

import { useId } from 'react'
import { echoFor, parseLengthMm, type BareUnit, type UnitMode } from '@/lib/units'

/**
 * A length field that accepts whatever notation the drawing uses and always
 * echoes the value back in the *other* unit.
 *
 * The echo is the tool's main catcher for transcription slips — a 9" section
 * typed as 9 mm, or a 15' span typed into a millimetre field, shows up
 * immediately. It's wired via aria-describedby rather than aria-live, which
 * would announce on every keystroke.
 */
export default function BBSLengthInput({
  label, value, onChange, mode, bareUnit, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mode: UnitMode
  bareUnit: BareUnit
  placeholder?: string
}) {
  const id = useId()
  const parsed = parseLengthMm(value, { mode, bareUnit })
  const bad = !parsed.ok && parsed.reason !== 'empty'
  const echo = parsed.ok
    ? echoFor(parsed.mm, mode)
    : parsed.reason === 'empty' ? '' : parsed.message

  return (
    <div className="tf-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-describedby={`${id}-echo`}
        onChange={(e) => onChange(e.target.value)}
      />
      {/* Rendered even when empty so the row keeps its height and the layout
          doesn't jump as the user types. */}
      <span id={`${id}-echo`} className={`tf-echo${bad ? ' is-bad' : ''}`}>
        {echo || ' '}
      </span>
      {parsed.ok && parsed.notes.length > 0 && (
        <span className="tf-echo is-bad">{parsed.notes[0]}</span>
      )}
    </div>
  )
}
