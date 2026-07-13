import { getCategoryStyle } from './categoryStyle'

/**
 * Default cover for posts with no `coverImage` — a navy, blueprint-grid card
 * in the post's category colour, generated from real CSS rather than a stock
 * photo. Keeps every post visually on-brand even before an image is chosen.
 */
export default function BrandedCover({ categorySlug, category }: { categorySlug: string; category: string }) {
  const { Icon, color } = getCategoryStyle(categorySlug)
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#0f172a',
        backgroundImage: `
          repeating-linear-gradient(0deg, rgba(148,163,184,.09) 0, rgba(148,163,184,.09) 1px, transparent 1px, transparent 28px),
          repeating-linear-gradient(90deg, rgba(148,163,184,.09) 0, rgba(148,163,184,.09) 1px, transparent 1px, transparent 28px),
          radial-gradient(circle at 85% 15%, ${color}33 0%, transparent 55%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: `${color}22`,
          border: `1.5px solid ${color}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={30} color={color} />
      </div>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 14,
          left: 16,
          fontSize: '0.66rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.4)',
        }}
      >
        {category}
      </span>
    </div>
  )
}
