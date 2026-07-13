import { ImageResponse } from 'next/og'
import fs from 'fs/promises'
import path from 'path'

export const ogImageSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

const FONT_DIR = path.join(process.cwd(), 'app', '(marketing)', 'blog', '_fonts')

// Read once at module scope — generateStaticParams invokes this route once per
// post at build time, and re-reading the font files on every call would be
// wasted build-time I/O multiplied by the post count.
const fontDataPromise = Promise.all([
  fs.readFile(path.join(FONT_DIR, 'PlusJakartaSans-ExtraBold.woff')),
  fs.readFile(path.join(FONT_DIR, 'PlusJakartaSans-Bold.woff')),
  fs.readFile(path.join(FONT_DIR, 'Inter-Medium.woff')),
]).then(([extrabold, bold, medium]) => ({ extrabold, bold, medium }))

export async function renderBlogOgImage({
  title,
  category,
  accent = '#818cf8',
}: {
  title: string
  category?: string
  accent?: string
}) {
  const fonts = await fontDataPromise
  const titleSize = title.length > 70 ? 42 : title.length > 45 ? 50 : 58

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          backgroundColor: '#0b1220',
          backgroundImage: 'linear-gradient(135deg, #111c2e 0%, #0b1220 60%)',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5, #1d4ed8)',
            }}
          >
            <span style={{ color: '#fff', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: 800 }}>A</span>
          </div>
          <span style={{ color: '#fff', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: 800, letterSpacing: -0.5 }}>
            ARC PEM
          </span>
          <span style={{ color: 'rgba(255,255,255,.4)', fontSize: 18 }}>/ Blog</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1000 }}>
          {category && (
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                background: `${accent}26`,
                border: `1px solid ${accent}66`,
                color: accent,
                fontSize: 20,
                fontFamily: 'Inter',
                fontWeight: 500,
                padding: '8px 20px',
                borderRadius: 100,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {category}
            </div>
          )}
          <div
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 3,
              overflow: 'hidden',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans',
              fontWeight: 800,
              fontSize: titleSize,
              lineHeight: 1.2,
              letterSpacing: -1,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', color: 'rgba(255,255,255,.45)', fontSize: 18 }}>arcpem.com/blog</div>
      </div>
    ),
    {
      ...ogImageSize,
      fonts: [
        { name: 'Plus Jakarta Sans', data: fonts.extrabold, weight: 800, style: 'normal' },
        { name: 'Plus Jakarta Sans', data: fonts.bold, weight: 700, style: 'normal' },
        { name: 'Inter', data: fonts.medium, weight: 500, style: 'normal' },
      ],
    },
  )
}
