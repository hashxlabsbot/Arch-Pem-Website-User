import { NextRequest, NextResponse } from 'next/server'
import { getActiveSession } from '@/lib/auth'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

export const dynamic = 'force-dynamic'

// Platform is a fixed whitelist; the paths come from env (never user input),
// so there is no path-traversal surface.
const FILE_PATHS: Record<string, string | undefined> = {
  win: process.env.DOWNLOAD_PATH_WIN,
  mac: process.env.DOWNLOAD_PATH_MAC,
}
const REMOTE_URLS: Record<string, string | undefined> = {
  win: process.env.DOWNLOAD_URL_WIN,
  mac: process.env.DOWNLOAD_URL_MAC,
}
const FILE_NAMES: Record<string, string> = {
  win: 'ArcPEM-Setup.exe',
  mac: 'ArcPEM-Setup.dmg',
}

export async function GET(req: NextRequest) {
  const session = await getActiveSession()
  if (!session) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/dashboard/downloads', req.url))
  }

  const platform = req.nextUrl.searchParams.get('platform') === 'mac' ? 'mac' : 'win'
  const localPath = FILE_PATHS[platform]
  const remoteUrl = REMOTE_URLS[platform]

  if (localPath) {
    const resolved = path.resolve(localPath)
    if (!fs.existsSync(resolved)) {
      return NextResponse.json({ error: 'File not found at configured path. Contact support.' }, { status: 503 })
    }
    const stat = fs.statSync(resolved)
    // Stream the installer rather than buffering it all in memory.
    const nodeStream = fs.createReadStream(resolved)
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${FILE_NAMES[platform] ?? path.basename(resolved)}"`,
        'Content-Length': String(stat.size),
        'Cache-Control': 'no-store',
      },
    })
  }

  if (remoteUrl && !remoteUrl.includes('example.com')) {
    return NextResponse.redirect(remoteUrl)
  }

  return NextResponse.json({ error: 'Download not available yet. Contact support.' }, { status: 503 })
}
