import { getCategoryStyle } from './categoryStyle'

/**
 * Default cover for posts with no `coverImage` — a drawn "site sheet" in the
 * post's category colour: an ink blueprint board with a small illustration that
 * says what the article is about (invoice, BOQ table, truck, skyline, app
 * window). Pure SVG, so it is crisp at any size and works in server and client
 * components. `.jn-art-*` hooks let the blog cards animate it on hover.
 */
const PAPER = '#efe9df'
const YELLOW = '#f5b400'

function Art({ slug, c }: { slug: string; c: string }) {
  switch (slug) {
    case 'gst-and-compliance':
      return (
        <g className="jn-art-float">
          <rect x="104" y="30" width="112" height="142" rx="2" fill={PAPER} />
          <rect x="116" y="44" width="52" height="8" fill="#12100d" />
          <rect x="116" y="60" width="88" height="3" fill="#bdb3a2" />
          <rect x="116" y="70" width="88" height="3" fill="#bdb3a2" />
          <rect x="116" y="80" width="66" height="3" fill="#bdb3a2" />
          <rect x="116" y="100" width="88" height="1.5" fill="#12100d" />
          <rect x="116" y="108" width="40" height="3" fill="#bdb3a2" />
          <rect x="176" y="108" width="28" height="3" fill="#12100d" />
          <rect x="116" y="118" width="40" height="3" fill="#bdb3a2" />
          <rect x="176" y="118" width="28" height="3" fill="#12100d" />
          <rect x="116" y="132" width="88" height="14" fill="#12100d" />
          <rect x="124" y="137" width="30" height="4" fill={YELLOW} />
          <g transform="translate(206 138) rotate(-14)">
            <circle r="26" fill="none" stroke={c} strokeWidth="3" />
            <circle r="20" fill="none" stroke={c} strokeWidth="1" />
            <text textAnchor="middle" y="6" fontFamily="Big Shoulders Display, Impact, sans-serif" fontWeight="900" fontSize="20" fill={c}>GST</text>
          </g>
        </g>
      )
    case 'boq-and-cost-estimation':
      return (
        <g className="jn-art-float">
          <rect x="62" y="34" width="196" height="132" rx="2" fill={PAPER} />
          <rect x="62" y="34" width="196" height="20" fill="#12100d" />
          <rect x="72" y="41" width="40" height="6" fill={YELLOW} />
          <rect x="196" y="41" width="52" height="6" fill="#8f867a" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x="72" y={66 + i * 24} width="64" height="5" fill="#12100d" />
              <rect x="72" y={76 + i * 24} width="40" height="3" fill="#bdb3a2" />
              <rect className="jn-art-bar" style={{ ['--i' as string]: i }} x="150" y={64 + i * 24} width={[92, 66, 78, 48][i]} height="12" fill={i === 0 ? c : '#12100d'} />
            </g>
          ))}
        </g>
      )
    case 'vendor-and-contractor-management':
      return (
        <g className="jn-art-float">
          <line x1="20" y1="158" x2="300" y2="158" stroke="#8f867a" strokeWidth="2" strokeDasharray="10 8" />
          <rect x="74" y="78" width="124" height="66" rx="2" fill={PAPER} />
          <rect x="82" y="88" width="30" height="22" fill={c} />
          <rect x="118" y="88" width="30" height="22" fill="#12100d" />
          <rect x="154" y="88" width="34" height="22" fill={YELLOW} />
          <path d="M198 100 h34 l22 22 v22 h-56z" fill={c} />
          <path d="M214 108 h14 l12 14 h-26z" fill="#12100d" opacity=".85" />
          <circle cx="104" cy="148" r="14" fill="#12100d" /><circle cx="104" cy="148" r="5" fill={PAPER} />
          <circle cx="230" cy="148" r="14" fill="#12100d" /><circle cx="230" cy="148" r="5" fill={PAPER} />
        </g>
      )
    case 'case-studies':
      return (
        <g className="jn-art-float">
          <rect x="56" y="108" width="40" height="56" fill={PAPER} />
          <rect x="108" y="78" width="40" height="86" fill={c} />
          <rect x="160" y="52" width="40" height="112" fill={PAPER} />
          <rect x="212" y="88" width="40" height="76" fill="#12100d" stroke={PAPER} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((r) => [0, 1].map((k) => (
            <rect key={`${r}${k}`} x={168 + k * 16} y={62 + r * 20} width="9" height="9" fill={r % 2 ? '#12100d' : YELLOW} />
          )))}
          <polyline points="40,138 98,110 150,92 204,58 262,36" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M250 32 l16 2 -4 16" fill="none" stroke={YELLOW} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )
    case 'product-guides':
      return (
        <g className="jn-art-float">
          <rect x="52" y="30" width="216" height="140" rx="3" fill={PAPER} />
          <rect x="52" y="30" width="216" height="18" fill="#12100d" />
          <circle cx="64" cy="39" r="3" fill={c} /><circle cx="75" cy="39" r="3" fill={YELLOW} /><circle cx="86" cy="39" r="3" fill="#8f867a" />
          <rect x="52" y="48" width="48" height="122" fill="#d9d1c2" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x="60" y={58 + i * 18} width="32" height="6" fill={i === 1 ? c : '#12100d'} />)}
          <rect x="112" y="58" width="68" height="40" fill="#12100d" />
          <rect x="190" y="58" width="68" height="40" fill={c} />
          <polyline points="112,150 140,128 166,138 200,112 258,118" fill="none" stroke="#12100d" strokeWidth="3" />
          <rect x="112" y="108" width="146" height="2" fill="#bdb3a2" />
        </g>
      )
    default:
      return (
        <g className="jn-art-float">
          <rect x="108" y="36" width="104" height="128" fill="none" stroke={PAPER} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="108" x2="212" y1={62 + i * 25} y2={62 + i * 25} stroke={PAPER} strokeWidth="1" />)}
          <rect x="108" y="36" width="104" height="26" fill={c} />
        </g>
      )
  }
}

export default function BrandedCover({ categorySlug, category }: { categorySlug: string; category: string }) {
  const { color } = getCategoryStyle(categorySlug)
  const id = `jn-g-${categorySlug || 'x'}`
  return (
    <div className="jn-cover" aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#1c1a17', overflow: 'hidden' }}>
      <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="rgba(239,233,223,.07)" strokeWidth="1" />
          </pattern>
          <radialGradient id={`${id}-r`} cx="82%" cy="14%" r="70%">
            <stop offset="0" stopColor={color} stopOpacity=".38" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill={`url(#${id})`} />
        <rect width="320" height="200" fill={`url(#${id}-r)`} />
        <rect x="0" y="0" width="320" height="6" fill={color} />
        <Art slug={categorySlug} c={color} />
      </svg>
      <span
        style={{
          position: 'absolute', left: 14, bottom: 10, fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(239,233,223,.55)',
        }}
      >
        {category}
      </span>
    </div>
  )
}
