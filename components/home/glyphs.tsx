/* Small custom glyphs for the home-page illustrations (no emoji, no third-party logos). */

type G = { size?: number; className?: string }

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
})

/** ARC PEM app icon — same arch mark as the hero's app window. */
export function ArcAppIcon({ size = 28, className }: G) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" className={className} aria-hidden="true">
      <rect width="44" height="44" rx="11" fill="#3b82f6" />
      <path d="M11 34 L11 21 Q11 8 22 8 Q33 8 33 21 L33 34" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7" y1="34" x2="37" y2="34" stroke="white" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

/** Spreadsheet grid */
export function SheetGlyph({ size = 16, className }: G) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M3.5 9h17M3.5 14.5h17M9.5 3.5v17" />
    </svg>
  )
}

/** Spiral notebook — the supervisor's muster register */
export function NotebookGlyph({ size = 16, className }: G) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="5" y="3" width="15" height="18" rx="2" />
      <path d="M3 7h3M3 12h3M3 17h3M10 8h6M10 12h6M10 16h3" />
    </svg>
  )
}

/** Keyboard — entries retyped by hand */
export function KeyboardGlyph({ size = 16, className }: G) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9" />
    </svg>
  )
}

/** Crumpled paper bill */
export function SlipGlyph({ size = 16, className }: G) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  )
}

export function MonitorGlyph({ size = 16, className }: G) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  )
}

export function DatabaseGlyph({ size = 16, className }: G) {
  return (
    <svg {...base(size)} className={className}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" />
      <path d="M4.5 5.5v13c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-13" />
      <path d="M4.5 12c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8" />
    </svg>
  )
}

