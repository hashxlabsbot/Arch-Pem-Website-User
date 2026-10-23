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

/** The official ARC PEM app icon (same file as the favicon). */
export function ArcAppIcon({ size = 28, className }: G) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/arc-icon.png" width={size} height={size} alt="" aria-hidden="true" className={className} style={{ display: 'block', flexShrink: 0, borderRadius: Math.round(size * 0.22) }} />
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

