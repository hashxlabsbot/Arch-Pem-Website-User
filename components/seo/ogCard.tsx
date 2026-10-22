import { ImageResponse } from 'next/og'
import fs from 'fs/promises'
import path from 'path'

/**
 * Branded 1200×630 share card for link previews (WhatsApp, LinkedIn, X, Slack) and answer-engine citations.
 * One card per page, built from the page's own words, so a shared link says what the page is.
 * Fonts are the same files the blog card uses; they are read once at module scope.
 */
export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const FONT_DIR = path.join(process.cwd(), 'app', '(marketing)', 'blog', '_fonts')
// The official ARC PEM icon (same file as the favicon), inlined because the image renderer can't fetch from /public.
const iconData = fs
  .readFile(path.join(process.cwd(), 'public', 'arc-icon.png'))
  .then((b) => `data:image/png;base64,${b.toString('base64')}`)
const fontData = Promise.all([
  fs.readFile(path.join(FONT_DIR, 'PlusJakartaSans-ExtraBold.woff')),
  fs.readFile(path.join(FONT_DIR, 'PlusJakartaSans-Bold.woff')),
  fs.readFile(path.join(FONT_DIR, 'Inter-Medium.woff')),
  iconData,
]).then(([extrabold, bold, medium, icon]) => ({ extrabold, bold, medium, icon }))

export async function renderOgCard({
  kicker,
  title,
  sub,
  footer = 'arcpem.com',
  chips = [],
}: {
  /** Small uppercase label above the title: "Glossary", "For contractors", "Compare". */
  kicker: string
  title: string
  /** One supporting line under the title. */
  sub?: string
  footer?: string
  chips?: string[]
}) {
  const f = await fontData
  const titleSize = title.length > 80 ? 44 : title.length > 55 ? 52 : title.length > 34 ? 62 : 72

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          fontFamily: 'Inter',
          color: '#fff',
          backgroundColor: '#060b16',
          backgroundImage:
            'radial-gradient(circle at 88% 8%, rgba(99,102,241,0.55) 0%, rgba(99,102,241,0) 46%), radial-gradient(circle at 6% 100%, rgba(14,165,233,0.38) 0%, rgba(14,165,233,0) 44%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={f.icon} width={56} height={56} style={{ borderRadius: 13 }} />
            <span style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: 30, letterSpacing: 1 }}>ARC PEM</span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '9px 22px',
              borderRadius: 100,
              border: '1px solid rgba(165,180,252,0.45)',
              background: 'rgba(99,102,241,0.18)',
              color: '#c7d2fe',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1020 }}>
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 800,
              fontSize: titleSize,
              lineHeight: 1.12,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
          {sub && (
            <div style={{ display: 'flex', color: '#94a3b8', fontSize: 28, lineHeight: 1.4, fontWeight: 500, maxWidth: 940 }}>{sub}</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {chips.map((c) => (
              <div
                key={c}
                style={{
                  display: 'flex',
                  padding: '8px 18px',
                  borderRadius: 100,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: '#e2e8f0',
                  fontSize: 20,
                  fontWeight: 500,
                }}
              >
                {c}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', color: 'rgba(255,255,255,0.5)', fontSize: 22, fontWeight: 500 }}>{footer}</div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: 'Plus Jakarta Sans', data: f.extrabold, weight: 800, style: 'normal' },
        { name: 'Plus Jakarta Sans', data: f.bold, weight: 700, style: 'normal' },
        { name: 'Inter', data: f.medium, weight: 500, style: 'normal' },
      ],
    },
  )
}
