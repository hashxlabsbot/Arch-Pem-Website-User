/**
 * ARC PEM logo redrawn as SVG in the "Site Ledger" palette (marketing site).
 * Same mark as /logo.png — building bars over an arc, divider, ARC PEM
 * wordmark and tagline — recoloured to brick / ink / safety yellow.
 * The dashboard, emails and OG image keep /logo.png.
 */
export default function LedgerLogo({ height = 34, onDark = false }: { height?: number; onDark?: boolean }) {
  const ink = onDark ? '#f3efe7' : '#1c1a17'
  return (
    <svg viewBox="0 0 248 80" height={height} style={{ display: 'block', width: 'auto', flexShrink: 0 }} role="img" aria-label="ARC PEM — Plan · Engineer · Manage">
      {/* mark */}
      <path d="M6 62 V34 L18 28 V58 Z" fill="#e0703f" />
      <path d="M22 58 V16 L34 10 V58 Z" fill="#b9502c" />
      <rect x="38" y="3" width="12" height="55" fill={ink} />
      {[53, 56, 59, 62].map((x) => <rect key={x} x={x} y="22" width="1.6" height="36" fill="#f5b400" />)}
      <path d="M66 58 V30 L76 36 V58 Z" fill="#e0703f" />
      <path d="M2 72 Q40 52 80 72" fill="none" stroke="#b9502c" strokeWidth="3.2" strokeLinecap="round" />
      {/* divider */}
      <rect x="88" y="12" width="2" height="56" fill={ink} />
      {/* wordmark */}
      <text x="100" y="52" fontFamily="'Big Shoulders Display', Impact, sans-serif" fontWeight="900" fontSize="46" letterSpacing="0.5" fill={ink}>ARC</text>
      <text x="176" y="52" fontFamily="'Big Shoulders Display', Impact, sans-serif" fontWeight="900" fontSize="46" letterSpacing="0.5" fill="#b9502c">PEM</text>
      <text x="101" y="68" fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontWeight="600" fontSize="8.4" letterSpacing="1.4" fill={onDark ? '#b3a998' : '#6b6457'}>PLAN · ENGINEER · MANAGE</text>
    </svg>
  )
}
